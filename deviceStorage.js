export let deviceStorage = []

export const addDevice = (device) => {
  deviceStorage.push(device)
}

export const deleteDevice = (deviceID) => {
  deviceStorage = deviceStorage.filter((deleted) => deleted.id != deviceID)
}
