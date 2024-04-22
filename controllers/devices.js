import { TemperatureSensor } from "../devices/temperature.js";
import deviceStorage from "../deviceStorage.js";

function deviceReplacer(key, value) {
  return (key == 'gateway') ? "value.id" : value;
}

export const sendDeviceStorage = (req, res) => {
  
  if(deviceStorage.length == 0) {
    res.json(null)
  }
  else {
    res.json(JSON.stringify(deviceStorage, deviceReplacer))
  }
}

export const createTemperatureSensor = (req, res) => {
  const requestData = req.body;
  const newDevice = new TemperatureSensor(
    requestData.name,
    requestData.place,
    requestData.meanTimeFailure,
    requestData.protocol
  );

  deviceStorage.push(newDevice);
  console.log(req.body);
  res.json({ message: "success", "new device id": newDevice.id });
};

export const controlTemperatureSensor = (req, res) => {
  const id = req.params["id"];
  const currentDevice = deviceStorage.find((device) => device.id === id);

  if (currentDevice === undefined) {
    res.status(404).json({ error: "Device not found" });
  } else {
    if (req.body.control == true) {
      if (currentDevice.connect()) {
      currentDevice.work();
      res.json({ message: "success" , operation: "connect and start"});
      }
      else {
        res.json({ error: "Невозможно подключиться, убедитесь, что устройство подключено к шлюзу!"});
      }
    }
    else {
      currentDevice.disconnect();
      res.json({ message: "success", operation: "disconnect and off" });
    }
  }
};
