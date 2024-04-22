import { Router } from 'express'
import { sendGatewayStorage, createEthernetGateway, connectDeviceToGateway,
createWiFiGateway,createBLEGateway, getGatewayDevices } from '../controllers/gateways.js'

const router = Router()

router.get('/api/gateways', sendGatewayStorage)
router.post('/api/gateways/ethernet', createEthernetGateway)
router.post('/api/gateways/wifi', createWiFiGateway)
router.post('/api/gateways/ble', createBLEGateway)
router.post('/api/gateways/:id/add', connectDeviceToGateway)
router.get('/api/gateways/:id/devices', getGatewayDevices)


export default router;