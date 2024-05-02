import { TemperatureSensor } from "../devices/temperature.js";
import { HumiditySensor } from "../devices/humidity.js";
import { LightingSensor } from "../devices/lighting.js";
import {deviceStorage, addDevice, deleteDevice} from "../deviceStorage.js";
import {getUserTokenAPI} from "../userStorage.js"
import { saveDevice, getDevices } from "../schemas.js";

export function deviceReplacer(key, value) {
  if (key == 'gateway' && value !== null) {
    return {
      name: value.name,
      type: value.type
    }
  }
  if (key == 'mqttClient') {
    return "MqttClient"
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

export const deleteFromDeviceStorage = (req, res) => {
  const deviceID = req.body["deviceID"];
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


export const controlDevice = async (req, res) => {
  const id = req.params["id"];
  const currentDevice = deviceStorage.find((device) => device.id === id);

  if (currentDevice === undefined) {
    res.status(404).json({ error: "Устройство не найдено" });
  } else {
    if (getUserTokenAPI() !== null){
      if (req.body.control == true) {
        if (await currentDevice.connect()) {
          currentDevice.work();
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
};


export const modifyDevice = async (req, res) => {
  
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
    const response = await currentDevice.getRightechCurrentData(userToken)
    res.json(response);
  }
}

export const reconnectDevice = (req, res) => {
  const id = req.params["id"];
  const currentDevice = deviceStorage.find((device) => device.id === id);

  if(currentDevice === undefined) {
    res.status(404).json({ error: "Устройство не найдено" });
  }
  else {
    if (currentDevice.reconnect()) {
      currentDevice.work()
      res.json({ message: "success", operation: "reconnected" })
    }
    else {
      res.status(404).json({ error: "Ошибка при переподключении" });
    }
  }
}
