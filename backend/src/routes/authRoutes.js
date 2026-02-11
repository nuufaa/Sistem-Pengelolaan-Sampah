const express = require("express");
const router = express.Router()

const login = require("../controllers/AuthController");
const validate = require("../middlewares/ValidateMiddleware");

router.post('/login', validate(['username', 'password']), login)

export default router
