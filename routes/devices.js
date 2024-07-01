import { Router } from 'express'
import { DevicesController } from '../controllers/index.js'
import checkAuth from '../utils/checkAuth.js'
import checkApiToken from '../utils/checkApiToken.js'
import checkPersonalBroker from '../utils/checkPersonalBroker.js'

const router = Router()

router.get('/api/devices', checkAuth, DevicesController.sendDeviceStorage)
router.delete('/api/devices', checkAuth, DevicesController.deleteFromDeviceStorage)
router.post('/api/devices/temperature', checkAuth, checkApiToken, checkPersonalBroker, DevicesController.createTemperatureSensor)
router.post('/api/devices/humidity', checkAuth, checkApiToken, checkPersonalBroker, DevicesController.createHumiditySensor)
router.post('/api/devices/lighting', checkAuth, checkApiToken, checkPersonalBroker, DevicesController.createLightingSensor)
router.post('/api/devices/noise', checkAuth, checkApiToken, checkPersonalBroker, DevicesController.createNoiseSensor)
router.post('/api/devices/lamp', checkAuth, checkApiToken, checkPersonalBroker, DevicesController.createLampDevice)
router.post('/api/devices/:id', checkAuth, DevicesController.controlDevice)
router.post('/api/devices/:id/event', checkAuth, DevicesController.makeDeviceEvent)
router.post('/api/devices/:id/turn', checkAuth, DevicesController.changeDeviceStatus)
router.patch('/api/devices/:id', checkAuth, DevicesController.changeDevice)
router.post('/api/devices/:id/reconnect', checkAuth, DevicesController.reconnectDevice)
router.get('/api/devices/:id', checkAuth, DevicesController.getDeviceData)

export default router;