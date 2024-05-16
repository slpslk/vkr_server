import { Router } from 'express'
import { GatewaysController } from '../controllers/index.js'

const router = Router()

router.get('/api/gateways', GatewaysController.sendGatewayStorage)
router.delete('/api/gateways', GatewaysController.deleteFromGatewayStorage)
router.post('/api/gateways/ethernet', GatewaysController.createEthernetGateway)
router.post('/api/gateways/wifi', GatewaysController.createWiFiGateway)
router.post('/api/gateways/ble', GatewaysController.createBLEGateway)
router.patch('/api/gateways/:id', GatewaysController.changeGateway)
router.post('/api/gateways/:id/add', GatewaysController.connectDeviceToGateway)
router.delete('/api/gateways/:id/delete', GatewaysController.disconnectDeviceFromGateway)
router.get('/api/gateways/:id/devices', GatewaysController.getGatewayDevices)


export default router;