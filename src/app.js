import express from 'express';
import cookieParser from 'cookie-parser';
import UsersRouter from './routes/users.router.js';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 4000;

const ACCESS_TOKEN_SECRET_KEY = 'HA'
const REFRESH_TOKEN_SECRET_KEY = 'SP'



app.use(express.json());
app.use(cookieParser());
app.use('/api', [UsersRouter]);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});