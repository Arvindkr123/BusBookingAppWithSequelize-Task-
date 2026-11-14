require('dotenv').config();

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./utils/db');
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
const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api/users', usersRoutes);
app.use('/api/buses', busesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);

app.get("/", (req, res) => {
    res.send("Hello world")
})

app.use(errorHandler);

sequelize.sync({ force: false }).then(() => {
    const startServer = async () => {
        try {
            // await sequelize.authenticate();
            app.listen(port, () => {
                console.log("server is running");
            });
        } catch (error) {
            console.error("Database connection failed:", error);
            process.exitCode = 1;
        }
    };
    startServer();
}).catch((err) => {
    console.log(err);
})
