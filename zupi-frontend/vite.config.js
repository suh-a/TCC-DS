import { defineConfig, loadEnv } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function htmlInputs() {
  return Object.fromEntries(
    fs
      .readdirSync(__dirname)
      .filter((f) => f.endsWith('.html'))
      .map((f) => {
        const key = f.replace(/\.html$/i, '').replace(/[^a-zA-Z0-9]/g, '_');
        return [key, resolve(__dirname, f)];
      })
  );
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const backend = env.VITE_BACKEND_URL || 'http://localhost:8080';

  return {
    root: __dirname,
    publicDir: 'public',
    build: {
      rollupOptions: {
        input: htmlInputs(),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '^/\\d+/events(?:/|$)': { target: backend, changeOrigin: true },
        '/auth': { target: backend, changeOrigin: true },
        '/child': { target: backend, changeOrigin: true },
        '/skillAreas': { target: backend, changeOrigin: true },
      },
    },
  };
});
