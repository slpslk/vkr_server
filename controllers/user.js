import {getUserTokenAPI, setUserTokenAPI} from '../userStorage.js'

export const addUserTokenAPI = (req, res) => {
  console.log(req.body);
  setUserTokenAPI(req.body.api);
  
  console.log(getUserTokenAPI())
  res.json({message: 'success'})
}