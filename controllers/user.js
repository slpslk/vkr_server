import { saveUser } from '../schemas.js';
import {getUserTokenAPI, setUserTokenAPI} from '../userStorage.js'

export const addUserTokenAPI = async(req, res) => {
  console.log(req.body);

  await saveUser(req.body.api);
  setUserTokenAPI(req.body.api);
  
  res.json({message: 'success'})
}

export const recieveUserTokenAPI = (req, res) => {
  const userToken = getUserTokenAPI()
  if(userToken == null) {
    res.status(404).json({ error: "Токен не указан" });
  }
  else {
    res.json({message: 'success'})
  }
}