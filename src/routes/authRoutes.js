const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");
const {
  registerValidation,
  loginValidation,
} = require("../validations/userValidation");
const { validate } = require("../middleware/validationMiddleware");

router.post("/register", validate(registerValidation), register);
router.post("/login", validate(loginValidation), login);
router.post("/logout", verifyToken, logout);

module.exports = router;
