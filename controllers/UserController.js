import {saveUserAPI, saveUserBroker} from "../models/User.js"
import {getUserTokenAPI, setUserTokenAPI, getUserBroker, createUserBroker, controlBroker} from '../storages/userStorage.js'

export const addUserAPIToken = async(req, res) => {
  console.log(req.body);

  await saveUserAPI(req.userId, req.body.api);
  setUserTokenAPI(req.body.api);
  
  res.json({message: 'success'})
}

export const sendUserTokenAPI = (req, res) => {
  const userToken = getUserTokenAPI()
  if(userToken == null) {
    res.status(404).json({ error: "Токен не указан" });
  }
  else {
    res.json({message: 'success'})
  }
}

export const sendBrokerInfo = (req, res) => {
  const userBroker = getUserBroker()
  if(userBroker.username == null) {
    res.status(404).json({ error: "Брокер не создан" });
  }
  else {
    res.json(userBroker)
  }
}

export const addUserBroker = async (req, res) => {
  createUserBroker(req.body.psswd);
  const userBroker = getUserBroker()

  await saveUserBroker(req.userId, userBroker)
  res.json(userBroker)
}

export const controlUserBroker = (req, res) => {
  controlBroker(req.body.control)
  const userBroker = getUserBroker()
  res.json(userBroker)
}