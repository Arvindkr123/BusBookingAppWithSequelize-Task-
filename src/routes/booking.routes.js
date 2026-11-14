const router = require("express").Router();
const bookingsController = require("../controllers/booking.controllers");

router.route("/")
    .post(bookingsController.create)
    .get(bookingsController.list);

router.route("/:id")
    .get(bookingsController.get)
    .put(bookingsController.update)
    .patch(bookingsController.update)
    .delete(bookingsController.remove);

module.exports = router;