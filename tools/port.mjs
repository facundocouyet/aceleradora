/* ============================================================
   Porteo del handoff de diseño al sitio.

     node tools/port.mjs ~/Downloads/design_handoff_aceleradora

   Lee los cuatro .dc.html del bundle, tira el runtime del
   prototipo (support.js, <x-dc>, <x-import>, <helmet>) y deja
   el markup listo, con cada estilo inline convertido en una
   clase numerada por página (hmN, slN, mbN, rpN).

   Es idempotente: reescribe las páginas enteras, pero de cada
   hoja de estilos sólo reemplaza el tramo generado — lo escrito
   a mano arriba (chrome, impresión) y abajo (mobile) queda como
   está. Ojo con eso: si el contenido del handoff cambia mucho,
   la numeración se corre y hay que revisar que las reglas
   mobile sigan apuntando al mismo elemento.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';

const SRC = process.argv[2];
if (!SRC) {
  console.error('uso: node tools/port.mjs <carpeta del handoff>');
  process.exit(1);
}
const OUT = path.resolve(import.meta.dirname, '..');

// La paleta del sistema F3: cuatro valores y dos derivados, cero color
const tokenize = css => css
  .replace(/#171717/gi, 'var(--tinta)')
  .replace(/#ECEAE4/gi, 'var(--papel)')
  .replace(/#FAFAFA/gi, 'var(--blanco)')
  .replace(/#2D2D2D/gi, 'var(--gris)')
  .replace(/#6A6A66/gi, 'var(--gris-claro)')
  .replace(/#E2DFD8/gi, 'var(--relleno)');

const decls = style => style.split(';').map(s => s.trim()).filter(Boolean)
  .map(s => '  ' + s.replace(/^([^:]+):\s*/, '$1: ') + ';').join('\n');

/* Cada style inline distinto se vuelve una clase; los repetidos comparten
   la suya, que es lo que hace que 128KB de markup entren en 18KB de CSS. */
function extract(html, prefix, { skipTags = [] } = {}) {
  const rules = new Map();
  const tagRe = /<([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  const out = html.replace(tagRe, (m, tag, attrs, selfClose) => {
    if (skipTags.includes(tag.toLowerCase())) return m;
    const styleM = attrs.match(/\sstyle="([^"]*)"/);
    if (!styleM) return m;
    const hoverM = attrs.match(/\sstyle-hover="([^"]*)"/);
    const key = styleM[1] + '||' + (hoverM ? hoverM[1] : '');
    if (!rules.has(key)) rules.set(key, { name: `${prefix}${rules.size + 1}`, style: styleM[1], hover: hoverM ? hoverM[1] : null });
    const cls = rules.get(key).name;
    let next = attrs.replace(/\sstyle="[^"]*"/, '').replace(/\sstyle-hover="[^"]*"/, '');
    const existing = next.match(/\sclass="([^"]*)"/);
    next = existing ? next.replace(/\sclass="[^"]*"/, ` class="${existing[1]} ${cls}"`) : ` class="${cls}"` + next;
    return `<${tag}${next}${selfClose}>`;
  });
  const css = [...rules.values()].map(r => {
    let block = `.${r.name} {\n${decls(tokenize(r.style))}\n}`;
    if (r.hover) block += `\n.${r.name}:hover {\n${decls(tokenize(r.hover))}\n}`;
    return block;
  }).join('\n');
  return { html: out, css, count: rules.size };
}

const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');
const relink = s => s
  .replace(/href="Aceleradora%20Presentacion\.dc\.html"/g, 'href="presentacion.html"')
  .replace(/href="Aceleradora%20Informe\.dc\.html"/g, 'href="informe.html"')
  .replace(/href="Aceleradora\.dc\.html"/g, 'href="index.html"')
  .replace(/href="Cascara%20Partner%20Oferta\.dc\.html\?print=1"/g, 'href="oferta.html?print=1"')
  .replace(/href="Cascara%20Partner%20Oferta\.dc\.html"/g, 'href="oferta.html"');

const writePage = (file, body) => fs.writeFileSync(path.join(OUT, file), body);

// Los centinelas marcan el tramo que se reemplaza; lo de afuera es a mano
const MARK_START = '/* ↓ generado por tools/port.mjs · no editar a mano ↓ */';
const MARK_END = '/* ↑ fin del tramo generado ↑ */';

function writeStyles(file, prefix, css) {
  const target = path.join(OUT, file);
  const lines = fs.readFileSync(target, 'utf8').split('\n');
  let start = lines.indexOf(MARK_START);
  let end = lines.indexOf(MARK_END) + 1;
  if (start < 0) {
    // Primer porteo sobre una hoja sin centinelas
    start = lines.findIndex(l => l.startsWith(`.${prefix}1 {`));
    end = lines.length;
    for (let i = lines.length - 1; i > start; i--) {
      if (lines[i].startsWith('/* ')) { end = i; break; }
    }
  }
  const block = [MARK_START, css, MARK_END];
  fs.writeFileSync(target, [...lines.slice(0, start), ...block, ...lines.slice(end)].join('\n'));
}

const head = (title, description, styles, extra = '') => `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
${styles.map(s => `<link rel="stylesheet" href="css/${s}.css">`).join('\n')}
${extra}</head>
<body>
`;

{ // home
  const body = read('Aceleradora.dc.html').match(/<\/helmet>\s*([\s\S]*?)\s*<\/x-dc>/)[1];
  const { html, css, count } = extract(relink(body), 'hm');
  writePage('index.html', head(
    'Cáscara Partners · La Aceleradora',
    'Cáscara Partners — la Aceleradora en presentación e informe. Documento interno, versión 10, agosto 2026.',
    ['tokens-f3', 'base', 'home']) + html + '</body>\n</html>\n');
  writeStyles('css/home.css', 'hm', css);
  console.log('home:', count, 'reglas');
}

