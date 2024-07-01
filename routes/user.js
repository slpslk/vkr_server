import { Router } from 'express'
import { UserController } from '../controllers/index.js'
import checkAuth from '../utils/checkAuth.js'

const router = Router()

router.get('/api/user/tokenAPI', checkAuth, UserController.sendUserTokenAPI)
router.post('/api/user/tokenAPI', checkAuth, UserController.addUserAPIToken)
router.get('/api/user/broker', checkAuth, UserController.sendBrokerInfo)
router.post('/api/user/broker', checkAuth, UserController.addUserBroker)
router.post('/api/user/broker/control', checkAuth, UserController.controlUserBroker)


export default router;