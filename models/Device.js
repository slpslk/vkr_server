import mongoose from 'mongoose'
const { Schema } = mongoose;

const deviceSchema = new Schema({
  _id: String,
  userID: mongoose.ObjectId,
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
  permissibleValue: Number,
})

export const Device = mongoose.model("Device", deviceSchema)

export async function saveDevice(id, userID, type, device) {

  const dbDevice = new Device({
    _id: id,
    userID: userID,
    type: type,
    name: device.name,
    place: device.place,
    meanTimeFailure: device.meanTimeFailure,
    sendingPeriod: device.sendingPeriod,
    protocol: device.protocol,
    connectionOptions: device.connectionOptions,
    measureRange: device.measureRange,
    permissibleValue: device.permissibleValue,
    sendingPeriod: device.sendingPeriod
  })

  await dbDevice.save();
  console.log("Сохранен объект", dbDevice);

}

export async function getDevices(userID) {
    const devices = await Device.find({userID: userID});
    return devices
}

export async function updateDevice(deviceID, changedData) {
  await Device.findByIdAndUpdate(deviceID, changedData);
}

export async function deleteDeviceFromDB(deviceID) {
  const result = await Device.deleteOne({_id: deviceID});
  console.log(result)

}