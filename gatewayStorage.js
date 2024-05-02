import { getGateways } from "./schemas.js"
import { EthernetGateway } from "./gateways/ethernet.js"
import { WifiGateway } from "./gateways/wifi.js"
import { BLEGateway } from "./gateways/ble.js"

export let gatewayStorage = []

export const addGateway = (gateway) => {
  gatewayStorage.push(gateway)
}

export const deleteGateway = (gatewayID) => {
  gatewayStorage = gatewayStorage.filter((deleted) => deleted.id != gatewayID)
}

export const initializeGatewaysFromDB = async () => {
  const dbGateways = await getGateways();

  dbGateways.forEach((gateway) => {
    let newGateway
    switch (gateway.type) {
      case "ethernet": 
      newGateway = new EthernetGateway(gateway);
        break;
      case "wifi":
        newGateway = new WifiGateway(gateway);
        break;
      case "ble":
        newGateway = new BLEGateway(gateway);
        break;
    }

    addGateway(newGateway);
  });
}