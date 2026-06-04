import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './routes/index.js';
import apiRouter from './routes/api.js';
import usersRouter from './routes/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 靜態檔案
app.use(express.static(path.join(__dirname, 'public')));

// API 路由
app.use('/api', apiRouter);

// 頁面路由
app.use('/', indexRouter);
app.use('/users', usersRouter);

export default app;
