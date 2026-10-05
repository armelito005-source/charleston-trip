(function () {
  const KEY = 'chs-trip-saves-v1';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const chips = document.querySelectorAll('.chip');
  const sections = [...document.querySelectorAll('main section[id]')];

  let saved = new Set();
  try { saved = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch (e) {}
  function persist() { localStorage.setItem(KEY, JSON.stringify([...saved])); }
  document.querySelectorAll('.heart').forEach(btn => {
    const id = btn.dataset.save;
    if (saved.has(id)) btn.setAttribute('aria-pressed', 'true');
    btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) saved.add(id); else saved.delete(id);
      persist();
    });
  });

  document.querySelectorAll('.card-media').forEach(m => {
    const g = m.querySelector('.gal'); if (!g) return;
    const n = g.children.length; if (n < 2) return;
    const dots = [...m.querySelectorAll('.gdots button')];
    const cnt = m.querySelector('.gcount');
    const cur = () => Math.round(g.scrollLeft / Math.max(1, g.clientWidth));
    const paint = k => {
      k = Math.max(0, Math.min(n - 1, k));
      dots.forEach((d, j) => {
        if (j === k) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
      if (cnt) cnt.textContent = (k + 1) + '/' + n;
      [...g.children].forEach((s, i) => s.classList.toggle('loaded', i === k));
    };
    const go = k => {
      k = ((k % n) + n) % n;
      paint(k);
      g.scrollTo({ left: k * g.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
    };
    let t;
    g.addEventListener('scroll', () => {
      paint(cur());
      clearTimeout(t);
      t = setTimeout(() => paint(cur()), 120);
    }, { passive: true });
    const prev = m.querySelector('.prev'), next = m.querySelector('.next');
    if (prev) prev.addEventListener('click', e => { e.stopPropagation(); go(cur() - 1); });
    if (next) next.addEventListener('click', e => { e.stopPropagation(); go(cur() + 1); });
    dots.forEach(d => d.addEventListener('click', e => { e.stopPropagation(); go(+d.dataset.k); }));
    g.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(cur() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur() - 1); }
    });
    addEventListener('resize', () => { g.scrollLeft = cur() * g.clientWidth; });
  });

  const byId = Object.fromEntries([...chips].map(c => [c.getAttribute('href').slice(1), c]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      chips.forEach(c => c.classList.remove('is-active'));
      const chip = byId[en.target.id];
      if (chip) {
        chip.classList.add('is-active');
        chip.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
      }
    });
  }, { rootMargin: '-30% 0px -55% 0px', threshold: 0.01 });
  sections.forEach(s => io.observe(s));
  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(x => x.classList.remove('is-active'));
    c.classList.add('is-active');
  }));
})();
