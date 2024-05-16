import mongoose from 'mongoose'
const { Schema } = mongoose;

const gatewaySchema = new Schema({
  _id: String,
  type: String,
  name: String,
  opRange: Number,
  versions: [String]
})

export const Gateway = mongoose.model("Gateway", gatewaySchema)


//TODO сохранять подключенные устройства

export async function saveGateway(id, type, gateway) {

  const dbGateway = new Gateway({
    _id: id,
    type: type,
    name: gateway.name,
    opRange: gateway.opRange,
    versions: gateway.versions,
  })

  await dbGateway.save();
  console.log("Сохранен объект", dbGateway);
}

export async function getGateways() {
  const gateways = await Gateway.find({});
  return gateways
}

export async function deleteGatewayFromDB(gatewayID) {
  const result = await Gateway.deleteOne({_id: gatewayID});
  console.log(result)
}

export async function updateGateway(gatewayID, changedData) {
  await Gateway.findByIdAndUpdate(gatewayID, changedData);
}

export async function saveUser(ApiKey) {

  const dbUser = new User({
    _id: getUserId(),
    ApiKey: ApiKey
  })

  await dbUser.save();
  console.log("Сохранен объект", dbUser);
}
