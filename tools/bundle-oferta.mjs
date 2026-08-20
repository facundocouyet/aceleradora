/* ============================================================
   Arma "Cascara Partners - La Oferta.html": el deck de la oferta
   en un solo archivo, para el botón "HTML ↓" del home.

     node tools/bundle-oferta.mjs

   Mete adentro las hojas de estilo, el JS del deck, las fuentes y
   las fotos como data: URIs, así el archivo abre sin servidor y
   sin red. Correlo cada vez que cambie la oferta.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = 'Cascara Partners - La Oferta.html';

const MIME = {
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const dataUri = f => {
  const ext = path.extname(f);
  return `data:${MIME[ext]};base64,${fs.readFileSync(path.join(ROOT, f)).toString('base64')}`;
};

let html = read('oferta.html');

// Las hojas, en el orden en que las linkea la página
const styles = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(m => m[1]);
let css = styles.map(href => read(href)).join('\n');

// url("../assets/…") de las hojas y src="assets/…" del markup se vuelven data:
css = css.replace(/url\("\.\.\/(assets\/[^"]+)"\)/g, (m, f) => `url("${dataUri(f)}")`);
html = html.replace(/src="(assets\/[^"]+)"/g, (m, f) => `src="${dataUri(f)}"`);

html = html
  .replace(/<link rel="stylesheet"[^>]*>\n?/g, '')
  .replace('</head>', `<style>\n${css}\n</style>\n</head>`)
  .replace(/<script src="js\/deck\.js"><\/script>/, `<script>\n${read('js/deck.js')}\n</script>`);

// El archivo se abre suelto: no hay home al que volver ni impresión automática
html = html.replace(/<script>\s*\/\/ El botón "PDF[\s\S]*?<\/script>\n/, '');

fs.writeFileSync(path.join(ROOT, OUT), html);
console.log(`${OUT}: ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MB`);
