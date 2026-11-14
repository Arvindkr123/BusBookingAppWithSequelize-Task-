const { PaymentModel } = require("../models/payments.models");
const createCrudController = require("./crud.controller");

module.exports = createCrudController(PaymentModel, [
    "amountPaid",
    "paymentStatus",
    "bookingId",
]);