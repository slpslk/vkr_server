import express from 'express'
import cors from 'cors'
import * as http from 'http'
import deviceStorage from './deviceStorage.js'
import deviceRoutes from './routes/devices.js'
import gatewayRoutes from './routes/gateways.js'
import { TemperatureSensor } from './devices/temperature.js';
const app = express(),
server = http.createServer(app);

const host = 'localhost', port = 8000;

app.use(cors({
    origin: "http://localhost:3000"
}))
app.use(express.json())
app.use(deviceRoutes)
app.use(gatewayRoutes)


server.listen(port, host, () =>
    console.log(`Server listens http://${host}:${port}`)
);

