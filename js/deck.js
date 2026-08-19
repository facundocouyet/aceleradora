/* ============================================================
   Deck de 16 slides: escalado al viewport, navegación por
   teclado, rail de miniaturas, notas del orador e impresión.
   El índice de slide vive en el hash de la URL (1-indexado).
   ============================================================ */
(() => {
  const stage = document.querySelector('.stage');
  const canvas = document.querySelector('.canvas');
  const rail = document.querySelector('.rail');
  const notes = document.querySelector('.notes');
  const notesBody = document.querySelector('.notes-body');
  const hint = document.querySelector('.hint');
  const slides = Array.from(canvas.querySelectorAll('.slide'));

  let index = 0;

  /* ---- Escalado: el canvas de 1920 × 1080 entra entero en la ventana ---- */
  const fit = () => {
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    canvas.style.setProperty('--deck-scale', scale);
  };

  /* ---- Rail de miniaturas: clones estáticos de cada slide ---- */
  const railItems = slides.map((slide, i) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'rail-item';

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    thumb.style.background = slide.style.background;
    thumb.appendChild(slide.firstElementChild.cloneNode(true));

    const label = document.createElement('span');
    label.className = 'rail-label';
    label.textContent = slide.dataset.screenLabel || String(i + 1).padStart(2, '0');

    item.append(thumb, label);
    item.addEventListener('click', () => go(i));
    rail.appendChild(item);
    return item;
  });

  const show = i => {
    index = (i + slides.length) % slides.length;
    slides.forEach((slide, n) => slide.toggleAttribute('data-active', n === index));
    railItems.forEach((item, n) => item.toggleAttribute('data-active', n === index));

    // El letterbox toma el fondo de la slide activa, así no queda franja
    stage.style.background = slides[index].style.background;

    notesBody.textContent = slides[index].dataset.speakerNotes || 'Sin notas.';
    if (railItems[index]) railItems[index].scrollIntoView({ block: 'nearest' });
  };

  const go = i => {
    show(i);
    history.replaceState(null, '', '#' + (index + 1));
  };

  const dismissHint = () => hint.toggleAttribute('data-hidden', true);

  const toggle = panel => panel.toggleAttribute('data-open');

  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ': go(index + 1); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': go(index - 1); break;
      case 'Home': go(0); break;
      case 'End': go(slides.length - 1); break;
      case 't': case 'T': toggle(rail); break;
      case 'n': case 'N': toggle(notes); break;
      case 'Escape':
        rail.removeAttribute('data-open');
        notes.removeAttribute('data-open');
        break;
      default: return;
    }
    e.preventDefault();
    dismissHint();
  });

  // Click sobre el escenario: mitad derecha avanza, mitad izquierda vuelve
  stage.addEventListener('click', e => {
    if (swiped || e.target.closest('a, button')) return;
    go(e.clientX > window.innerWidth / 2 ? index + 1 : index - 1);
    dismissHint();
  });

  // Swipe horizontal en táctil. Un gesto no cuenta además como click.
  let startX = 0, startY = 0, swiped = false;
  stage.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    swiped = false;
  }, { passive: true });

  stage.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
    swiped = true;
    go(dx < 0 ? index + 1 : index - 1);
  }, { passive: true });

  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', () => show((parseInt(location.hash.slice(1), 10) || 1) - 1));

  fit();
  show((parseInt(location.hash.slice(1), 10) || 1) - 1);
  setTimeout(dismissHint, 6000);
})();
