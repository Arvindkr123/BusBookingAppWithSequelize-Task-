const router = require("express").Router();
const busesController = require("../controllers/buses.controllers");

router.route("/")
    .post(busesController.create)
    .get(busesController.list);

router.route("/:id")
    .get(busesController.get)
    .put(busesController.update)
    .patch(busesController.update)
    .delete(busesController.remove);

module.exports = router;