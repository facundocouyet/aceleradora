# Aceleradora Cáscara

Documentación interna de la oferta unificada (Cáscara + F3), versión 10 · agosto 2026.
Sitio estático, sin build ni dependencias: se abre con cualquier servidor de archivos.

## Las tres piezas

| Página | Qué es |
|---|---|
| [`index.html`](index.html) | Home. Dos cards hacia la presentación y el informe. |
| [`presentacion.html`](presentacion.html) | Deck de 16 slides de 1920 × 1080, escaladas al viewport. |
| [`informe.html`](informe.html) | Documento maestro: 16 secciones más el anexo de los tres checklists, paginado en A4 vertical con margen de 0.9in. |

## Cómo se maneja la presentación

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

Las dos piezas se imprimen: la presentación saca una hoja por slide, el informe pagina en A4 con
el pie repetido en cada hoja. El pill "← Home" se oculta al imprimir.

## Estructura

```
├─ index.html · presentacion.html · informe.html
├─ css/
│  ├─ tokens.css      paleta, fuentes, base y el pill "← Home"
│  ├─ home.css        home
│  ├─ deck.css        escenario, rail, notas, impresión + estilos de las slides
│  └─ informe.css     hoja A4, impresión + estilos del documento
├─ js/deck.js         escalado, navegación, rail, notas
├─ assets/            marca del arquero + Helvetica Neue LT Std y Redaction
└─ contenido/aceleradora-maestro-v10.md   el texto del informe en plano
```

Las clases `hmN`, `slN` y `rpN` son los estilos del diseño, deduplicados uno a uno desde el
prototipo del handoff y ordenados igual que el markup. Editar contenido es tocar el HTML;
editar la forma es tocar la regla correspondiente.

## Design tokens

Cuatro colores más dos derivados, declarados en `css/tokens.css`:
Klein `#10069F` · tiza `#DBD7D2` · papel `#FBFAF8` · negro `#000000`, con tinta `#0A0A0C` y
tinta suave `#1A1A1E`. Sin gradientes y sin sombras: el énfasis es el aro Klein.
Tipografía Helvetica Neue LT Std en bold 700 / medium 500 / light 300, y Redaction siempre
itálica para énfasis, números y eyebrows. Easing único `cubic-bezier(.2,.8,.2,1)`.

Las fuentes son las del design system de Cáscara Collective, auto-hospedadas en `assets/fonts/`.
Su licencia es la del design system: si el repositorio se hace público, conviene revisarlo.

## Ver en local

```bash
npx serve .
```
