import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const ACCESS_TOKEN_SECRET_KEY = 'HA'
const REFRESH_TOKEN_SECRET_KEY = 'SP'
const tokenStorages = {};
const router = express.Router();

/** 사용자 회원가입 API **/
router.post('/signup', async (req, res, next) => {
  const { email, password, name, age, gender } = req.body;
  const isExistUser = await prisma.users.findFirst({
    where: {
      email,
    },
  });

  if (isExistUser) {
    return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
  }

  const hashedPassword = await bcrypt.hash(password,10);

  const user = await prisma.users.create({
    data: { 

        email, 
        password:hashedPassword,
    
    },
  });


  const userInfo = await prisma.userInfos.create({
    data: {
      UserId: user.userId, 
      name,
      age,
      gender: gender.toUpperCase(), 
    },
  });

  return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
});


router.post('/login',async(req , res ,next ) =>{

   const {email, password} =  req.body;

    
   const accessToken = jwt.sign({email : email } , ACCESS_TOKEN_SECRET_KEY , {expiresIn: '60s'});
   const refreshToken = jwt.sign({email : email } , REFRESH_TOKEN_SECRET_KEY , {expiresIn: '7d'});

    tokenStorages[refreshToken] = {
      email: email,
      ip: req.ip,
      userAgent : req.headers['user-agent'],

    }
    console.log(tokenStorages);
    res.cookie('accessToken', accessToken);
    res.cookie('refreshToken',refreshToken);

  const user = await prisma.users.findFirst({where : {email}});

  if(!user)
    {
      return res.status(401).json({message : '존재하지 않는 이메일입니다'});
    }

      const result = await bcrypt.compare(password, user.password);
if(!result){

  return res.status(401).json({message : '비밀번호가 일치하지 않습니다'});

}
    
const token = jwt.sign(
  {
    userId: user.userId,

  },
  'customized_secret_key'
)


res.cookie('autorization', `Beare ${token}`);
return res.status(200).json({message:'로그인 , 토큰발급에 성공했습니다'});


})


    export default router;