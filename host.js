import express from 'express'
import cors from 'cors'
import * as http from 'http'
import deviceRoutes from './routes/devices.js'
import gatewayRoutes from './routes/gateways.js'
import userRoutes from './routes/user.js'
import authRouter from './routes/autorization.js'
import mongoose from 'mongoose'

const app = express(), server = http.createServer(app);
const host = 'localhost', port = 8000;

app.use(cors({
    origin: "http://localhost:3000"
}))
app.use(express.json())
app.use(deviceRoutes)
app.use(gatewayRoutes)
app.use(userRoutes)
app.use(authRouter)


async function main() {
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/test");
        server.listen(port, host, () =>
            console.log(`Server listens http://${host}:${port}`)
        );
        console.log("Сервер ожидает подключения...");
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


