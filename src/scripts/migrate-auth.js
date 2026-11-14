require("dotenv").config();

const { sequelize } = require("../utils/db");
const { ensureAuthSchema } = require("../utils/auth-schema");
require("../models/users.models");

async function migrate() {
    await sequelize.sync({ force: false });
    await ensureAuthSchema(sequelize);
    console.log("Authentication schema is ready");
}

migrate()
    .catch((error) => {
        console.error("Authentication schema migration failed:", error);
        process.exitCode = 1;
    })
    .finally(() => sequelize.close());
