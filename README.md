# Cáscara Founders — La Aceleradora

Documentación de la oferta unificada (Cáscara + F3), versión 10 · agosto 2026.
Sitio estático, sin build ni dependencias: se abre con cualquier servidor de archivos.

## Las piezas

| Página | Qué es |
|---|---|
| [`index.html`](index.html) | Home interno. Dos tarjetas hacia la presentación y el informe, más la fila del pitch deck. |
| [`presentacion.html`](presentacion.html) | Deck interno de 16 slides de 1920 × 1080, escaladas al viewport. |
| [`presentacion-mobile.html`](presentacion-mobile.html) | La misma presentación re-cortada para teléfono: 18 pantallas apiladas en scroll vertical, con índice tocable y barra de progreso. No es el deck escalado. |
| [`informe.html`](informe.html) | Documento maestro: 16 secciones más el anexo de los tres checklists, paginado en A4 vertical con margen de 0.9in. |
| [`oferta.html`](oferta.html) | La oferta al cliente: 12 slides. Es la pieza que se muestra afuera, y por eso no lleva el pill "← Home". |
| `Cascara Founders - La Oferta.html` | La misma oferta en un solo archivo, con fuentes y fotos adentro. Es lo que baja el botón "HTML ↓". |

En pantallas de menos de 700px, `presentacion.html` redirige a la versión mobile antes de
pintar. El deck se queda para proyectar y presentar; el teléfono recibe la pieza pensada para
scroll: sin snap, sin flechas, sin contador — el gesto es scroll y nada más. La oferta no tiene
versión mobile propia: en teléfono se ve el deck escalado, mejor en horizontal.

## La fila del pitch deck

| Botón | Qué hace |
|---|---|
| **Ver** | Abre `oferta.html` |
| **HTML ↓** | Baja `Cascara Founders - La Oferta.html`, que abre sin servidor y sin red |
| **PDF ↓** | Abre `oferta.html?print=1`, que dispara el diálogo de impresión solo |

Para que el PDF salga bien hay que dejar **"Gráficos de fondo"** activado en el diálogo del
navegador: si no, los fondos de tinta salen en blanco.

## Cómo se maneja un deck

| Tecla | Qué hace |
|---|---|
| `→` `↓` `Espacio` `AvPág` | Slide siguiente |
| `←` `↑` `RePág` | Slide anterior |
| `Inicio` · `Fin` | Primera · última |
| `T` | Rail de miniaturas |
| `N` | Notas del orador |
| `Esc` | Cierra rail y notas |

También se avanza con click: mitad derecha adelante, mitad izquierda atrás. El número de slide
vive en el hash de la URL (`presentacion.html#7`), así que un link puede abrir una slide puntual.

Las tres piezas de pantalla completa se imprimen: los decks sacan una hoja por slide, el informe
pagina en A4 con el pie repetido en cada hoja. El pill "← Home" se oculta al imprimir.

## Cómo se actualiza cuando llega un handoff nuevo

```bash
node tools/port.mjs ~/Downloads/design_handoff_aceleradora
```

Reescribe las cinco páginas y el tramo generado de cada hoja de estilos — lo escrito a mano (el
chrome de arriba, el mobile de abajo) queda intacto, entre los centinelas `↓ generado ↓` /
`↑ fin del tramo generado ↑`. Como las clases se numeran por orden de aparición, si el contenido
cambia mucho conviene revisar que las reglas mobile sigan apuntando al mismo elemento.

Después, siempre que cambie la oferta o el JS del deck:

```bash
node tools/bundle-oferta.mjs
```

Rehace el archivo autocontenido que baja el botón "HTML ↓" (unos 3,6 MB: adentro van las hojas,
el JS, las fuentes y las fotos como `data:`).

## Estructura

```
├─ index.html · presentacion.html · presentacion-mobile.html · informe.html · oferta.html
├─ Cascara Founders - La Oferta.html    el autocontenido que se descarga
├─ css/
│  ├─ tokens-f3.css     paleta monocroma, fuentes y las variables del chrome
│  ├─ base.css          reset, selección y el pill "← Home"
│  ├─ deck-chrome.css   escenario, rail, notas e impresión: lo comparten los dos decks
│  ├─ home.css          home
│  ├─ deck.css          las 16 slides internas
│  ├─ deck-mobile.css   la columna de 520px + las 18 pantallas
│  ├─ oferta.css        las 12 slides de la oferta
│  └─ informe.css       hoja A4, impresión + estilos del documento
├─ tools/
│  ├─ port.mjs          el porteo del handoff, ver arriba
│  └─ bundle-oferta.mjs el archivo autocontenido
├─ js/
│  ├─ deck.js           escalado, navegación, rail, notas — los dos decks
│  ├─ deck-mobile.js    barra de progreso
│  └─ informe.js        agrupa las filas de tabla para que se desplacen en mobile
├─ assets/              el lockup cáscara/founders, fotos del equipo, fuentes
└─ contenido/aceleradora-maestro-v10.md   el texto del informe en plano
```

Las clases `hmN`, `slN`, `mbN`, `ofN` y `rpN` son los estilos del diseño, deduplicados uno a uno
desde el prototipo del handoff y ordenados igual que el markup. Editar contenido es tocar el
HTML; editar la forma es tocar la regla correspondiente.

## Design tokens

Todo el set corre sobre el sistema F3 en monocromo, declarado en `css/tokens-f3.css`: tinta
`#171717` · papel `#ECEAE4` · blanco `#FAFAFA`, con gris `#2D2D2D`, gris claro `#6A6A66` y
relleno `#E2DFD8`. Sin color, sin degradados y sin sombras: la jerarquía se hace con peso,
escala y reglas. Radio 0 salvo círculos verdaderos y el pill de Home.

Tipografía: **Helvetica Now Display** en 400 / 500 / 700 para todo, y **Exposure** —variable en
el eje de peso— para el énfasis de una a cuatro palabras y las cifras monumentales
(`font-variation-settings:'wght' 420` en texto, `620–640` en las cifras). Easing único
`cubic-bezier(.2,.8,.2,1)`.

Las fuentes son las del design system de F3, auto-hospedadas en `assets/fonts/`. Su licencia es
la del design system: el repositorio es público, así que conviene revisarlo.

## Ver en local

```bash
npx serve .
```
