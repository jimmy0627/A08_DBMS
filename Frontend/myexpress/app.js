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
const API_BASE_URL = process.env.WIKI_API_BASE_URL || 'http://127.0.0.1:8000';

const app = express();

async function readRequestBody(request) {
	const chunks = [];

	for await (const chunk of request) {
		chunks.push(Buffer.from(chunk));
	}

	return Buffer.concat(chunks);
}

app.use('/api', async (request, response, next) => {
	try {
		const targetUrl = new URL(request.originalUrl, API_BASE_URL);
		const headers = new Headers();

		for (const [key, value] of Object.entries(request.headers)) {
			if (!value || ['host', 'connection', 'content-length'].includes(key)) {
				continue;
			}

			headers.set(key, Array.isArray(value) ? value.join(', ') : value);
		}

		const init = {
			method: request.method,
			headers,
			redirect: 'manual',
		};

		if (!['GET', 'HEAD'].includes(request.method)) {
			init.body = await readRequestBody(request);
		}

		const proxiedResponse = await fetch(targetUrl, init);

		response.status(proxiedResponse.status);

		proxiedResponse.headers.forEach((value, key) => {
			if (!['transfer-encoding', 'connection', 'content-encoding', 'content-length'].includes(key)) {
				response.setHeader(key, value);
			}
		});

		const payload = Buffer.from(await proxiedResponse.arrayBuffer());
		response.send(payload);
	} catch (error) {
		console.error(`Proxy error for ${request.originalUrl}:`, error);
		response.status(502).json({ error: 'Fetch failed', message: error.message });
	}
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api', apiRouter);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

export default app;
