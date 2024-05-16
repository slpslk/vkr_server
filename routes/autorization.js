import { Router } from 'express'
import { AuthController } from '../controllers/index.js'
const router = Router()

router.post('/auth/register', AuthController.registration)
router.post('auth/login', AuthController.login)

export default router;