const router = require("express").Router();
const paymentsController = require("../controllers/payment.controllers");

router.route("/")
    .post(paymentsController.create)
    .get(paymentsController.list);

router.route("/:id")
    .get(paymentsController.get)
    .put(paymentsController.update)
    .patch(paymentsController.update)
    .delete(paymentsController.remove);

module.exports = router;