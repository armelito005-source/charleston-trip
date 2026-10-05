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
        // Horizontal only inside chips row - never scroll the page
        const row = document.getElementById('chips');
        if (row) {
          const left = chip.offsetLeft - (row.clientWidth - chip.clientWidth) / 2;
          row.scrollTo({ left: Math.max(0, left), behavior: reduced ? 'auto' : 'smooth' });
        }
      }
    });
  }, { rootMargin: '-30% 0px -55% 0px', threshold: 0.01 });
  sections.forEach(s => io.observe(s));
  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(x => x.classList.remove('is-active'));
    c.classList.add('is-active');
  }));


  // Soft falling leaves (disabled when reduced motion)
  (function fallLeaves() {
    const sky = document.getElementById('fallSky');
    if (!sky) return;
    sky.style.pointerEvents = 'none';
    sky.setAttribute('aria-hidden', 'true');
    const colors = ['#b85a32', '#c4922e', '#a84a2f', '#7a3a3a', '#d4a054', '#7a8f6a', '#8f3f22'];
    const leafPath = 'M12 2c1.2 3.2 1.1 5.6 0 7.4 2.4-1 4.8-.6 7.1.8-1.6 1.7-3.6 2.6-5.8 2.6 2.2.9 3.6 2.6 4.2 5.1-2.6-.2-4.7-1.1-6.1-2.7-.2 2.6-1.3 4.8-3.5 6.8-1.1-2.5-1-5-.1-7.1C5.6 16.3 3.4 16 1 14.8c1.8-1.8 4-2.6 6.4-2.4C5.2 11 4 8.8 3.6 6c2.4.8 4.4 2.2 5.6 4.1C9.5 7.2 10.2 4.6 12 2z';
    const count = reduced ? 4 : (matchMedia('(max-width:600px)').matches ? 8 : 12);
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'leaf';
      const size = 36 + Math.random() * 40;
      const left = Math.random() * 100;
      const dx = (Math.random() * 80 - 40) + 'px';
      const dur = (14 + Math.random() * 16).toFixed(1) + 's';
      const delay = (-Math.random() * 18).toFixed(1) + 's';
      const color = colors[i % colors.length];
      el.style.cssText = `left:${left}%;width:${size}px;height:${size}px;--dx:${dx};animation-duration:${dur};animation-delay:${delay};color:${color}`;
      el.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="${leafPath}"/></svg>`;
      sky.appendChild(el);
    }
  })();

})();
