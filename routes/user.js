import { Router } from 'express'
import {addUserTokenAPI} from '../controllers/user.js'

const router = Router()

// router get('/api/user/cloudAPI', sendGatewayStorage)
router.post('/api/user/tokenAPI', addUserTokenAPI)

export default router;