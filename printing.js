/* Progressive enhancement: photos remain horizontally scrollable without JS. */
(() => {
  'use strict';
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;
  const track = carousel.querySelector('[data-carousel-track]');
  const previous = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');
  const dots = carousel.querySelector('[data-carousel-dots]');
  const status = carousel.querySelector('[data-carousel-status]');
  const slides = Array.from(track.querySelectorAll('figure'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let positions = [0];
  let current = 0;
  let frame = 0;
  let settleTimer = 0;
  let shouldAnnounce = false;

  // Read the actual distance: CSS gaps are percentages on desktop.
  const slideStep = () => slides.length > 1
    ? slides[1].offsetLeft - slides[0].offsetLeft
    : slides[0].getBoundingClientRect().width;

  slides.forEach((slide, index) => {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'слайд');
    slide.setAttribute('aria-label', `Работа ${index + 1} из ${slides.length}`);
  });

  const sync = () => {
    frame = 0;
    const offset = Math.max(0, track.scrollLeft);
    current = positions.reduce((closest, value, index) =>
      Math.abs(value - offset) < Math.abs(positions[closest] - offset) ? index : closest, 0);
    previous.disabled = offset <= 3;
    next.disabled = offset >= positions[positions.length - 1] - 3;
    Array.from(dots.children).forEach((dot, index) => {
      dot.setAttribute('aria-current', index === current ? 'true' : 'false');
    });
  };

  const announce = () => {
    if (!shouldAnnounce) return;
    const width = slides[0].getBoundingClientRect().width;
    const step = slideStep();
    if (step <= 0) return;
    const gap = step - width;
    const first = Math.min(slides.length - 1, Math.round(track.scrollLeft / step));
    const visible = Math.max(1, Math.floor((track.clientWidth + gap + 2) / step));
    const last = Math.min(slides.length, first + visible);
    status.textContent = last === first + 1
      ? `Работа ${first + 1} из ${slides.length}`
      : `Работы ${first + 1}–${last} из ${slides.length}`;
    shouldAnnounce = false;
  };

  const go = index => {
    const target = Math.max(0, Math.min(positions.length - 1, index));
    shouldAnnounce = true;
    track.scrollTo({ left: positions[target], behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => { sync(); announce(); }, reducedMotion.matches ? 0 : 350);
  };

  const measure = () => {
    const step = slideStep();
    if (step <= 0) return;
    const maximum = Math.max(0, track.scrollWidth - track.clientWidth);
    positions = [0];
    for (let value = step; value < maximum - 3; value += step) positions.push(value);
    if (maximum > 3) positions.push(maximum);
    if (dots.children.length !== positions.length) {
      const fragment = document.createDocumentFragment();
      positions.forEach((_, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-label', `Показать работы, начиная с ${index + 1}`);
        button.setAttribute('aria-controls', 'works-track');
        button.addEventListener('click', () => go(index));
        fragment.append(button);
      });
      dots.replaceChildren(fragment);
    }
    previous.hidden = next.hidden = dots.hidden = maximum <= 3;
    sync();
  };

  previous.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    const targets = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: positions.length - 1 };
    if (!(event.key in targets)) return;
    event.preventDefault();
    go(targets[event.key]);
  });
  track.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(sync);
    clearTimeout(settleTimer);
    settleTimer = window.setTimeout(announce, 180);
  }, { passive: true });
  track.addEventListener('scrollend', () => { sync(); announce(); });
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(track);
  else window.addEventListener('resize', measure);
  measure();

  const menu = document.querySelector('.mobile-menu');
  if (menu) {
    menu.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        menu.open = false;
        menu.querySelector('summary').focus();
      }
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  }
})();
