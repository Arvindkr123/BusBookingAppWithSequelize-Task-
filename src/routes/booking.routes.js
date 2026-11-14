const router = require("express").Router();
const bookingsController = require("../controllers/booking.controllers");
const { requireAuth, requireAdmin } = require("../middleware/auth.middleware");

router.post("/", requireAuth, bookingsController.create);
router.get("/mine", requireAuth, bookingsController.listMine);
router.get("/occupied", bookingsController.listOccupiedSeats);
router.get("/", requireAuth, requireAdmin, bookingsController.list);

router.route("/:id")
    .get(requireAuth, bookingsController.get)
    .put(requireAuth, requireAdmin, bookingsController.update)
    .patch(requireAuth, requireAdmin, bookingsController.update)
    .delete(requireAuth, requireAdmin, bookingsController.remove);

module.exports = router;