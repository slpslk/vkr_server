import { v4 as uuidv4 } from 'uuid';
import { getUser } from './schemas.js';

let UserInfo = {
  id: uuidv4(),
  tokenAPI: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NjNiMDUxMjliMTJiZWVmMzZjYmUxYzQiLCJzdWIiOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODIiLCJncnAiOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODEiLCJvcmciOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODEiLCJsaWMiOiI1ZDNiNWZmMDBhMGE3ZjMwYjY5NWFmZTMiLCJ1c2ciOiJhcGkiLCJmdWxsIjpmYWxzZSwicmlnaHRzIjoxLjUsImlhdCI6MTcxNTE0Mzk1NCwiZXhwIjoxNzIyMzU4ODAwfQ.Wi6bHaflI3naQ7fCAk9d5T9VNGa9Fc-4ju-LdxeKx7I"

}


export const getUserTokenAPI = () => {
  return UserInfo.tokenAPI
}

export const setUserTokenAPI = (token) => {
  UserInfo.tokenAPI = token
}

export const setUserId = (id) => {
  UserInfo.id = id
}

export const getUserId = () => {
  return UserInfo.id
}

export const initializeUserFromBD = async () => {
  const dbUser = await getUser();
  setUserId(dbUser.id)
  setUserTokenAPI(dbUser.ApiKey)

  console.log(this)
}