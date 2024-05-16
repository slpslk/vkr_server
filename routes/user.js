import { Router } from 'express'
import {addUserTokenAPI, recieveUserTokenAPI} from '../controllers/user.js'

const router = Router()

router.get('/api/user/tokenAPI', recieveUserTokenAPI)
router.post('/api/user/tokenAPI', addUserTokenAPI)

export default router;