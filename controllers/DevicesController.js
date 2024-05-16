import { TemperatureSensor } from "../devices/sensors/temperature.js";
import { HumiditySensor } from "../devices/sensors/humidity.js";
import { LightingSensor } from "../devices/sensors/lighting.js";
import { Lamp } from "../devices/controlled/lamp.js";
import {deviceStorage, addDevice, deleteDevice} from "../deviceStorage.js";
import {getUserTokenAPI} from "../userStorage.js"
import { saveDevice, getDevices, updateDevice, deleteDeviceFromDB } from "../schemas.js";

const sensorTypes = ["temperature", "humidity", "lighting"]
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
  if (key == 'itervalID') {
    return "Timer"
  }
  else return value;
}

export const sendDeviceStorage = async (req, res) => {
  
  if(deviceStorage.length == 0) {
    res.json(null)
  }
  else {
    res.json(JSON.stringify(deviceStorage, deviceReplacer))
  }

  // if(sensors.length == 0) {
  //   res.json(null)
  // }
  // else {
  //   res.json(JSON.stringify(sensors, deviceReplacer))
  // }
}

export const deleteFromDeviceStorage = async(req, res) => {
  const deviceID = req.body["deviceID"];

  await deleteDeviceFromDB(deviceID)
  deleteDevice(deviceID)

  res.json({message: "success"})
}



export const createTemperatureSensor = async (req, res) => {
  const requestData = req.body;
  const newDevice = new TemperatureSensor(requestData);

  await saveDevice(newDevice.id, newDevice.type, requestData)

  // console.log(requestData.protocol.versions)

  addDevice(newDevice)
  console.log(req.body);
  console.log(newDevice);
  res.json({ message: "success", "new device id": newDevice.id });
};



export const createLightingSensor = async(req, res) => {
  const requestData = req.body;
  const newDevice = new LightingSensor(requestData);

  // console.log(requestData.protocol.versions)
  await saveDevice(newDevice.id, newDevice.type, requestData)

  addDevice(newDevice)
  console.log(req.body);
  console.log(newDevice);
  res.json({ message: "success", "new device id": newDevice.id });
};

export const createHumiditySensor = async(req, res) => {
  const requestData = req.body;
  const newDevice = new HumiditySensor(requestData);

  await saveDevice(newDevice.id, newDevice.type, requestData)

  // console.log(requestData.protocol.versions)

  addDevice(newDevice)
  
  console.log(newDevice);
  console.log(req.body);
  res.json({ message: "success", "new device id": newDevice.id });
};

export const createLampDevice = async (req, res) => {
  const requestData = req.body;
  const newDevice = new Lamp(requestData);

  await saveDevice(newDevice.id, newDevice.type, requestData)

  // console.log(requestData.protocol.versions)

  addDevice(newDevice)
  console.log(req.body);
  console.log(newDevice);
  res.json({ message: "success", "new device id": newDevice.id });
};

export const changeDeviceStatus = async (req, res) => {
  const deviceID = req.params["id"];
  const status = req.body.status
  const currentDevice = deviceStorage.find((device) => device.id === deviceID);
  const userToken = getUserTokenAPI();

  if (currentDevice === undefined) {
    res.status(404).json({ error: "Устройство не найдено" });
  }
  else if (userToken === null) {
    res.status(404).json({ error: "Токен пользователя не указан" });
  }
  else {
    const response = await currentDevice.changeRighteckDeviceStatus(status, userToken)
    res.json(response);
  }
};

export const changeDevice = async (req, res) => {
  const deviceID = req.params["id"];
  const changedData = req.body
  const currentDevice = deviceStorage.find((device) => device.id === deviceID);

  await updateDevice(deviceID, changedData)
  currentDevice.changeProperties(changedData)

  console.log(currentDevice)

  res.json({ message: "success" });
}


export const controlDevice = async (req, res) => {
  const id = req.params["id"];
  const currentDevice = deviceStorage.find((device) => device.id === id);
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
    if (currentDevice.broker == "rightech" ){ //|| userBrokerExists() 
      if (getUserTokenAPI() !== null){
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
            res.status(404).json({ error: "Невозможно подключиться, убедитесь, что устройство подключено к шлюзу и версии протокола совпадают!"});
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
      res.status(404).json({ error: "Пользовательский брокер не создан. Создайте свой брокер на странице настроек или используйте платформу Rightech"});
    }
  }
};



export async function getDeviceData (req, res) {
  const id = req.params["id"];
  const currentDevice = deviceStorage.find((device) => device.id === id);
  const userToken = getUserTokenAPI();

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
  const currentDevice = deviceStorage.find((device) => device.id === id);
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
