import { Router } from 'express'
import { DevicesController } from '../controllers/index.js'
import checkAuth from '../utils/checkAuth.js'

const router = Router()

router.get('/api/devices', DevicesController.sendDeviceStorage)
router.delete('/api/devices', DevicesController.deleteFromDeviceStorage)
router.post('/api/devices/temperature', checkAuth, DevicesController.createTemperatureSensor)
router.post('/api/devices/humidity', checkAuth, DevicesController.createHumiditySensor)
router.post('/api/devices/lighting', checkAuth, DevicesController.createLightingSensor)
router.post('/api/devices/lamp', checkAuth, DevicesController.createLampDevice)
router.post('/api/devices/:id', DevicesController.controlDevice)
router.post('/api/devices/:id/turn', DevicesController.changeDeviceStatus)
router.patch('/api/devices/:id', DevicesController.changeDevice)
router.post('/api/devices/:id/reconnect', DevicesController.reconnectDevice)
router.get('/api/devices/:id', DevicesController.getDeviceData)

export default router;