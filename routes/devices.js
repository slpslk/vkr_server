import { Router } from 'express'
import { createTemperatureSensor, createHumiditySensor, createLightingSensor,
  controlDevice, sendDeviceStorage, deleteFromDeviceStorage, getDeviceData,
    reconnectDevice } from '../controllers/devices.js'

const router = Router()

router.get('/api/devices', sendDeviceStorage)
router.delete('/api/devices', deleteFromDeviceStorage)
router.post('/api/devices/temperature', createTemperatureSensor)
router.post('/api/devices/humidity', createHumiditySensor)
router.post('/api/devices/lighting', createLightingSensor)
router.post('/api/devices/:id', controlDevice)
router.patch('/api/devices/:id', )
router.post('/api/devices/:id/reconnect', reconnectDevice)
router.get('/api/devices/:id', getDeviceData)

export default router;