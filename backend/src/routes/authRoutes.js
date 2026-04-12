const express = require("express");
const router = express.Router()

const login = require("../controllers/authController");
const validate = require("../middlewares/validateMiddleware");

const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 menit
  max: 5, // 5 attempts
  message: 'Terlalu banyak percobaan login, coba lagi nanti',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', validate(['username', 'password']), loginLimiter, login.loginUser);

module.exports = router;
