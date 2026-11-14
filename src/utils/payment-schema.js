const { DataTypes } = require("sequelize");

async function ensurePaymentSchema(sequelize) {
    const queryInterface = sequelize.getQueryInterface();
    const columns = await queryInterface.describeTable("Payments");

    if (!columns.razorpayOrderId) {
        await queryInterface.addColumn("Payments", "razorpayOrderId", {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true,
        });
    }

    if (!columns.razorpayPaymentId) {
        await queryInterface.addColumn("Payments", "razorpayPaymentId", {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true,
        });
    }

    const bookingColumns = await queryInterface.describeTable("Bookings");
    if (!bookingColumns.status) {
        await queryInterface.addColumn("Bookings", "status", {
            type: DataTypes.ENUM("PENDING_PAYMENT", "CONFIRMED", "CANCELLED"),
            allowNull: false,
            defaultValue: "CONFIRMED",
        });
    }
}

module.exports = { ensurePaymentSchema };
