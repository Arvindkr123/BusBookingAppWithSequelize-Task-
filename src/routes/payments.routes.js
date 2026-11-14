const router = require("express").Router();
const paymentsController = require("../controllers/payment.controllers");
const { requireAuth, requireAdmin } = require("../middleware/auth.middleware");

router.route("/")
    .post(requireAuth, requireAdmin, paymentsController.create)
    .get(requireAuth, requireAdmin, paymentsController.list);

router.route("/:id")
    .get(requireAuth, requireAdmin, paymentsController.get)
    .put(requireAuth, requireAdmin, paymentsController.update)
    .patch(requireAuth, requireAdmin, paymentsController.update)
    .delete(requireAuth, requireAdmin, paymentsController.remove);

module.exports = router;