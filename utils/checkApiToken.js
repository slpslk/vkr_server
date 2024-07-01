import { getUserTokenAPI } from "../storages/userStorage.js";

export default (req, res, next) => {
  if (req.body.protocol.message == 'HTTP') {
    if (getUserTokenAPI() == null) {
      return res.status(403).json({
        error: 'Для начала сохраните API Токен',
      });
    }
    else {
      next();
    }
  } else {
    next();
  }
};