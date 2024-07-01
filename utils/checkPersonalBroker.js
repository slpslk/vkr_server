import { getUserBroker } from "../storages/userStorage.js";

export default (req, res, next) => {
  if (req.body.protocol.broker == 'personal'){ 
    const broker = getUserBroker()
    if(broker.username == null) { 
      return res.status(403).json({
        error: 'Для начала создайте персональный брокер',
      });
    }
    else {
      next()
    }
  }
  else {
    next()
  }
};