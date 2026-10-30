/**
 * Gitalk OAuth 换取 access_token 的跨域代理（Vercel Serverless Function）
 *
 * 背景：Gitalk 登录后要 POST 到 https://github.com/login/oauth/access_token 换 token，
 * 但这个接口不返回 CORS 头，浏览器直连必然失败；社区默认的公共代理
 * （cors-anywhere.azm.workers.dev）在国内经常连不上，且随时可能下线。
 *
 * 做法：同域代理一次，只转发这一个接口。client_id / client_secret 由前端随请求带来
 * （它们本来就写在页面 HTML 里），服务端不保存任何密钥。
 *
 * 安全约束：
 *   - 只允许 POST，且只允许来自本站域名的请求；
 *   - 转发目标写死为 GitHub 的 token 接口，不接受任意 URL。
 */
const TOKEN_URL = 'https://github.com/login/oauth/access_token';
const ALLOWED_HOSTS = ['www.liliaw.com', 'liliaw.com', 'localhost:8099', '127.0.0.1:8099'];

function originOf(req) {
  const ref = req.headers.origin || req.headers.referer || '';
  try {
    return new URL(ref).host.toLowerCase();
  } catch (e) {
    return '';
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const host = originOf(req);
  if (host && !ALLOWED_HOSTS.includes(host)) {
    return res.status(403).json({ error: 'origin_not_allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body || '{}'); } catch (e) { body = {}; }
  }
  body = body || {};

  const clientId = body.client_id || body.clientId;
  const clientSecret = body.client_secret || body.clientSecret;
  const code = body.code;

  if (!clientId || !clientSecret || !code) {
    return res.status(400).json({ error: 'missing_params' });
  }

  try {
    const gh = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
    });
    const text = await gh.text();
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(text);
  } catch (e) {
    return res.status(502).json({ error: 'upstream_unreachable' });
  }
};
