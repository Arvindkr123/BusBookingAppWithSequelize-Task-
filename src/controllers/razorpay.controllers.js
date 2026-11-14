const Razorpay = require("razorpay");
const { sequelize } = require("../utils/db");
const { BookingModel } = require("../models/bookings.models");
const { BusModel } = require("../models/buses.models");
const { PaymentModel } = require("../models/payments.models");
const { UserModel } = require("../models/users.models");
const { verifyPaymentSignature, verifyWebhookSignature } = require("../utils/razorpay-signatures");
const {
    asyncHandler,
    getBody,
    getId,
    HttpError,
} = require("./controller.utils");

function getRazorpay() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
        throw new HttpError(
            503,
            "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the backend environment.",
        );
    }
    return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

function getFare() {
    const fare = Number(process.env.BUS_FARE_INR || 30);
    if (!Number.isSafeInteger(fare) || fare < 1 || fare > 99999999) {
        throw new HttpError(500, "BUS_FARE_INR must be a positive whole number");
    }
    return fare;
}

function publicPayment(payment) {
    return {
        id: payment.id,
        amountPaid: payment.amountPaid,
        paymentStatus: payment.paymentStatus,
        bookingId: payment.bookingId,
    };
}

async function updatePaymentAndBooking(payment, paymentValues, bookingStatus) {
    await sequelize.transaction(async (transaction) => {
        const lockedPayment = await PaymentModel.findByPk(payment.id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });
        if (!lockedPayment) {
            return;
        }
        if (
            lockedPayment.paymentStatus === "SUCCESS"
            && paymentValues.paymentStatus !== "SUCCESS"
        ) {
            return;
        }

        const booking = await BookingModel.findByPk(lockedPayment.bookingId, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });
        if (bookingStatus === "CONFIRMED" && booking?.status === "CANCELLED") {
            throw new HttpError(409, "This reservation was cancelled and cannot be confirmed");
        }
        if (
            booking
            && bookingStatus === "CONFIRMED"
            && booking.status === "PENDING_PAYMENT"
        ) {
            await booking.update({ status: "CONFIRMED" }, { transaction });
        }
        await lockedPayment.update(paymentValues, { transaction });
    });
}

function expectedAmountPaise(payment) {
    return Math.round(Number(payment.amountPaid) * 100);
}

function isMatchingCapturedPayment(gatewayPayment, payment, orderId) {
    return gatewayPayment
        && gatewayPayment.order_id === orderId
        && gatewayPayment.status === "captured"
        && gatewayPayment.currency === "INR"
        && gatewayPayment.amount === expectedAmountPaise(payment);
}

async function syncCapturedOrder(razorpay, payment, orderId) {
    const response = await razorpay.orders.fetchPayments(orderId);
    const capturedPayment = (response.items || []).find(
        (item) => isMatchingCapturedPayment(item, payment, orderId),
    );
    if (!capturedPayment) {
        return false;
    }
    await updatePaymentAndBooking(
        payment,
        {
            paymentStatus: "SUCCESS",
            razorpayPaymentId: capturedPayment.id,
        },
        "CONFIRMED",
    );
    return true;
}

async function reservationForCheckout(body, userId) {
    if (body.bookingId !== undefined) {
        const booking = await BookingModel.findByPk(getId(body.bookingId, "bookingId"));
        if (!booking) {
            throw new HttpError(404, "Booking not found");
        }
        if (booking.userId !== userId) {
            throw new HttpError(403, "You cannot pay for this booking");
        }
        return booking;
    }

    const busId = getId(body.busId, "busId");
    const seatNumber = getId(body.seatNumber, "seatNumber");
    return sequelize.transaction(async (transaction) => {
        const bus = await BusModel.findByPk(busId, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });
        if (!bus) {
            throw new HttpError(404, "Bus not found");
        }
        if (seatNumber > bus.totalSeats) {
            throw new HttpError(400, "seatNumber must not exceed the bus totalSeats");
        }
        if (bus.availableSeats < 1) {
            throw new HttpError(409, "The bus has no available seats");
        }

        const booking = await BookingModel.create(
            {
                userId,
                busId,
                seatNumber,
                status: "PENDING_PAYMENT",
            },
            { transaction },
        );
        await bus.update(
            { availableSeats: bus.availableSeats - 1 },
            { transaction },
        );
        return booking;
    });
}

