import { defineConfig, loadEnv } from 'vite';
import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROUTE_ALIASES = {
  '/': '/index.html',
  '/dashboard': '/dashboard-pais.html',
  '/contatos': '/contato.html',
  '/perfil': '/perfil-criancas.html',
  '/jogoMath': '/JogoMath.html',
  '/JogoLigarObjetos': '/jogo-ligar-objetos.html',
};

function buildHtmlRoutes(rootDir) {
  const routes = { ...ROUTE_ALIASES };
  if (!existsSync(rootDir)) return routes;

  for (const file of readdirSync(rootDir)) {
    if (!file.endsWith('.html')) continue;
    const slug = file.replace(/\.html$/, '');
    const path = slug === 'index' ? '/' : `/${slug}`;
    routes[path] = `/${file}`;
  }
  return routes;
}

function htmlRoutesPlugin(routes) {
  const rewrite = (req, _res, next) => {
    const path = req.url?.split('?')[0]?.split('#')[0] || '/';
    const target = routes[path];
    if (target) {
      const qs = req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
      req.url = target + qs;
    }
    next();
  };

  return {
    name: 'zupi-html-routes',
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

function injectApiBasePlugin(apiTarget) {
  return {
    name: 'zupi-inject-api-base',
    transformIndexHtml(html) {
      if (html.includes('ZUPI_API_BASE')) return html;
      const snippet = `<script>window.ZUPI_API_BASE="${apiTarget}";</script>`;
      return html.includes('</head>')
        ? html.replace('</head>', `${snippet}\n</head>`)
        : `${snippet}\n${html}`;
    },
  };
}

function htmlEntries(dir) {
  if (!existsSync(dir)) return {};
  return Object.fromEntries(
    readdirSync(dir)
      .filter((f) => f.endsWith('.html'))
      .map((f) => [f.replace(/\.html$/, ''), resolve(dir, f)])
  );
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const apiTarget = (env.VITE_API_BASE || 'https://tcc-ds-aplication.onrender.com').replace(/\/$/, '');
  const htmlRoutes = buildHtmlRoutes(__dirname);

  return {
    root: __dirname,
    publicDir: 'public',
    plugins: [
      htmlRoutesPlugin(htmlRoutes),
      injectApiBasePlugin(apiTarget),
    ],
    server: {
      port: 5173,
      proxy: {
        '/auth': { target: apiTarget, changeOrigin: true },
        '/child': { target: apiTarget, changeOrigin: true },
        '/school': { target: apiTarget, changeOrigin: true },
        '/contact': { target: apiTarget, changeOrigin: true },
        '/skillAreas': { target: apiTarget, changeOrigin: true },
        '/content': { target: apiTarget, changeOrigin: true },
        '/reports': { target: apiTarget, changeOrigin: true },
        '/quiz': { target: apiTarget, changeOrigin: true },
        '/support': { target: apiTarget, changeOrigin: true },
        '/v3': { target: apiTarget, changeOrigin: true },
        '/swagger-ui': { target: apiTarget, changeOrigin: true },
        '^/\\d+/events': { target: apiTarget, changeOrigin: true },
      },
    },
    preview: {
      port: 4173,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: htmlEntries(__dirname),
      },
    },
  };
});
