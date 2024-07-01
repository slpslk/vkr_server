import {brokerCompose, stopBroker, startBroker} from '../broker/compose.js'

let UserStorage = {
  id: null,
  username: null,
  apiToken: null,
  brokerParams: null
}

export const setUserStorage = (user) => {
  UserStorage.id = user._id;
  UserStorage.username = user.username;
  UserStorage.apiToken = user.apiToken;
  if (user.brokerParams !== undefined) {
    UserStorage.brokerParams = user.brokerParams;
  }
}

export const getUserTokenAPI = () => {
  return UserStorage.apiToken
}

export const setUserTokenAPI = (token) => {
  UserStorage.apiToken = token
}

export const getUserBroker = () => {
  return UserStorage.brokerParams
}

export const userBrokerWorking = () => {
  return (UserStorage.brokerParams.port == null || UserStorage.brokerParams.port == undefined) ? false : true
}

export const createUserBroker = (psswd) => {
  const port = brokerCompose(UserStorage.username, psswd)

  UserStorage.brokerParams = {
    username: UserStorage.username,
    password: psswd,
    port: port,
  }
}

export const controlBroker = (control) => {
  if(control) {
    const port = startBroker(UserStorage.username)
    UserStorage.brokerParams.port = port
  }
  else {
    stopBroker(UserStorage.username, UserStorage.brokerParams.port)
    UserStorage.brokerParams.port = null
  }
}

export const initializeUserFromDB = (user) => {
  setUserStorage(user)
}

export const clearUserStorage = () => {

  if (UserStorage.brokerParams.port != null ) {
    stopBroker(UserStorage.username, UserStorage.brokerParams.port)
  }

  UserStorage.id = null;
  UserStorage.username = null;
  UserStorage.apiToken = null;
  UserStorage.brokerParams = null
}