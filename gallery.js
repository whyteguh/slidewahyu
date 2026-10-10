const grid = document.getElementById('grid');
const empty = document.getElementById('empty');
const count = document.getElementById('count');

const io = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const f = e.target.querySelector('iframe[data-src]');
    if (f) f.src = f.dataset.src;
    io.unobserve(e.target);
  }
}, { rootMargin: '240px' });

function card({ title, slides, path }) {
  const a = document.createElement('a');
  a.className = 'card';
  a.href = path;
  a.setAttribute('aria-label', `Buka deck ${title}`);

  const frame = document.createElement('span');
  frame.className = 'frame';
  const iframe = document.createElement('iframe');
  iframe.dataset.src = path;
  iframe.title = `Preview: ${title}`;
  iframe.tabIndex = -1;
  frame.append(iframe);

  const meta = document.createElement('span');
  meta.className = 'meta';
  const t = document.createElement('span');
  t.className = 't';
  t.textContent = title;
  const d = document.createElement('span');
  d.className = 'd';
  d.textContent = `${slides ? slides + ' slide · ' : ''}${path}`;
  const hand = document.createElement('span');
  hand.className = 'hand';
  hand.textContent = 'buka →';
  meta.append(t, d, hand);

  a.append(frame, meta);
  return a;
}

fetch('manifest.json')
  .then(r => {
    if (!r.ok) throw Error(r.status);
    return r.json();
  })
  .then(decks => {
    if (!decks.length) {
      empty.hidden = false;
      return;
    }
    const frag = document.createDocumentFragment();
    for (const d of decks) {
      const c = card(d);
      frag.append(c);
      io.observe(c);
    }
    grid.append(frag);
    count.textContent = `${decks.length} deck`;
  })
  .catch(() => {
    empty.hidden = false;
    empty.textContent = 'manifest.json belum ada — jalankan: node tools/build-manifest.mjs';
  });