async function createOrderForBooking(booking, user, res, razorpay, fare) {
    let payment = await PaymentModel.findOne({
        where: { bookingId: booking.id },
    });

    if (payment?.paymentStatus === "SUCCESS") {
        throw new HttpError(409, "This booking has already been paid");
    }
    if (booking.status === "CANCELLED") {
        throw new HttpError(409, "This reservation was cancelled. Please choose another seat.");
    }
    if (booking.status !== "PENDING_PAYMENT") {
        throw new HttpError(409, "This reservation is already confirmed");
    }

    if (!payment) {
        payment = await PaymentModel.create({
            amountPaid: fare,
            paymentStatus: "PENDING",
            bookingId: booking.id,
        });
    }

    let order;
    if (payment.razorpayOrderId) {
        order = await razorpay.orders.fetch(payment.razorpayOrderId);
        if (order.amount !== expectedAmountPaise(payment) || order.currency !== "INR") {
            throw new HttpError(409, "Saved Razorpay order amount does not match this reservation");
        }
        if (order.status === "paid") {
            const paid = await syncCapturedOrder(razorpay, payment, order.id);
            return res.json(paid
                ? { paid: true, orderId: order.id, bookingId: booking.id }
                : { processing: true, orderId: order.id, bookingId: booking.id });
        }
    } else {
        try {
            order = await razorpay.orders.create({
                amount: fare * 100,
                currency: "INR",
                receipt: `booking_${booking.id}_${Date.now()}`,
                partial_payment: false,
                notes: {
                    bookingId: String(booking.id),
                    userId: String(user.id),
                },
            });
        } catch (error) {
            await payment.update({ paymentStatus: "FAILED" });
            throw error;
        }

        await payment.update({
            amountPaid: fare,
            paymentStatus: "PENDING",
            razorpayOrderId: order.id,
            razorpayPaymentId: null,
        });
    }

    return res.json({
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        bookingId: booking.id,
        name: user.name,
        email: user.email,
    });
}

