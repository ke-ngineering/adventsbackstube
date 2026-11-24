/* Neues Spiel (Türchen 9): Ausstecher – Ausstechformen lückenlos auf die Teigplatte legen.
   Erzeugung: Die Teigplatte wird in zufällige Formen aus 3–5 Feldern zerlegt; die Formen werden dann gedreht und gemischt.
   Damit ist jedes Level garantiert lösbar. Drehen ist erlaubt, Spiegeln nicht nötig.
   Bedienung: Form aus der Schale auf den Teig ziehen · antippen = drehen · gelegte Form antippen = zurück in die Schale. */
const Aus = (() => {
const MOTIFS = {
  stern: ['...XX...', '..XXXX..', 'XXXXXXXX', '.XXXXXX.', '..XXXX..', '.XXXXXX.', 'XXX..XXX'],
  glocke: ['..XX..', '.XXXX.', '.XXXX.', '.XXXX.', 'XXXXXX', 'XXXXXX', '..XX..'],
  herz: ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'],
};
const COLORS = ['#e7b56e', '#c98a4a', '#f2b8b0', '#d9a441', '#9a5a2c', '#e9c98f', '#b97a56', '#f0d08c', '#c97b7b', '#a8b86a', '#d6913f', '#8fb3c9'];
function levelCfg(L) {
  const sizes = [[3, 4], [4, 4], [4, 5], [5, 5], [5, 5], [5, 6], [6, 6], [6, 6], [6, 7], [7, 7]];
  let i = Math.min(L, sizes.length) - 1; if (!Feat.has('aus.gross')) i = Math.min(i, 7);
  return {R: sizes[i][0], C: sizes[i][1], min: L <= 2 ? 4 : 3, max: L <= 2 ? 4 : L <= 6 ? 5 : 5};
}
const norm = cells => { const r0 = Math.min(...cells.map(c => c[0])), c0 = Math.min(...cells.map(c => c[1])); return cells.map(([r, c]) => [r - r0, c - c0]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); };
const turn = cells => norm(cells.map(([r, c]) => [c, -r]));
function generate(L, spec) {
  let rows, min, max, seed;
  if (spec) { rows = MOTIFS[spec.motif]; min = 3; max = 5; seed = spec.seed; }
  else { const c = levelCfg(L); rows = Array(c.R).fill('X'.repeat(c.C)); min = c.min; max = c.max; seed = L * 4517 + 9; }
  const R = rows.length, C = rows[0].length, mask = rows.join('').split('').map(ch => ch === 'X'), cells = [...mask.keys()].filter(i => mask[i]);
  const nb = i => { const r = Math.floor(i / C), c = i % C, o = []; if (r > 0) o.push(i - C); if (r < R - 1) o.push(i + C); if (c > 0) o.push(i - 1); if (c < C - 1) o.push(i + 1); return o.filter(j => mask[j]); };
  for (let t = 0; t < 2000; t++) {
    const r = rng(seed + t * 104729), owner = Array(R * C).fill(-1), pieces = [];
    let ok = true;
    for (;;) {
      const free = cells.filter(i => owner[i] < 0); if (!free.length) break;
      // engste freie Stelle zuerst, damit keine Inseln entstehen
      free.sort((a, b) => nb(a).filter(j => owner[j] < 0).length - nb(b).filter(j => owner[j] < 0).length || r() - .5);
      const want = min + Math.floor(r() * (max - min + 1)), p = [free[0]]; owner[free[0]] = pieces.length;
      while (p.length < want) {
        const opts = [...new Set(p.flatMap(nb))].filter(j => owner[j] < 0); if (!opts.length) break;
        const j = opts[Math.floor(r() * opts.length)]; owner[j] = pieces.length; p.push(j);
      }
      if (p.length < min) { ok = false; break; }
      pieces.push(p);
    }
    if (!ok) continue;
    // nicht zu viele gerade Stangen – die sind langweilig
    const straight = pieces.filter(p => new Set(p.map(i => Math.floor(i / C))).size === 1 || new Set(p.map(i => i % C)).size === 1).length;
    if (straight > Math.max(1, pieces.length / 4)) continue;
    const shapes = pieces.map((p, k) => {
      const home = norm(p.map(i => [Math.floor(i / C), i % C]));
      const at = [Math.min(...p.map(i => Math.floor(i / C))), Math.min(...p.map(i => i % C))];
      let cur = home, turns = Math.floor(r() * 4); for (let q = 0; q < turns; q++) cur = turn(cur);
      return {id: k, home, at, cells: cur, color: COLORS[k % COLORS.length]};
    });
    return {R, C, mask, shapes: shuffle(shapes, r)};
  }
  throw new Error('Keine Teigplatte gefunden');
}

let api, lvl, G, placed, hints, moves, mel, won, drag = null, noteI;
function begin(L, resume, a) {
  api = a; lvl = L; mel = melodyFor(L + 6); G = generate(L, api.special); hints = 0; moves = 0; won = false; noteI = 0;
  placed = {}; // id → {r, c, cells}
  const c = resume ? api.getCur() : null;
  if (c && c.placed && c.cells) { placed = c.placed; hints = c.hints || 0; moves = c.moves || 0; G.shapes.forEach(s => { if (c.cells[s.id]) s.cells = c.cells[s.id]; }); }
  else api.saveCur(null);
  api.stage.innerHTML = `<div class="aus-wrap"><div class="teig" id="teig" style="--r:${G.R};--c:${G.C}">${G.mask.map(m => `<span class="tz${m ? '' : ' gap'}"></span>`).join('')}<div class="teig-layer" id="teigLayer"></div></div>
    <div class="schale" id="schale"></div></div>`;
  api.controls.innerHTML = `<button class="btn" id="ausHint">Tipp</button><button class="btn" id="restart">Neu starten</button><button class="btn" id="ausHelp">Wie geht das?</button>`;
  $('ausHint').onclick = hint; $('restart').onclick = () => api.restart(); $('ausHelp').onclick = explain;
  api.legend.innerHTML = '<span>Ziehe die Formen auf den Teig. Antippen dreht eine Form. Kein Krümel Teig darf übrig bleiben!</span>';
  const st = $('teig').parentNode; st.onpointerdown = down; st.onpointermove = move; st.onpointerup = st.onpointercancel = up;
  draw();
  const p = prog('aus'); if (!p.intro) { p.intro = true; persist(); explain(); }
}
function explain() {
  api.help('Der Ausstecher', `<ol class="how">
    <li><b>Ziel:</b> Alle Ausstechformen so auf die Teigplatte legen, dass <b>kein Feld Teig</b> übrig bleibt.</li>
    <li>Eine Form aus der Schale mit dem Finger auf den Teig <b>ziehen</b>. Passt sie, rastet sie ein.</li>
    <li>Eine Form <b>antippen</b> dreht sie um eine Vierteldrehung. Eine gelegte Form antippen legt sie zurück in die Schale.</li></ol>
    <p class="how-tip">Tipp: Fang mit den sperrigen Formen und den Ecken an – kleine Formen passen später noch in die Lücken.</p>`);
}
const cellPx = () => $('teig').getBoundingClientRect().width / G.C;
function shapeSVG(s, size) {
  const h = Math.max(...s.cells.map(c => c[0])) + 1, w = Math.max(...s.cells.map(c => c[1])) + 1;
  return `<svg viewBox="0 0 ${w * 10} ${h * 10}" width="${w * size}" height="${h * size}">${s.cells.map(([r, c]) => `<rect x="${c * 10 + .4}" y="${r * 10 + .4}" width="9.2" height="9.2" rx="2.2" fill="${s.color}" stroke="rgba(90,50,20,.45)" stroke-width=".8"/>`).join('')}${s.cells.map(([r, c]) => `<circle cx="${c * 10 + 5}" cy="${r * 10 + 5}" r="1.1" fill="rgba(255,255,255,.55)"/>`).join('')}</svg>`;
}
function occ() { const o = Array(G.R * G.C).fill(-1); for (const id in placed) placed[id].cells.forEach(([r, c]) => { o[(placed[id].r + r) * G.C + placed[id].c + c] = +id; }); return o; }
function fits(s, r0, c0, ignore) {
  const o = occ();
  return s.cells.every(([r, c]) => { const a = r0 + r, b = c0 + c, i = a * G.C + b; return a >= 0 && b >= 0 && a < G.R && b < G.C && G.mask[i] && (o[i] < 0 || o[i] === ignore); });
}
function draw() {
  const px = cellPx();
  $('teigLayer').innerHTML = Object.keys(placed).map(id => { const s = G.shapes.find(x => x.id === +id), p = placed[id];
    return `<div class="form gelegt" data-id="${id}" style="left:${p.c * px}px;top:${p.r * px}px">${shapeSVG({cells: p.cells, color: s.color}, px)}</div>`; }).join('');
  const rest = G.shapes.filter(s => !placed[s.id]), small = Math.max(14, Math.min(26, px * .55));
  $('schale').innerHTML = rest.length ? rest.map(s => `<div class="form" data-id="${s.id}">${shapeSVG(s, small)}</div>`).join('') : '<span class="soft">Alle Formen liegen!</span>';
  const left = G.mask.filter(Boolean).length - Object.values(placed).reduce((n, p) => n + p.cells.length, 0);
  api.status(`${rest.length} ${rest.length === 1 ? 'Form' : 'Formen'} in der Schale · ${left} Felder Teig frei`);
}
function down(e) {
  if (won) return;
  const f = e.target.closest('.form'); if (!f) return;
  const id = +f.dataset.id, s = G.shapes.find(x => x.id === id), fr = f.getBoundingClientRect();
  const onBoard = f.classList.contains('gelegt'), cells = onBoard ? placed[id].cells : s.cells;
  const h = Math.max(...cells.map(c => c[0])) + 1, w = Math.max(...cells.map(c => c[1])) + 1;
  // gegriffenes Feld der Form (in Formkoordinaten)
  const gr = Math.min(h - 1, Math.floor((e.clientY - fr.top) / fr.height * h)), gc = Math.min(w - 1, Math.floor((e.clientX - fr.left) / fr.width * w));
  drag = {id, s, onBoard, gr, gc, x0: e.clientX, y0: e.clientY, moved: false, ghost: null};
  e.currentTarget.setPointerCapture?.(e.pointerId); e.preventDefault();
}
function move(e) {
  if (!drag) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 8) return;
  const px = cellPx();
  if (!drag.moved) {
    drag.moved = true;
    const cells = drag.onBoard ? placed[drag.id].cells : drag.s.cells;
    if (drag.onBoard) { drag.s.cells = cells; delete placed[drag.id]; draw(); }
    const gh = document.createElement('div'); gh.className = 'form ghost'; gh.innerHTML = shapeSVG({cells, color: drag.s.color}, px);
    document.body.appendChild(gh); drag.ghost = gh;
  }
  // Form schwebt etwas über dem Finger, damit man sieht, wohin sie fällt
  drag.ghost.style.left = (e.clientX - (drag.gc + .5) * px) + 'px';
  drag.ghost.style.top = (e.clientY - (drag.gr + .5) * px - px * .6) + 'px';
  const t = target(drag, e, px); drag.ghost.classList.toggle('ok', !!t);
}
function target(d, e, px) {
  const br = $('teig').getBoundingClientRect();
  const r0 = Math.round((e.clientY - px * .6 - br.top) / px - .5) - d.gr, c0 = Math.round((e.clientX - br.left) / px - .5) - d.gc;
  return fits(d.s, r0, c0) ? [r0, c0] : null;
}
function up(e) {
  if (!drag) return; const d = drag; drag = null;
  if (!d.moved) { // Antippen: in der Schale drehen, auf dem Teig zurücklegen
    if (d.onBoard) { d.s.cells = placed[d.id].cells; delete placed[d.id]; Snd.tap(.8); }
    else { d.s.cells = turn(d.s.cells); Snd.tap(1.2); }
    moves++; save(); draw(); return;
  }
  const px = cellPx(), t = target(d, e, px); d.ghost.remove();
  if (t) { placed[d.id] = {r: t[0], c: t[1], cells: d.s.cells}; moves++; const n = tones(mel); Snd.note(n[noteI % n.length][0], .4); noteI++; }
  else Snd.nope();
  save(); draw(); check();
}
function save() { const cells = {}; G.shapes.forEach(s => { cells[s.id] = s.cells; }); api.saveCur({placed, cells, hints, moves}); }
function check() {
  if (Object.keys(placed).length !== G.shapes.length) return;
  won = true; $('teig').classList.add('fertig'); Snd.stop();
  const stars = Math.max(1, 3 - hints);
  setTimeout(() => api.win({stars, melody: mel, text: hints ? `Alles ausgestochen – mit ${hints} ${hints === 1 ? 'Tipp' : 'Tipps'}.` : 'Kein Krümel Teig übrig – perfekt ausgestochen!'}), 800);
}
function hint() {
  if (won) return;
  // eine Form an ihren Platz aus der Lösung legen; liegt dort etwas anderes, kommt es zurück in die Schale
  const s = G.shapes.find(x => !placed[x.id] || placed[x.id].r !== x.at[0] || placed[x.id].c !== x.at[1] || JSON.stringify(placed[x.id].cells) !== JSON.stringify(x.home)); if (!s) return;
  const o = occ(); s.home.forEach(([r, c]) => { const i = (s.at[0] + r) * G.C + s.at[1] + c; if (o[i] >= 0 && o[i] !== s.id) { const other = G.shapes.find(x => x.id === o[i]); other.cells = placed[o[i]].cells; delete placed[o[i]]; } });
  s.cells = s.home; placed[s.id] = {r: s.at[0], c: s.at[1], cells: s.home}; hints++;
  api.toast && api.toast('Eine Form liegt jetzt an ihrem richtigen Platz.');
  save(); draw(); check();
}
return {id: 'aus', title: 'Ausstecher', sub: 'Lege alle Formen lückenlos auf den Teig', winTitle: 'Alles ausgestochen!',
  desc: 'Formen-Puzzle: kein Krümel Teig darf übrig bleiben',
  start: begin, stop() { won = true; drag = null; document.querySelectorAll('.form.ghost').forEach(x => x.remove()); }, _test: {generate, levelCfg, turn, norm, MOTIFS}};
})();
