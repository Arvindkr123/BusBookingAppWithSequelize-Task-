const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/db");

const BusModel = sequelize.define("Buses", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    busNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    totalSeats: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
        },
    },
    availableSeats: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
        },
    },
}, {
    tableName: "Buses",
    timestamps: false,
    validate: {
        availableSeatsCannotExceedTotal() {
            if (this.availableSeats > this.totalSeats) {
                throw new Error("availableSeats cannot exceed totalSeats");
            }
        },
    },
});

module.exports = { BusModel };