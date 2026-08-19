/* Barra de progreso: el único indicador del scroll. */
(() => {
  const fill = document.getElementById('progress-fill');
  const el = document.documentElement;

  const update = () => {
    const max = el.scrollHeight - el.clientHeight;
    fill.style.width = (max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0) + '%';
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
