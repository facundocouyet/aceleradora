/* ============================================================
   Las tablas del informe son filas de grid con las mismas
   columnas, una al lado de la otra. En pantallas angostas no
   entran: acá se agrupan en un contenedor que se desplaza en
   horizontal, para que la tabla se lea sin romper la grilla.
   ============================================================ */
(() => {
  const tracks = el => {
    const cs = getComputedStyle(el);
    return cs.display === 'grid' ? cs.gridTemplateColumns : '';
  };

  // Las filas cuelgan de la sección o de un contenedor de tabla, según
  // el bloque: se miran todos los padres posibles del documento.
  const parents = [document.querySelector('.doc'), ...document.querySelectorAll('.doc *')]
    .filter(el => el.childElementCount > 1);

  parents.forEach(parent => {
    let group = [];

    const flush = () => {
      // Una fila sola es un bloque de layout, no una tabla
      if (group.length > 1) {
        const wrap = document.createElement('div');
        wrap.className = 'tbl';
        group[0].before(wrap);
        group.forEach(row => wrap.appendChild(row));
      }
      group = [];
    };

    Array.from(parent.children).forEach(el => {
      const cols = tracks(el);
      const isRow = cols && cols.split(' ').length > 1;
      if (isRow && (!group.length || tracks(group[0]) === cols)) group.push(el);
      else { flush(); if (isRow) group.push(el); }
    });
    flush();
  });
})();
