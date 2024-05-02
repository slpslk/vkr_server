import { getDevices } from "./schemas.js"
import { TemperatureSensor } from "./devices/temperature.js"
import { HumiditySensor } from "./devices/humidity.js"
import { LightingSensor } from "./devices/lighting.js"

export let deviceStorage = []

export const addDevice = (device) => {
  deviceStorage.push(device)
}

export const deleteDevice = (deviceID) => {
  deviceStorage = deviceStorage.filter((deleted) => deleted.id != deviceID)
}

export const initializeDevicesFromDB = async () => {
  const dbDevices = await getDevices();

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
    }

    addDevice(newDevice);
  });
}
