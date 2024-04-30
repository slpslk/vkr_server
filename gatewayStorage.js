export let gatewayStorage = []

export const addGateway = (gateway) => {
  gatewayStorage.push(gateway)
}

export const deleteGateway = (gatewayID) => {
  gatewayStorage = gatewayStorage.filter((deleted) => deleted.id != gatewayID)
}