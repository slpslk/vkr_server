import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { User } from '../models/User.js';
import {initializeData, clearData} from '../storages/index.js'

export async function registration(req, res) {
  try {
    const {fullName, username, password} = req.body

    const candidate = await User.findOne({username})
    if (candidate) {
        return res.status(400).json({message: "Пользователь с таким логином уже существует"})
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const user = new User({fullName, username, passwordHash: hashPassword})
    await user.save()

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      },
    );
    
    initializeData(user)
    
    const { passwordHash, ...userData } = user._doc;
    res.json({
      ...userData,
      token,
    });
  }
  catch(err){
    console.log(err)
    res.status(500).json({message: "Не удалось зарегистрировать пользователя"})
  }
  
}

export async function login(req, res) {
  try {
    const {username, password} = req.body

    const user = await User.findOne({username})
    if (!user) {
        return res.status(400).json({message: `Пользователь ${username} не найден`})
    }

    const validPassword = bcrypt.compareSync(password, user.passwordHash)
    if (!validPassword) {
        return res.status(400).json({message: `Введен неверный пароль`})
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      },
    );

    initializeData(user)

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
    
  } catch (err) {
    console.log(err)
    res.status(500).json({message: "Не удалось авторизировать пользователя"})
  }
}

export async function logOut(req, res) {
  clearData();
  res.json({message: "success"})
}
