import { initializeDevicesFromDB, clearDeviceStorage } from './deviceStorage.js';
import { initializeGatewaysFromDB, clearGatewayStorage } from './gatewayStorage.js';
import { initializeUserFromDB, clearUserStorage } from './userStorage.js';


//userid
export async function initializeData(user) {
  await initializeDevicesFromDB(user._id)
  await initializeGatewaysFromDB(user._id)
  initializeUserFromDB(user)
}

export function clearData() {
  clearDeviceStorage();
  clearGatewayStorage();
  clearUserStorage();
}

export * as DeviceStorage from './deviceStorage.js';
export * as GatewayStorage from './gatewayStorage.js';
export * as UserStorage from  './userStorage.js';