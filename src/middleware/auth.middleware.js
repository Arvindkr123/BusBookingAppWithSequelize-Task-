const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/users.models");
const { asyncHandler, HttpError } = require("../controllers/controller.utils");

function getToken(req) {
    const cookieToken = req.cookies && req.cookies.busbooking_token;
    if (cookieToken) {
        return cookieToken;
    }

    const authorization = req.get("authorization");
    if (authorization && authorization.startsWith("Bearer ")) {
        return authorization.slice(7);
    }
    return null;
}

const requireAuth = asyncHandler(async (req, res, next) => {
    const token = getToken(req);
    if (!token) {
        throw new HttpError(401, "Please sign in to continue");
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new HttpError(401, "Your session is invalid or has expired");
    }

    const userId = Number(payload.sub);
    if (!Number.isSafeInteger(userId) || userId < 1) {
        throw new HttpError(401, "Your session is invalid or has expired");
    }

    const user = await UserModel.findByPk(userId);
    if (!user) {
        throw new HttpError(401, "Your session is invalid or has expired");
    }

    req.auth = { userId: user.id, role: user.role };
    next();
});

function requireAdmin(req, res, next) {
    if (!req.auth) {
        return next(new HttpError(401, "Please sign in to continue"));
    }
    if (req.auth.role !== "ADMIN") {
        return next(new HttpError(403, "Administrator access is required"));
    }
    return next();
}

module.exports = { requireAuth, requireAdmin };
