const { UserModel } = require("../models/users.models");
const createCrudController = require("./crud.controller");

module.exports = createCrudController(UserModel, ["name", "email"]);