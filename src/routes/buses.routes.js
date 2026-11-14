const router = require("express").Router();
const busesController = require("../controllers/buses.controllers");
const { requireAuth, requireAdmin } = require("../middleware/auth.middleware");

router.route("/")
    .post(requireAuth, requireAdmin, busesController.create)
    .get(busesController.list);

router.route("/:id")
    .get(busesController.get)
    .put(requireAuth, requireAdmin, busesController.update)
    .patch(requireAuth, requireAdmin, busesController.update)
    .delete(requireAuth, requireAdmin, busesController.remove);

module.exports = router;