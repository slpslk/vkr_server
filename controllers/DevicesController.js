import { TemperatureSensor } from "../devices/sensors/temperature.js";
import { HumiditySensor } from "../devices/sensors/humidity.js";
import { LightingSensor } from "../devices/sensors/lighting.js";
import { NoiseSensor } from "../devices/sensors/noise.js";
import { Lamp } from "../devices/controlled/lamp.js";
import {DeviceStorage, GatewayStorage, UserStorage} from "../storages/index.js";
// import {getUserTokenAPI} from "../storages/userStorage.js"
import {saveDevice, getDevices, updateDevice, deleteDeviceFromDB} from '../models/Device.js'

const sensorTypes = ["temperature", "humidity", "lighting", "noise"]
const controlledTypes = ["lamp"]

export function deviceReplacer(key, value) {
  if (key == 'gateway' && value !== null) {
    return {
      name: value.name,
      type: value.type
    }
  }
  if (key == 'mqttClient') {
    return value == 'none' ? null : 'MqttClient'
  }
  if (key == 'intervalID') {
    return "Timer"
  }
  if (key == 'eventTimeout') {
    return "eventTimeout"
  }
  else return value;
}

export const sendDeviceStorage = async (req, res) => {
  
  if(DeviceStorage.deviceStorage.length == 0) {
    res.json(null)
  }
  else {
    console.log(DeviceStorage.deviceStorage)
    res.json(JSON.stringify(DeviceStorage.deviceStorage, deviceReplacer))
  }
}

export const deleteFromDeviceStorage = async(req, res) => {
  const deviceID = req.body["deviceID"];
  const currentDevice = DeviceStorage.deviceStorage.find((device) => device.id === deviceID);
  console.log(currentDevice)
  if (currentDevice.gateway != null) {
    const currentGateway = GatewayStorage.gatewayStorage.find((gateway) => gateway.id === currentDevice.gateway);
    console.log(currentGateway)
    currentGateway.deleteDevice(currentDevice)
  }

  await deleteDeviceFromDB(deviceID)
  DeviceStorage.deleteDevice(deviceID)

  res.json({message: "success"})
}



export const createTemperatureSensor = async (req, res) => {
  const requestData = req.body;
  const newDevice = new TemperatureSensor(requestData);

  await saveDevice(newDevice.id, req.userId, newDevice.type, requestData)

  DeviceStorage.addDevice(newDevice)
  console.log(req.body);
  console.log(newDevice);
  res.json({ message: "success", "new device id": newDevice.id });
};

export const createLightingSensor = async(req, res) => {
  const requestData = req.body;
  const newDevice = new LightingSensor(requestData);

  await saveDevice(newDevice.id, req.userId, newDevice.type, requestData)

  DeviceStorage.addDevice(newDevice)
  console.log(req.body);
  console.log(newDevice);
  res.json({ message: "success", "new device id": newDevice.id });
};


export const createNoiseSensor = async(req, res) => {
  const requestData = req.body;
  const newDevice = new NoiseSensor(requestData);

  await saveDevice(newDevice.id, req.userId, newDevice.type, requestData)

  DeviceStorage.addDevice(newDevice)
  console.log(req.body);
  console.log(newDevice);
  res.json({ message: "success", "new device id": newDevice.id });
};

export const createHumiditySensor = async(req, res) => {
  const requestData = req.body;
  const newDevice = new HumiditySensor(requestData);

  await saveDevice(newDevice.id, req.userId, newDevice.type, requestData)

  DeviceStorage.addDevice(newDevice)
  
  console.log(newDevice);
  console.log(req.body);
  res.json({ message: "success", "new device id": newDevice.id });
};

export const createLampDevice = async (req, res) => {
  const requestData = req.body;
  const newDevice = new Lamp(requestData);

  await saveDevice(newDevice.id, req.userId, newDevice.type, requestData)

  DeviceStorage.addDevice(newDevice)
  console.log(req.body);
  console.log(newDevice);
  res.json({ message: "success", "new device id": newDevice.id });
};

