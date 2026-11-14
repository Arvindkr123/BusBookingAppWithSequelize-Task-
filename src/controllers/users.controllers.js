const { UserModel } = require("../models/users.models");
const {
    asyncHandler,
    getBody,
    getId,
    HttpError,
    pickFields,
} = require("./controller.utils");
const { publicUser } = require("./auth.controllers");

module.exports = {
    list: asyncHandler(async (req, res) => {
        const users = await UserModel.findAll({ order: [["id", "ASC"]] });
        res.json(users.map(publicUser));
    }),

    get: asyncHandler(async (req, res) => {
        const user = await UserModel.findByPk(getId(req.params.id));
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        res.json(publicUser(user));
    }),

    update: asyncHandler(async (req, res) => {
        const fields = pickFields(getBody(req), ["name", "email"]);
        if (Object.keys(fields).length === 0) {
            throw new HttpError(400, "Provide at least one valid field to update");
        }

        const user = await UserModel.findByPk(getId(req.params.id));
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        await user.update(fields);
        res.json(publicUser(user));
    }),

    remove: asyncHandler(async (req, res) => {
        const userId = getId(req.params.id);
        if (userId === req.auth.userId) {
            throw new HttpError(409, "You cannot delete the account you are using");
        }

        const user = await UserModel.findByPk(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        await user.destroy();
        res.status(204).end();
    }),
};