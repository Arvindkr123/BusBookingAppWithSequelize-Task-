const router = require("express").Router();
const usersController = require("../controllers/users.controllers");
const authController = require("../controllers/auth.controllers");
const { requireAuth, requireAdmin } = require("../middleware/auth.middleware");
const { rateLimit } = require("express-rate-limit");

const adminSignupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many admin signup attempts. Try again later." },
});

router.post("/", authController.register);
router.post("/signup", authController.register);
router.post("/admin/signup", adminSignupLimiter, authController.registerAdmin);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);
router.get("/", requireAuth, requireAdmin, usersController.list);

router.route("/:id")
    .get(requireAuth, requireAdmin, usersController.get)
    .put(requireAuth, requireAdmin, usersController.update)
    .patch(requireAuth, requireAdmin, usersController.update)
    .delete(requireAuth, requireAdmin, usersController.remove);

module.exports = router;