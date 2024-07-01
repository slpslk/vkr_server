import mongoose from 'mongoose'
const { Schema } = mongoose;

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
  apiToken: String,
  brokerParams: {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  }
})

export const User = mongoose.model("User", userSchema)

export async function saveUserAPI(userID, ApiKey) {
  await User.findByIdAndUpdate(userID, {apiToken: ApiKey});
}

export async function saveUserBroker(userID, brokerParams) {
  await User.findByIdAndUpdate(userID, 
    {brokerParams: {
        username: brokerParams.username,
        password: brokerParams.password,
      }
    });
}

export async function getUser() {
  const user = await User.find({});
  return user
}