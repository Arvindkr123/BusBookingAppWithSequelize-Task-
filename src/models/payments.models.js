const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/db");

const PaymentModel = sequelize.define("Payments", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    amountPaid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    paymentStatus: {
        type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED", "REFUNDED"),
        allowNull: false,
        defaultValue: "PENDING",
    },
    bookingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: "Bookings",
            key: "id",
        },
    },
    razorpayOrderId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
    },
    razorpayPaymentId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
    },
}, {
    tableName: "Payments",
    timestamps: false,
});

module.exports = { PaymentModel };
