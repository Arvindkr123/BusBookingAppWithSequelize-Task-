const { ValidationError } = require("sequelize");

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

const asyncHandler = (handler) => (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
};

function getId(value, fieldName = "id") {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id < 1) {
        throw new HttpError(400, `${fieldName} must be a positive integer`);
    }
    return id;
}

function getBody(req) {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
        throw new HttpError(400, "Request body must be a JSON object");
    }
    return req.body;
}

function pickFields(body, allowedFields) {
    const fields = {};
    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
            fields[field] = body[field];
        }
    }
    return fields;
}

function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ error: error.message });
    }

    if (error instanceof ValidationError) {
        return res.status(400).json({
            error: "Validation failed",
            details: error.errors.map((item) => item.message),
        });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({ error: "A record with these values already exists" });
    }

    if (error.name === "SequelizeForeignKeyConstraintError") {
        return res.status(409).json({
            error: "The operation conflicts with related records or references a missing record",
        });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
}

module.exports = {
    HttpError,
    asyncHandler,
    errorHandler,
    getBody,
    getId,
    pickFields,
};