module.exports = {
    getFare: (req, res, next) => {
        try {
            return res.json({ amount: getFare(), currency: "INR" });
        } catch (error) {
            return next(error);
        }
    },

    createCheckout: asyncHandler(async (req, res) => {
        const body = getBody(req);
        const user = await UserModel.findByPk(req.auth.userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        const razorpay = getRazorpay();
        const fare = getFare();
        const booking = await reservationForCheckout(body, req.auth.userId);
        await createOrderForBooking(booking, user, res, razorpay, fare);
    }),

    verifyPayment: asyncHandler(async (req, res) => {
        const body = getBody(req);
        const orderId = body.razorpay_order_id;
        const paymentId = body.razorpay_payment_id;
        const signature = body.razorpay_signature;
        if (
            typeof orderId !== "string"
            || typeof paymentId !== "string"
            || typeof signature !== "string"
        ) {
            throw new HttpError(400, "Razorpay payment details are incomplete");
        }

        const payment = await PaymentModel.findOne({
            where: { razorpayOrderId: orderId },
        });
        if (!payment) {
            throw new HttpError(404, "Payment order not found");
        }
        const booking = await BookingModel.findByPk(payment.bookingId);
        if (!booking || booking.userId !== req.auth.userId) {
            throw new HttpError(404, "Payment order not found");
        }
        if (!verifyPaymentSignature(
            payment.razorpayOrderId,
            paymentId,
            signature,
            process.env.RAZORPAY_KEY_SECRET,
        )) {
            throw new HttpError(400, "Razorpay payment signature is invalid");
        }

        const razorpay = getRazorpay();
        const gatewayPayment = await razorpay.payments.fetch(paymentId);
        if (
            gatewayPayment.order_id !== orderId
            || gatewayPayment.currency !== "INR"
            || gatewayPayment.amount !== expectedAmountPaise(payment)
        ) {
            throw new HttpError(400, "Razorpay payment does not match this order");
        }

        if (gatewayPayment.status === "captured") {
            await updatePaymentAndBooking(
                payment,
                {
                    paymentStatus: "SUCCESS",
                    razorpayPaymentId: gatewayPayment.id,
                },
                "CONFIRMED",
            );
        } else if (gatewayPayment.status === "failed") {
            await updatePaymentAndBooking(
                payment,
                {
                    paymentStatus: "FAILED",
                    razorpayPaymentId: gatewayPayment.id,
                },
                null,
            );
        }

        const refreshedPayment = await PaymentModel.findByPk(payment.id);
        return res.json(publicPayment(refreshedPayment));
    }),

    listMine: asyncHandler(async (req, res) => {
        const bookings = await BookingModel.findAll({
            where: { userId: req.auth.userId },
            attributes: ["id"],
        });
        if (bookings.length === 0) {
            return res.json([]);
        }

        const payments = await PaymentModel.findAll({
            where: { bookingId: bookings.map((booking) => booking.id) },
            order: [["id", "ASC"]],
        });
        return res.json(payments.map(publicPayment));
    }),

    getMineByOrder: asyncHandler(async (req, res) => {
        const payment = await PaymentModel.findOne({
            where: { razorpayOrderId: req.params.orderId },
        });
        if (!payment) {
            throw new HttpError(404, "Payment order not found");
        }

        const booking = await BookingModel.findByPk(payment.bookingId);
        if (!booking || booking.userId !== req.auth.userId) {
            throw new HttpError(404, "Payment order not found");
        }
        return res.json(publicPayment(payment));
    }),

    webhook: asyncHandler(async (req, res) => {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!webhookSecret) {
            throw new HttpError(
                503,
                "Razorpay webhook is not configured. Set RAZORPAY_WEBHOOK_SECRET.",
            );
        }
        const signature = req.get("x-razorpay-signature");
        if (!verifyWebhookSignature(req.body, signature, webhookSecret)) {
            throw new HttpError(400, "Invalid Razorpay webhook signature");
        }

        let event;
        try {
            event = JSON.parse(req.body.toString("utf8"));
        } catch (error) {
            throw new HttpError(400, "Invalid Razorpay webhook payload");
        }

        const gatewayPayment = event.payload?.payment?.entity;
        if (
            event.event !== "payment.captured"
            && event.event !== "payment.failed"
        ) {
            return res.json({ received: true });
        }
        if (!gatewayPayment?.order_id) {
            return res.json({ received: true });
        }

        const payment = await PaymentModel.findOne({
            where: { razorpayOrderId: gatewayPayment.order_id },
        });
        if (!payment) {
            return res.json({ received: true });
        }
        if (
            gatewayPayment.currency !== "INR"
            || gatewayPayment.amount !== expectedAmountPaise(payment)
        ) {
            throw new HttpError(400, "Razorpay webhook payment does not match the order");
        }

        if (event.event === "payment.captured" && gatewayPayment.status === "captured") {
            await updatePaymentAndBooking(
                payment,
                {
                    paymentStatus: "SUCCESS",
                    razorpayPaymentId: gatewayPayment.id,
                },
                "CONFIRMED",
            );
        } else if (event.event === "payment.failed") {
            await updatePaymentAndBooking(
                payment,
                {
                    paymentStatus: "FAILED",
                    razorpayPaymentId: gatewayPayment.id,
                },
                null,
            );
        }

        return res.json({ received: true });
    }),
};
