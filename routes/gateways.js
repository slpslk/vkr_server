import { Router } from 'express'
import { GatewaysController } from '../controllers/index.js'
import checkAuth from '../utils/checkAuth.js'

const router = Router()

router.get('/api/gateways', checkAuth, GatewaysController.sendGatewayStorage)
router.delete('/api/gateways', checkAuth, GatewaysController.deleteFromGatewayStorage)
router.post('/api/gateways/ethernet', checkAuth, GatewaysController.createEthernetGateway)
router.post('/api/gateways/wifi', checkAuth, GatewaysController.createWiFiGateway)
router.post('/api/gateways/ble', checkAuth, GatewaysController.createBLEGateway)
router.patch('/api/gateways/:id', checkAuth, GatewaysController.changeGateway)
router.post('/api/gateways/:id/add', checkAuth, GatewaysController.connectDeviceToGateway)
router.delete('/api/gateways/:id/delete', checkAuth, GatewaysController.disconnectDeviceFromGateway)
router.get('/api/gateways/:id/devices', checkAuth, GatewaysController.getGatewayDevices)


export default router;