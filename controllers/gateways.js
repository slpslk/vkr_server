import { EthernetGateway } from "../gateways/ethernet.js";
import { WifiGateway } from "../gateways/wifi.js";
import { BLEGateway } from "../gateways/ble.js";
import deviceStorage from "../deviceStorage.js";
import gatewayStorage from "../gatewayStorage.js";
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

export const createEthernetGateway = (req, res) => {
  const requestData = req.body;
  const newGateway = new EthernetGateway(
    requestData.name,
  );

  gatewayStorage.push(newGateway);
  console.log(req.body);
  console.log(newGateway)
  res.json({ message: "success", "new gateway id": newGateway.id });
}


export const createWiFiGateway = (req, res) => {
  const requestData = req.body;
  const newGateway = new WifiGateway(
    requestData.name,
    requestData.versions
  );
  
  gatewayStorage.push(newGateway);
  console.log(req.body);
  res.json({ message: "success", "new gateway id": newGateway.id });
}

export const createBLEGateway = (req, res) => {
  const requestData = req.body;
  const newGateway = new BLEGateway(
    requestData.name,
    requestData.versions
  );
  
  gatewayStorage.push(newGateway);
  console.log(req.body);
  res.json({ message: "success", "new gateway id": newGateway.id });
}

export const connectDeviceToGateway = (req, res) => {
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
    if (currentGateway.connectDevice(currentDevice)) {
      console.log(util.inspect(currentGateway.devices));
      console.log(util.inspect(currentDevice));
      res.json({ message: "success" });
    }
    else {
      res.status(404).json({ error: "Protocol error" });
    }
  }
}

export const getGatewayDevices = (req, res) => {
  const gatewayID = req.params["id"];
  const currentGateway = gatewayStorage.find((gateway) => gateway.id === gatewayID);
  if (currentGateway === undefined) {
    res.status(404).json({ error: "Gateway not found" });
  } 
  else {
    res.json(JSON.stringify(currentGateway.devices, gatewayReplacer))
  }

  // if(currentGateway.devices.length == 0) {
  //   res.json(null)
  // }
  // else 

}

