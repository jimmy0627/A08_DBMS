import express from 'express';

const router = express.Router();

const backendBaseUrl = process.env.ARKNIGHTS_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

function buildTargetUrl(request) {
  // 核心問題點：new URL(path, base) 若 path 以 / 開頭，會直接替換掉 base 的 path 部分。
  // 我們需要根據 backendBaseUrl 是否包含路徑來決定如何拼湊。
  const baseUrl = backendBaseUrl.endsWith('/') ? backendBaseUrl : `${backendBaseUrl}/`;
  
  // 移除 request.url 開頭的斜線，使其相對於 baseUrl
  const relativePath = request.url.startsWith('/') ? request.url.substring(1) : request.url;
  
  return new URL(relativePath, baseUrl);
}

router.use(async (request, response) => {
  const targetUrl = buildTargetUrl(request);
  console.log(`[PRTS Proxy] Routing ${request.method} ${request.originalUrl} -> ${targetUrl.href}`);

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: request.method,
      headers: {
        accept: request.headers.accept || 'application/json',
        'content-type': request.headers['content-type'] || 'application/json',
      },
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : JSON.stringify(request.body ?? {}),
    });

    const contentType = upstreamResponse.headers.get('content-type') || '';
    response.status(upstreamResponse.status);

    if (contentType.includes('application/json')) {
      const payload = await upstreamResponse.json();
      response.set('content-type', 'application/json; charset=utf-8');
      response.send(payload);
      return;
    }

    const textPayload = await upstreamResponse.text();
    response.set('content-type', contentType || 'text/plain; charset=utf-8');
    response.send(textPayload);
  } catch (error) {
    console.error('[API proxy error]', error);
    response.status(502).json({
      status: 'error',
      message: '無法連線到 Wiki_Database 後端 API',
    });
  }
});

export default router;