{ // presentación (desktop)
  const slides = read('Aceleradora Presentacion.dc.html').match(/<x-import[^>]*>\s*([\s\S]*?)\s*<\/x-import>/)[1];
  const { html, css, count } = extract(slides, 'sl', { skipTags: ['section'] });
  writePage('presentacion.html', head(
    'Cáscara Partners · Presentación',
    'La oferta unificada de la Aceleradora en 16 slides.',
    ['tokens-f3', 'base', 'deck-chrome', 'deck'],
    `<script>
  // En teléfono la presentación es otra pieza: 18 pantallas en scroll
  // vertical. Se decide antes de pintar para no mostrar el deck y saltar.
  if (window.matchMedia('(max-width: 700px)').matches) {
    location.replace('presentacion-mobile.html');
  }
</script>
`) + `<a class="home-pill home-pill--top-center" href="index.html">← Home</a>

<div class="stage">
  <div class="canvas">
` + html.replace(/<section data-label=/g, '<section class="slide" data-label=') + `
  </div>
</div>

<nav class="rail" aria-label="Miniaturas de las slides"></nav>

<aside class="notes">
  <span class="notes-label">Notas del orador</span>
  <p class="notes-body"></p>
</aside>

<div class="hint">← → navegar · T miniaturas · N notas</div>

<script src="js/deck.js"></script>
</body>
</html>
`);
  writeStyles('css/deck.css', 'sl', css);
  console.log('deck:', count, 'reglas');
}

{ // presentación (mobile)
  const body = read('Aceleradora Presentacion Mobile.dc.html')
    .match(/<\/helmet>\s*([\s\S]*?)\s*<\/x-dc>/)[1]
    .replace(/ref="\{\{ barRef \}\}"/, 'id="progress-fill"');
  const { html, css, count } = extract(relink(body), 'mb');
  writePage('presentacion-mobile.html', head(
    'Cáscara Partners · Presentación',
    'La oferta unificada de la Aceleradora, en scroll vertical.',
    ['tokens-f3', 'base', 'deck-mobile']).replace(
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
    ) + html + '<script src="js/deck-mobile.js"></script>\n</body>\n</html>\n');
  writeStyles('css/deck-mobile.css', 'mb', css);
  console.log('mobile:', count, 'reglas');
}

{ // informe
  const inner = read('Aceleradora Informe.dc.html').match(/<x-import[^>]*>\s*([\s\S]*?)\s*<\/x-import>/)[1];
  const doc = inner.slice(inner.indexOf('<div style="font-family:'))
    .replace(/^<div style="[^"]*">/, '')
    .replace(/<\/div>\s*$/, '');
  const { html, css, count } = extract(doc, 'rp');
  writePage('informe.html', head(
    'Cáscara Partners · Documento maestro v10',
    'Documento maestro de la Aceleradora: la oferta, el proceso, la camada y el lanzamiento. 16 secciones más el anexo de los tres checklists.',
    ['tokens-f3', 'base', 'informe']) + `<a class="home-pill home-pill--top-right" href="index.html">← Home</a>

<div class="desk">
  <div class="sheet">
    <table class="frame">
      <thead><tr><td><div class="hdr-space"></div></td></tr></thead>
      <tfoot><tr><td><div class="ftr-space"></div></td></tr></tfoot>
      <tbody><tr><td>
        <div class="doc">
` + html + `
        </div>
      </td></tr></tbody>
    </table>
    <div class="doc-footer">
      <span>Aceleradora · Documento maestro · v10</span>
      <span>Cáscara Collective · interno</span>
    </div>
  </div>
</div>
<script src="js/informe.js"></script>
</body>
</html>
`);
  writeStyles('css/informe.css', 'rp', css);
  console.log('informe:', count, 'reglas');
}

{ // la oferta al cliente — 10 slides, mismo escenario que el deck interno
  const slides = read('Cascara Partner Oferta.dc.html').match(/<x-import[^>]*>\s*([\s\S]*?)\s*<\/x-import>/)[1];
  const { html, css, count } = extract(slides, 'of', { skipTags: ['section'] });
  writePage('oferta.html', head(
    'Cáscara Partners · La oferta',
    'La Aceleradora de Cáscara Partners: qué es, el recorrido de 90 días, las orientaciones, los founders y cómo se entra.',
    ['tokens-f3', 'base', 'deck-chrome', 'oferta'],
    `<script>
  // El botón "PDF ↓" del home entra por acá: el deck se abre e imprime solo.
  // La espera le da tiempo a las fuentes y a las fotos.
  if (new URLSearchParams(location.search).has('print')) {
    addEventListener('load', () => setTimeout(() => print(), 1400));
  }
</script>
`) + `<div class="stage">
  <div class="canvas">
` + html.replace(/<section data-label=/g, '<section class="slide" data-label=') + `
  </div>
</div>

<nav class="rail" aria-label="Miniaturas de las slides"></nav>

<aside class="notes">
  <span class="notes-label">Notas del orador</span>
  <p class="notes-body"></p>
</aside>

<div class="hint">← → navegar · T miniaturas · N notas</div>

<script src="js/deck.js"></script>
</body>
</html>
`);
  writeStyles('css/oferta.css', 'of', css);
  console.log('oferta:', count, 'reglas');
}

// El contenido en texto plano viaja con el bundle
fs.copyFileSync(path.join(SRC, 'aceleradora-maestro-v10.md'), path.join(OUT, 'contenido/aceleradora-maestro-v10.md'));
