const { DataTypes } = require("sequelize");

async function ensureAuthSchema(sequelize) {
    const queryInterface = sequelize.getQueryInterface();
    const columns = await queryInterface.describeTable("Users");

    if (!columns.passwordHash) {
        await queryInterface.addColumn("Users", "passwordHash", {
            type: DataTypes.STRING(255),
            allowNull: true,
        });
    }

    if (!columns.role) {
        await queryInterface.addColumn("Users", "role", {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "USER",
        });
    }
}

module.exports = { ensureAuthSchema };
