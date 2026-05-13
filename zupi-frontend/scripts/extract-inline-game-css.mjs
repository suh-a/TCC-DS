/**
 * Extrai <style>...</style> das páginas de jogo para public/css/jogos/*-page.css
 * e remove os blocos inline, inserindo <link> antes de </head>.
 * Uso: node scripts/extract-inline-game-css.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'public', 'css', 'jogos');

const GAME_HTML = (name) =>
  (name.startsWith('jogo') && name.endsWith('.html')) ||
  name === 'JogoMath.html' ||
  name === 'menuJogos.html';

function cssFileBase(htmlName) {
  return `${path.basename(htmlName, '.html').toLowerCase()}-page.css`;
}

function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const entries = fs.readdirSync(root).filter(GAME_HTML);

  for (const file of entries) {
    const fp = path.join(root, file);
    let html = fs.readFileSync(fp, 'utf8');
    const re = /<style>([\s\S]*?)<\/style>/gi;
    const chunks = [];
    let m;
    while ((m = re.exec(html)) !== null) {
      chunks.push(m[1].trim());
    }
    if (chunks.length === 0) {
      console.log('skip (no style):', file);
      continue;
    }

    const cssName = cssFileBase(file);
    const cssPath = path.join(outDir, cssName);
    const header =
      '/**\n' +
      ` * Estilos da página: ${file}\n` +
      ' * Gerado/extraído do HTML — manter HTML e CSS separados.\n' +
      ' */\n\n';
    const body = chunks.join('\n\n') + '\n';
    fs.writeFileSync(cssPath, header + body, 'utf8');

    html = html.replace(/<style>[\s\S]*?<\/style>/gi, '');
    const linkLine = `  <link rel="stylesheet" href="/css/jogos/${cssName}" />\n`;
    const headClose = /<\/head>/i;
    if (!headClose.test(html)) {
      console.error('no </head>:', file);
      continue;
    }
    html = html.replace(headClose, `${linkLine}</head>`);

    fs.writeFileSync(fp, html, 'utf8');
    console.log('ok:', file, '->', '/css/jogos/' + cssName);
  }
}

main();
