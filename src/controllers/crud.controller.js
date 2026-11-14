const {
    asyncHandler,
    getBody,
    getId,
    HttpError,
    pickFields,
} = require("./controller.utils");

function createCrudController(Model, writableFields) {
    return {
        create: asyncHandler(async (req, res) => {
            const fields = pickFields(getBody(req), writableFields);
            const record = await Model.create(fields);
            res.status(201).json(record);
        }),

        list: asyncHandler(async (req, res) => {
            const records = await Model.findAll({ order: [["id", "ASC"]] });
            res.json(records);
        }),

        get: asyncHandler(async (req, res) => {
            const record = await Model.findByPk(getId(req.params.id));
            if (!record) {
                throw new HttpError(404, "Record not found");
            }
            res.json(record);
        }),

        update: asyncHandler(async (req, res) => {
            const fields = pickFields(getBody(req), writableFields);
            if (Object.keys(fields).length === 0) {
                throw new HttpError(400, "Provide at least one valid field to update");
            }

            const record = await Model.findByPk(getId(req.params.id));
            if (!record) {
                throw new HttpError(404, "Record not found");
            }
            await record.update(fields);
            res.json(record);
        }),

        remove: asyncHandler(async (req, res) => {
            const record = await Model.findByPk(getId(req.params.id));
            if (!record) {
                throw new HttpError(404, "Record not found");
            }
            await record.destroy();
            res.status(204).end();
        }),
    };
}

module.exports = createCrudController;
