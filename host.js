import express from 'express'
import cors from 'cors'
import * as http from 'http'
import deviceRoutes from './routes/devices.js'
import gatewayRoutes from './routes/gateways.js'
import userRoutes from './routes/user.js'
import mongoose from 'mongoose'
import { initializeDevicesFromDB } from './deviceStorage.js'
import { initializeGatewaysFromDB } from './gatewayStorage.js'

const app = express(),
server = http.createServer(app);

const host = 'localhost', port = 8000;

// await mongoose.connect('mongodb://127.0.0.1:27017/test')
//   .then(() => console.log('Connected!'));

app.use(cors({
    origin: "http://localhost:3000"
}))
app.use(express.json())
app.use(deviceRoutes)
app.use(gatewayRoutes)
app.use(userRoutes)

async function initializeData() {
    await initializeDevicesFromDB()
    await initializeGatewaysFromDB()
}

async function main() {
 
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/test");
        server.listen(port, host, () =>
            console.log(`Server listens http://${host}:${port}`)
        );
        console.log("Сервер ожидает подключения...");
        await initializeData()
    }
    catch(err) {
        return console.log(err);
    }

    
}

main();
// прослушиваем прерывание работы программы (ctrl-c)
process.on("SIGINT", async() => {
    
    await mongoose.disconnect();
    console.log("Приложение завершило работу");
    process.exit();
});

// server.listen(port, host, () =>
//     console.log(`Server listens http://${host}:${port}`)
// );

