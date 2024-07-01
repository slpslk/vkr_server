import { getDevices } from "../models/Device.js"
import { TemperatureSensor } from "../devices/sensors/temperature.js";
import { HumiditySensor } from "../devices/sensors/humidity.js";
import { LightingSensor } from "../devices/sensors/lighting.js";
import { Lamp } from "../devices/controlled/lamp.js";
import { NoiseSensor } from "../devices/sensors/noise.js";

export let deviceStorage = []

export const addDevice = (device) => {
  deviceStorage.push(device)
}

export const deleteDevice = (deviceID) => {
  deviceStorage = deviceStorage.filter((deleted) => deleted.id != deviceID)
}

export const initializeDevicesFromDB = async (userID) => {
  const dbDevices = await getDevices(userID);

  dbDevices.forEach((device) => {
    let newDevice
    switch (device.type) {
      case "temperature":
        newDevice = new TemperatureSensor(device);
        break;
      case "humidity":
        newDevice = new HumiditySensor(device);
        break;
      case "lighting":
        newDevice = new LightingSensor(device);
        break;
      case "noise":
        newDevice = new NoiseSensor(device);
        break;
      case "lamp":
        newDevice = new Lamp(device);
        break;
    }

    addDevice(newDevice);
  });
}

export const clearDeviceStorage = () => {
  deviceStorage = []
}
