// myexpress/server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();

// 1. 設定靜態檔案資料夾 (讓 Express 讀得到你的 HTML, CSS, JS)
// 假設你的 HTML 放在 public 資料夾下
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, '../../Wiki_Database/static')));

// 2. 建立 API 橋接 (API Bridge)
// 只要前端發送的網址開頭是 /api，Express 就會自動幫你轉發給 Django
app.use('/api', createProxyMiddleware({
    target: 'http://localhost:8000', // 替換成你的 Django 伺服器網址與 Port
    changeOrigin: true,
    // 如果 Django 端的 API 沒有 /api 前綴，可以在這裡把它重寫拿掉
    // pathRewrite: { '^/api': '' }, 
}));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`[PRTS] Terminal UI online on http://localhost:${PORT}`);
    console.log(`[PRTS] API Proxy routing to Django Database...`);
});