import mongoose from 'mongoose'
import { getUserId} from './storages/userStorage.js';
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
    versions: [String],
    broker: String
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



const userSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
})

модели 
export const Device = mongoose.model("Device", deviceSchema)
export const Gateway = mongoose.model("Gateway", gatewaySchema)
export const User = mongoose.model("User", userSchema)

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

export async function updateDevice(deviceID, changedData) {
  await Device.findByIdAndUpdate(deviceID, changedData);
}

export async function deleteDeviceFromDB(deviceID) {
  const result = await Device.deleteOne({_id: deviceID});
  console.log(result)

}

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

export async function getGateways(userID) {
  // await mongoose.connect("mongodb://127.0.0.1:27017/test");

  const gateways = await Gateway.find({userID: userID});

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

export async function getUser() {
  // await mongoose.connect("mongodb://127.0.0.1:27017/test");

  const user = await User.find({});

  // await mongoose.disconnect();

  return user
}




