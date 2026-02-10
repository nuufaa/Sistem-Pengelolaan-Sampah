import express from 'express'
import login from '../controllers/authController.js'
import { validate } from '../middlewares/validateMiddleware.js'

const router = express.Router()

router.post('/login', validate(['username', 'password']), login)

export default router
