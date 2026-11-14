const { BusModel } = require("../models/buses.models");
const createCrudController = require("./crud.controller");

module.exports = createCrudController(BusModel, [
    "busNumber",
    "totalSeats",
    "availableSeats",
]);