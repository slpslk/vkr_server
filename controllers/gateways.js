import { EthernetGateway } from "../gateways/ethernet.js";
import { WifiGateway } from "../gateways/wifi.js";
import { BLEGateway } from "../gateways/ble.js";
import {deviceStorage} from "../deviceStorage.js";
import {gatewayStorage, addGateway, deleteGateway} from "../gatewayStorage.js";
import {deviceReplacer} from "./devices.js"
import { saveGateway, deleteGatewayFromDB } from "../schemas.js";
import * as util from 'util'

// function gatewayReplacer(key, value) {
//   let devicesReplace = []
//   if(this.devices.length !== 0) {
//     devicesReplace = devices.map((device) => ({
//       id: device.id,
//       name: device.name
//     }))
//   }
//   return (key == 'devices') ? devicesReplace : value;
// }

function gatewayReplacer(key, value) {
  return (key == 'devices') ? 'Devices array' : value;
}

export const sendGatewayStorage = (req, res) => {
  
  if(gatewayStorage.length == 0) {
    res.json(null)
  }
  else {
    res.json(JSON.stringify(gatewayStorage, gatewayReplacer))
  }
}

export const deleteFromGatewayStorage = async (req, res) => {
  const gatewayID = req.body["gatewayID"];
  await deleteGatewayFromDB(gatewayID);

  deleteGateway(gatewayID)
  res.json({message: "success"})
}

export const createEthernetGateway = async(req, res) => {
  const requestData = req.body;
  const newGateway = new EthernetGateway(requestData);

  await saveGateway(newGateway.id, newGateway.type, requestData)

  addGateway(newGateway)
  console.log(req.body);
  console.log(newGateway)
  res.json({ message: "success", "new gateway id": newGateway.id });
}


export const createWiFiGateway = async (req, res) => {
  const requestData = req.body;
  const newGateway = new WifiGateway(requestData);
  await saveGateway(newGateway.id, newGateway.type, requestData)
  
  addGateway(newGateway)
  console.log(req.body);
  res.json({ message: "success", "new gateway id": newGateway.id });
}

export const createBLEGateway = async (req, res) => {
  const requestData = req.body;
  const newGateway = new BLEGateway(requestData);
  await saveGateway(newGateway.id, newGateway.type, requestData);

  addGateway(newGateway)
  console.log(req.body);
  res.json({ message: "success", "new gateway id": newGateway.id });
}

export const connectDeviceToGateway = (req, res) => {
  const gatewayID = req.params["id"];
  const deviceID = req.body["deviceID"];
  const distance = req.body["distance"]
  const currentGateway = gatewayStorage.find((gateway) => gateway.id === gatewayID);
  const currentDevice = deviceStorage.find((device) => device.id === deviceID);

  if (currentGateway === undefined) {
    res.status(404).json({ error: "Gateway not found" });
  } 
  else if (currentDevice === undefined) {
    res.status(404).json({ error: "Device not found" });
  }
  else {
    const connectionResult = currentGateway.connectDevice(currentDevice, distance);
    if (connectionResult.status) {
      console.log(util.inspect(currentGateway.devices));
      console.log(util.inspect(currentDevice));
      res.json({ message: "success" });
    }
    else {
      res.status(404).json({ error: `Ошибка подключения. ${connectionResult.message}` });
    }
  }
}

export const changeGateway = (req, res) => {
  const gatewayID = req.params["id"];
  const changedData = req.body
  console.log(req.body)
}

export const disconnectDeviceFromGateway = (req, res) => {
  const gatewayID = req.params["id"];
  const deviceID = req.body["deviceID"];
  const currentGateway = gatewayStorage.find((gateway) => gateway.id === gatewayID);
  const currentDevice = deviceStorage.find((device) => device.id === deviceID);

  if (currentGateway === undefined) {
    res.status(404).json({ error: "Gateway not found" });
  } 
  else if (currentDevice === undefined) {
    res.status(404).json({ error: "Device not found" });
  }
  else {
      currentGateway.deleteDevice(currentDevice)
      console.log(util.inspect(currentGateway.devices));
      console.log(util.inspect(currentDevice));
      res.json({ message: "success" });

  }
}

export const getGatewayDevices = (req, res) => {
  const gatewayID = req.params["id"];
  const currentGateway = gatewayStorage.find((gateway) => gateway.id === gatewayID);
  if (currentGateway === undefined) {
    res.status(404).json({ error: "Gateway not found" });
  } 
  else {
    res.json(JSON.stringify(currentGateway.devices, deviceReplacer))
  }
}

