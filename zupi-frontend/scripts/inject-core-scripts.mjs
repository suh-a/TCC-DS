import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CORE = [
  '<script src="/js/routes.js"></script>',
  '<script src="/js/api.js"></script>',
  '<script src="/js/auth-guard.js"></script>',
].join('\n  ');

const GAME_EXTRA = '\n  <script src="/js/game-guard.js"></script>';

for (const file of readdirSync(root)) {
  if (!file.endsWith('.html')) continue;

  const path = join(root, file);
  let html = readFileSync(path, 'utf8');
  let changed = false;

  if (!html.includes('/js/routes.js')) {
    if (html.includes('<script src="/js/api.js"></script>')) {
      html = html.replace('<script src="/js/api.js"></script>', `${CORE}`);
    } else if (html.includes('</body>')) {
      html = html.replace('</body>', `  ${CORE}\n</body>`);
    }
    changed = true;
  } else if (!html.includes('/js/auth-guard.js')) {
    html = html.replace(
      '<script src="/js/api.js"></script>',
      '<script src="/js/api.js"></script>\n  <script src="/js/auth-guard.js"></script>'
    );
    changed = true;
  }

  const isGame = /^jogo/i.test(file) || file === 'menuJogos.html' || file === 'JogoMath.html';
  if (isGame && !html.includes('/js/game-guard.js')) {
    html = html.replace('</body>', `${GAME_EXTRA}\n</body>`);
    changed = true;
  }
  if (isGame && !html.includes('/js/game-score.js')) {
    html = html.replace('</body>', '\n  <script src="/js/game-score.js"></script>\n</body>');
    changed = true;
  }

  if (changed) {
    writeFileSync(path, html, 'utf8');
    console.log('Atualizado:', file);
  }
}

console.log('Concluído.');
