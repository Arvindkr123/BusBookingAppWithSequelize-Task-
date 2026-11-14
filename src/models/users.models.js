const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/db");

const UserModel = sequelize.define("Users", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
    },
    passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "USER",
        validate: {
            isIn: [["USER", "ADMIN"]],
        },
    },
}, {
    tableName: "Users",
    timestamps: false,
});

module.exports = { UserModel };