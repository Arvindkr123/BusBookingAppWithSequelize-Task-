const { Op } = require("sequelize");
const { sequelize } = require("../utils/db");
const { BookingModel } = require("../models/bookings.models");
const { BusModel } = require("../models/buses.models");
const { UserModel } = require("../models/users.models");
const {
    asyncHandler,
    getBody,
    getId,
    HttpError,
    pickFields,
} = require("./controller.utils");

const writableFields = ["userId", "busId", "seatNumber"];

function validateSeatNumber(seatNumber, bus) {
    if (seatNumber > bus.totalSeats) {
        throw new HttpError(400, "seatNumber must not exceed the bus totalSeats");
    }
}

module.exports = {
    create: asyncHandler(async (req, res) => {
        const body = getBody(req);
        const userId = req.auth.userId;
        const busId = getId(body.busId, "busId");
        const seatNumber = getId(body.seatNumber, "seatNumber");

        const booking = await sequelize.transaction(async (transaction) => {
            const user = await UserModel.findByPk(userId, { transaction });
            if (!user) {
                throw new HttpError(404, "User not found");
            }

            const bus = await BusModel.findByPk(busId, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });
            if (!bus) {
                throw new HttpError(404, "Bus not found");
            }
            validateSeatNumber(seatNumber, bus);
            if (bus.availableSeats < 1) {
                throw new HttpError(409, "The bus has no available seats");
            }

            const createdBooking = await BookingModel.create(
                { userId, busId, seatNumber, status: "PENDING_PAYMENT" },
                { transaction }
            );
            await bus.update(
                { availableSeats: bus.availableSeats - 1 },
                { transaction }
            );
            return createdBooking;
        });

        res.status(201).json(booking);
    }),

    list: asyncHandler(async (req, res) => {
        const bookings = await BookingModel.findAll({ order: [["id", "ASC"]] });
        res.json(bookings);
    }),

    listMine: asyncHandler(async (req, res) => {
        const bookings = await BookingModel.findAll({
            where: { userId: req.auth.userId },
            order: [["id", "ASC"]],
        });
        res.json(bookings);
    }),

    listOccupiedSeats: asyncHandler(async (req, res) => {
        const bookings = await BookingModel.findAll({
            attributes: ["busId", "seatNumber"],
            where: { status: { [Op.ne]: "CANCELLED" } },
            order: [["seatNumber", "ASC"]],
        });
        res.json(bookings);
    }),

    get: asyncHandler(async (req, res) => {
        const booking = await BookingModel.findByPk(getId(req.params.id));
        if (!booking) {
            throw new HttpError(404, "Booking not found");
        }
        if (req.auth.role !== "ADMIN" && booking.userId !== req.auth.userId) {
            throw new HttpError(403, "You cannot view this booking");
        }
        res.json(booking);
    }),

    update: asyncHandler(async (req, res) => {
        const fields = pickFields(getBody(req), writableFields);
        if (Object.keys(fields).length === 0) {
            throw new HttpError(400, "Provide at least one valid field to update");
        }

        const bookingId = getId(req.params.id);
        const updatedBooking = await sequelize.transaction(async (transaction) => {
            const booking = await BookingModel.findByPk(bookingId, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });
            if (!booking) {
                throw new HttpError(404, "Booking not found");
            }

            const userId = fields.userId === undefined
                ? booking.userId
                : getId(fields.userId, "userId");
            const oldBusId = booking.busId;
            const busId = fields.busId === undefined
                ? oldBusId
                : getId(fields.busId, "busId");
            const seatNumber = fields.seatNumber === undefined
                ? booking.seatNumber
                : getId(fields.seatNumber, "seatNumber");

            if (userId !== booking.userId && !(await UserModel.findByPk(userId, { transaction }))) {
                throw new HttpError(404, "User not found");
            }

            const busIds = [...new Set([oldBusId, busId])].sort((a, b) => a - b);
            const buses = {};
            for (const id of busIds) {
                buses[id] = await BusModel.findByPk(id, {
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });
            }

            const oldBus = buses[oldBusId];
            const newBus = buses[busId];
            if (!oldBus || !newBus) {
                throw new HttpError(404, "Bus not found");
            }
            validateSeatNumber(seatNumber, newBus);
            const holdsSeat = booking.status !== "CANCELLED";
            if (holdsSeat && busId !== oldBusId && newBus.availableSeats < 1) {
                throw new HttpError(409, "The bus has no available seats");
            }
            if (holdsSeat && busId !== oldBusId && oldBus.availableSeats >= oldBus.totalSeats) {
                throw new HttpError(409, "Bus seat availability is inconsistent");
            }

            await booking.update({ userId, busId, seatNumber }, { transaction });
            if (holdsSeat && busId !== oldBusId) {
                await oldBus.update(
                    { availableSeats: oldBus.availableSeats + 1 },
                    { transaction }
                );
                await newBus.update(
                    { availableSeats: newBus.availableSeats - 1 },
                    { transaction }
                );
            }
            return booking;
        });

        res.json(updatedBooking);
    }),

    remove: asyncHandler(async (req, res) => {
        const bookingId = getId(req.params.id);
        await sequelize.transaction(async (transaction) => {
            const booking = await BookingModel.findByPk(bookingId, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });
            if (!booking) {
                throw new HttpError(404, "Booking not found");
            }

            const bus = await BusModel.findByPk(booking.busId, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });
            if (!bus) {
                throw new HttpError(404, "Bus not found");
            }
            if (booking.status !== "CANCELLED") {
                if (bus.availableSeats >= bus.totalSeats) {
                    throw new HttpError(409, "Bus seat availability is inconsistent");
                }
                await bus.update(
                    { availableSeats: bus.availableSeats + 1 },
                    { transaction }
                );
            }

            await booking.destroy({ transaction });
        });
        res.status(204).end();
    }),
};