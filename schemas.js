import mongoose from 'mongoose'
const { Schema } = mongoose;

const deviceSchema = new Schema({
  _id: String,
  type: String,
  name: String,
  place: Boolean,
  meanTimeFailure: Number,
  sendingPeriod: Number,
  protocol: {
    physical: String,
    message: String,
    versions: [String]
  },
  connectionOptions: {
    clientId: String,
    username: String,
    password: String,
    sendingTopic: String,
    QoS: Number
  },
  measureRange: {
    min: Number,
    max: Number,
    error: Number,
    opRange: Number,
  },

})

const gatewaySchema = new Schema({
  _id: String,
  type: String,
  name: String,
  opRange: Number,
  versions: [String]
})

export const Device = mongoose.model("Device", deviceSchema)
export const Gateway = mongoose.model("Gateway", gatewaySchema)

export async function saveDevice(id, type, device) {

  const dbDevice = new Device({
    _id: id,
    type: type,
    name: device.name,
    place: device.place,
    meanTimeFailure: device.meanTimeFailure,
    sendingPeriod: device.sendingPeriod,
    protocol: device.protocol,
    connectionOptions: device.connectionOptions,
    measureRange: device.measureRange,
    sendingPeriod: device.sendingPeriod
  })

  await dbDevice.save();
  console.log("Сохранен объект", dbDevice);

}

export async function getDevices() {
    // await mongoose.connect("mongodb://127.0.0.1:27017/test");

    const devices = await Device.find({});

    // await mongoose.disconnect();

    return devices
}

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
  // await mongoose.connect("mongodb://127.0.0.1:27017/test");

  const gateways = await Gateway.find({});

  // await mongoose.disconnect();

  return gateways
}

export async function deleteGatewayFromDB(gatewayID) {
  // await mongoose.connect("mongodb://127.0.0.1:27017/test");

  const result = await Gateway.deleteOne({_id: gatewayID});
  console.log(result)

  // await mongoose.disconnect();
}

export async function updateGateway(gatewayID, changedData) {
  await Gateway.findByIdAndUpdate(id, {name: "Sam", age: 25});
}
