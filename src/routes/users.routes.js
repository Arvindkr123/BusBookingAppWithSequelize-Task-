const router = require("express").Router();
const usersController = require("../controllers/users.controllers");

router.route("/")
    .post(usersController.create)
    .get(usersController.list);

router.route("/:id")
    .get(usersController.get)
    .put(usersController.update)
    .patch(usersController.update)
    .delete(usersController.remove);

module.exports = router;