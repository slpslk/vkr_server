import { Router } from 'express'
import { createTemperatureSensor,controlTemperatureSensor, sendDeviceStorage, deleteFromDeviceStorage, getSensorData, reconnectDevice } from '../controllers/devices.js'

const router = Router()

router.get('/api/devices', sendDeviceStorage)
router.delete('/api/devices', deleteFromDeviceStorage)
router.post('/api/devices/temperature', createTemperatureSensor)
router.post('/api/devices/temperature/:id', controlTemperatureSensor)
router.post('/api/devices/temperature/:id/reconnect', reconnectDevice)
router.get('/api/devices/:type/:id', getSensorData)

export default router;