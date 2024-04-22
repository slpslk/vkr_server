import { Router } from 'express'
import { createTemperatureSensor,controlTemperatureSensor, sendDeviceStorage } from '../controllers/devices.js'

const router = Router()

router.get('/api/devices', sendDeviceStorage)
router.post('/api/devices/temperature', createTemperatureSensor)
router.post('/api/devices/temperature/:id', controlTemperatureSensor)

export default router;