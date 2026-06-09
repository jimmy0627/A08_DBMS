import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const BACKEND_URL = 'http://127.0.0.1:8000';

app.use(logger('dev'));

// [核心修復] API 代理配置
// 使用 fixRequestBody 來解決 express.json() 導致的代理掛起問題
// 這樣我們可以讓 bodyParser 放在前面方便其他路由使用，同時代理也能正常工作
app.use('/api', createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => {
        return `/api${path}`;
    },
    onProxyReq: (proxyReq, req, res) => {
        if (req.body && Object.keys(req.body).length) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 靜態檔案路徑
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, '../../Wiki_Database/static')));

// 路由
app.use('/', indexRouter);
app.use('/users', usersRouter);

export default app;
