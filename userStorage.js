let UserInfo = {
  tokenAPI: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NjE0MTNkYWQxMzc5NWU5Y2M3NzE4NDAiLCJzdWIiOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODIiLCJncnAiOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODEiLCJvcmciOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODEiLCJsaWMiOiI1ZDNiNWZmMDBhMGE3ZjMwYjY5NWFmZTMiLCJ1c2ciOiJhcGkiLCJmdWxsIjpmYWxzZSwicmlnaHRzIjoxLjUsImlhdCI6MTcxMjU5MTgzNCwiZXhwIjoxNzE1MTAxMjAwfQ.F4EitbovA56tmJHp5cbMvtIivmds6_MgDOERRB__8qQ"
}


export const getUserTokenAPI = () => {
  return UserInfo.tokenAPI
}

export const setUserTokenAPI = (token) => {
  UserInfo.tokenAPI = token
}