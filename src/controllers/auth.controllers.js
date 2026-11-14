const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/users.models");
const { asyncHandler, getBody, HttpError } = require("./controller.utils");

const tokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
};

function publicUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
}

function normalizeCredentials(body, includeName) {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 150) {
        throw new HttpError(400, "Enter a valid email address");
    }

    if (includeName) {
        const name = typeof body.name === "string" ? body.name.trim() : "";
        if (!name || name.length > 100) {
            throw new HttpError(400, "Name must be between 1 and 100 characters");
        }
        return { name, email, password };
    }

    return { email, password };
}

function validatePassword(password) {
    const byteLength = Buffer.byteLength(password, "utf8");
    if (password.length < 12 || byteLength > 72) {
        throw new HttpError(400, "Password must be at least 12 characters and no more than 72 bytes");
    }
}

function verifyAdminSignupCode(providedCode, expectedCode = process.env.ADMIN_SIGNUP_CODE) {
    if (typeof providedCode !== "string" || typeof expectedCode !== "string") {
        return false;
    }
    if (!/^[0-9]{6}$/.test(providedCode) || !/^[0-9]{6}$/.test(expectedCode)) {
        return false;
    }

    const provided = Buffer.from(providedCode, "utf8");
    const expected = Buffer.from(expectedCode, "utf8");
    return provided.length === expected.length
        && crypto.timingSafeEqual(provided, expected);
}

function setSessionCookie(res, user) {
    const token = jwt.sign(
        { role: user.role },
        process.env.JWT_SECRET,
        { subject: String(user.id), expiresIn: "1h" },
    );
    res.cookie("busbooking_token", token, {
        ...tokenCookieOptions,
        maxAge: 60 * 60 * 1000,
    });
}

async function register(req, res, role) {
    const body = getBody(req);
    const { name, email, password } = normalizeCredentials(body, true);
    validatePassword(password);
    if (role === "ADMIN") {
        if (!process.env.ADMIN_SIGNUP_CODE) {
            throw new HttpError(503, "Administrator signup is not configured");
        }
        if (!verifyAdminSignupCode(body.adminCode)) {
            throw new HttpError(403, "Administrator invitation code is invalid");
        }
    }

    const user = await UserModel.create({
        name,
        email,
        passwordHash: await bcrypt.hash(password, 12),
        role,
    });
    setSessionCookie(res, user);
    res.status(201).json({ user: publicUser(user) });
}

module.exports = {
    register: asyncHandler((req, res) => register(req, res, "USER")),
    registerAdmin: asyncHandler((req, res) => register(req, res, "ADMIN")),

    login: asyncHandler(async (req, res) => {
        const body = getBody(req);
        const { email, password } = normalizeCredentials(body, false);
        if (!password) {
            throw new HttpError(400, "Password is required");
        }

        const user = await UserModel.findOne({ where: { email } });
        const passwordMatches = user && user.passwordHash
            ? await bcrypt.compare(password, user.passwordHash)
            : false;
        if (!passwordMatches) {
            throw new HttpError(401, "Email or password is incorrect");
        }

        setSessionCookie(res, user);
        res.json({ user: publicUser(user) });
    }),

    me: asyncHandler(async (req, res) => {
        const user = await UserModel.findByPk(req.auth.userId);
        if (!user) {
            throw new HttpError(401, "Your session is invalid or has expired");
        }
        res.json({ user: publicUser(user) });
    }),

    logout: (req, res) => {
        res.clearCookie("busbooking_token", tokenCookieOptions);
        res.status(204).end();
    },

    publicUser,
    validatePassword,
    verifyAdminSignupCode,
};
