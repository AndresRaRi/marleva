import { proxyTarget } from './proxy-target.mjs';
const { port, apiPort } = proxyTarget(process.env.MARLEVA_PROXY_CONTEXT);
import { createServer as httpsServer } from 'node:https';
import { request } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('apps/client/dist'),
  cert = path.resolve(process.env.MARLEVA_CERT_DIR ?? 'infra/local/secrets');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};
const server = httpsServer(
  {
    key: await readFile(path.join(cert, 'localhost.key')),
    cert: await readFile(path.join(cert, 'localhost.crt')),
  },
  async (req, res) => {
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.url?.startsWith('/v1/') || req.url?.startsWith('/health/')) {
      const upstream = request(
        {
          hostname: '127.0.0.1',
          port: apiPort,
          path: req.url,
          method: req.method,
          headers: { ...req.headers, host: `127.0.0.1:${apiPort}` },
        },
        (r) => {
          res.writeHead(r.statusCode ?? 503, r.headers);
          r.pipe(res);
        },
      );
      upstream.on('error', () => {
        res.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        res.end(
          JSON.stringify({
            codigo: 'API_NO_DISPONIBLE',
            mensaje: 'La API local no está disponible',
            accion_recuperacion: 'Intenta de nuevo',
          }),
        );
      });
      req.pipe(upstream);
      return;
    }
    try {
      const url = new URL(req.url ?? '/', 'https://localhost');
      let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
      if (!file.startsWith(root + path.sep) && file !== root) {
        res.writeHead(400);
        res.end();
        return;
      }
      try {
        if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      } catch {
        file = path.join(root, 'index.html');
      }
      const data = await readFile(file);
      res.writeHead(200, {
        'Content-Type': types[path.extname(file)] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('No encontrado');
    }
  },
);
server.listen(port, '127.0.0.1', () =>
  console.log(`Marleva HTTPS local: https://localhost:${port}`),
);
