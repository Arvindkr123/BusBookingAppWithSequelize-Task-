const bcrypt = require("bcryptjs");
const { UserModel } = require("../models/users.models");

async function ensureBootstrapAdmin() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email && !password) {
        return;
    }
    if (!email || !password) {
        throw new Error("Set both ADMIN_EMAIL and ADMIN_PASSWORD to configure the administrator account");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const passwordBytes = Buffer.byteLength(password, "utf8");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        throw new Error("ADMIN_EMAIL must be a valid email address");
    }
    if (password.length < 12 || passwordBytes > 72) {
        throw new Error("ADMIN_PASSWORD must be at least 12 characters and no more than 72 bytes");
    }

    let admin = await UserModel.findOne({ where: { email: normalizedEmail } });
    if (!admin) {
        admin = await UserModel.create({
            name: process.env.ADMIN_NAME || "Administrator",
            email: normalizedEmail,
            passwordHash: await bcrypt.hash(password, 12),
            role: "ADMIN",
        });
        console.log("Bootstrap administrator account created");
        return;
    }

    const changes = {};
    if (admin.role !== "ADMIN") {
        changes.role = "ADMIN";
    }
    if (!admin.passwordHash) {
        changes.passwordHash = await bcrypt.hash(password, 12);
    }
    if (Object.keys(changes).length > 0) {
        await admin.update(changes);
    }
}

module.exports = { ensureBootstrapAdmin };
