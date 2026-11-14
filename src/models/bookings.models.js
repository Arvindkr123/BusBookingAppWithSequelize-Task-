const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/db");

const BookingModel = sequelize.define("Bookings", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    seatNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Users",
            key: "id",
        },
    },
    busId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Buses",
            key: "id",
        },
    },
}, {
    tableName: "Bookings",
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ["busId", "seatNumber"],
        },
    ],
});

module.exports = { BookingModel };