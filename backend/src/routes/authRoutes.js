const express = require("express");
const router = express.Router()

const login = require("../controllers/authController");
const validate = require("../middlewares/validateMiddleware");

router.post('/login', validate(['username', 'password']), login.loginUser);

module.exports = router;
