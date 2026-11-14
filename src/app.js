require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./utils/db');
const { ensureAuthSchema } = require('./utils/auth-schema');
const { ensureBootstrapAdmin } = require('./utils/admin-bootstrap');
const usersRoutes = require('./routes/users.routes');
const busesRoutes = require('./routes/buses.routes');
const bookingsRoutes = require('./routes/booking.routes');
const paymentsRoutes = require('./routes/payments.routes');
const { errorHandler } = require('./controllers/controller.utils');
require('./models/users.models');
require('./models/buses.models');
require('./models/bookings.models');
require('./models/payments.models');


const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/users', usersRoutes);
app.use('/api/buses', busesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);

app.get("/", (req, res) => {
    res.send("Bus booking API is running");
})

app.use(errorHandler);

async function startServer() {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        throw new Error("JWT_SECRET must be set to a secret of at least 32 characters");
    }
    if (process.env.ADMIN_SIGNUP_CODE && !/^[0-9]{6}$/.test(process.env.ADMIN_SIGNUP_CODE)) {
        throw new Error("ADMIN_SIGNUP_CODE must be exactly six digits");
    }

    await sequelize.sync({ force: false });
    await ensureAuthSchema(sequelize);
    await ensureBootstrapAdmin();

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exitCode = 1;
});