export const changeDeviceStatus = async (req, res) => {
  const deviceID = req.params["id"];
  const status = req.body.status
  const currentDevice = DeviceStorage.deviceStorage.find((device) => device.id === deviceID);
  const userToken = UserStorage.getUserTokenAPI();

  if (currentDevice === undefined) {
    res.status(404).json({ error: "Устройство не найдено" });
  }
  else if (userToken === null) {
    res.status(404).json({ error: "Токен пользователя не указан" });
  }
  else {
    const response = await currentDevice.changeDeviceStatus(status, userToken)
    res.json(response);
  }
};

export const changeDevice = async (req, res) => {
  const deviceID = req.params["id"];
  const changedData = req.body
  const currentDevice = DeviceStorage.deviceStorage.find((device) => device.id === deviceID);

  await updateDevice(deviceID, changedData)
  currentDevice.changeProperties(changedData)

  console.log(currentDevice)

  res.json({ message: "success" });
}


export const controlDevice = async (req, res) => {
  const id = req.params["id"];
  const currentDevice = DeviceStorage.deviceStorage.find((device) => device.id === id);
  let currentType;

  if(sensorTypes.find((type) => type === currentDevice.type) !== undefined) {
    currentType = "sensor"
  }
  else {
    currentType = "controlled"
  }

  if (currentDevice === undefined) {
    res.status(404).json({ error: "Устройство не найдено" });
  } else {
    if (currentDevice.broker == "rightech" || UserStorage.userBrokerWorking()){ //|| userBrokerExists() 
      if (UserStorage.getUserTokenAPI() !== null){
        if (req.body.control == true) {
          if (await currentDevice.connect()) {
            if (currentType == "sensor") {
              currentDevice.work();
            }
            res.json({ message: "success" , operation: "connect and start"});
          }
          else {
            if (currentDevice.connectionError) {
              res.status(404).json({error: "Невозможно подключиться, проверьте параметры подключения!"});
            }
            else {
            res.status(404).json({ error: "Невозможно подключиться, убедитесь, что устройство подключено к шлюзу!"});
            }
          }
        }
        else {
          currentDevice.disconnect();
          res.json({ message: "success", operation: "disconnect and off" });
        }
      }
      else {
        res.status(404).json({ error: "Токен пользователя не указан. Укажите токен на странице настроек или используйте пользовательский брокер"});
      }
    }
    else {
      res.status(404).json({ error: "Пользовательский брокер не запущен."});
    }
  }
};


export async function makeDeviceEvent (req, res) {
  const id = req.params["id"];
  const eventType = req.body.eventType
  const currentDevice = DeviceStorage.deviceStorage.find((device) => device.id === id);

  if(currentDevice === undefined) {
    res.status(404).json({ error: "Устройство не найдено" });
  }
  else {
    console.log(req.body)
    if (eventType == 'noise') {
      currentDevice.noiseEvent()
    }
    res.json({ message: "success"});
  }
}


export async function getDeviceData (req, res) {
  const id = req.params["id"];
  const currentDevice = DeviceStorage.deviceStorage.find((device) => device.id === id);
  const userToken = UserStorage.getUserTokenAPI();

  if(currentDevice === undefined) {
    res.status(404).json({ error: "Устройство не найдено" });
  }
  else if (userToken === null) {
    res.status(404).json({ error: "Токен пользователя не указан" });
  }
  else {
    const response = await currentDevice.getCurrentData(userToken)
    res.json(response);
  }
}

export const reconnectDevice = (req, res) => {
  const id = req.params["id"];
  const currentDevice = DeviceStorage.deviceStorage.find((device) => device.id === id);
  let currentType;
  if(sensorTypes.find((type) => type === currentDevice.type) !== undefined) {
    currentType = "sensor"
  }
  else {
    currentType = "controlled"
  }

  if(currentDevice === undefined) {
    res.status(404).json({ error: "Устройство не найдено" });
  }
  else {
    if (currentDevice.reconnect()) {
      if (currentType == "sensor") {
        currentDevice.work();
      }
      res.json({ message: "success", operation: "reconnected" })
    }
    else {
      res.status(404).json({ error: "Ошибка при переподключении" });
    }
  }
}
