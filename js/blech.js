/* Mechanik 2: Glasur-Blech – alle Plätzchen glasieren.
   Antippen wechselt ein Plätzchen UND seine Nachbarn zwischen glasiert/unglasiert.
   Eigene Wendung: Die FORM bestimmt, welche Nachbarn mitwechseln.
   Level entstehen rückwärts (fertiges Blech + zufällige Tipper) → immer lösbar.
   Ein GF(2)-Löser berechnet die minimale Zugzahl (Ziel für 3 Sterne) und liefert Tipps. */
const Blech = (() => {
const SHAPES = {
  taler:  {name:'Taler',        off:[[0,0],[1,0],[-1,0],[0,1],[0,-1]]},   // Kreuz
  stern:  {name:'Zimtstern',    off:[[0,0],[1,1],[1,-1],[-1,1],[-1,-1]]}, // schräg
  stange: {name:'Spritzgebäck', off:[[0,0],[0,1],[0,-1],[0,2],[0,-2]]},   // waagerechte Reihe
};
function levelCfg(L) {
  const N = L <= 3 ? 4 : L <= 9 ? 5 : L <= 17 ? 6 : 7;
  const kinds = L < 4 ? ['taler'] : L < 10 ? ['taler', 'stern'] : ['taler', 'stern', 'stange'];
  const k = Math.min(Math.floor(N * N * .5), 3 + Math.floor(L * .7));
  return {N, kinds, k};
}

let api, lvl, N, shape, aff, g, taps, hints, par, noteI, mel, hist;

function affected(i) {
  const r = Math.floor(i / N), c = i % N;
  return SHAPES[shape[i]].off.map(([dr, dc]) => [r + dr, c + dc])
    .filter(([a, b]) => a >= 0 && b >= 0 && a < N && b < N).map(([a, b]) => a * N + b);
}
const apply = (state, i) => { for (const j of aff[i]) state[j] ^= 1; };
const pop = x => { let n = 0; while (x) { n += Number(x & 1n); x >>= 1n; } return n; };

// Minimale Menge an Tippern, die alles glasiert (Gauß über GF(2)); null = unlösbar
function solve(state) {
  const M = N * N, rows = [];
  for (let j = 0; j < M; j++) {
    let m = 0n; for (let i = 0; i < M; i++) if (aff[i].includes(j)) m |= 1n << BigInt(i);
    rows.push({m, b: state[j] ? 0 : 1});
  }
  const piv = []; let r = 0;
  for (let c = 0; c < M && r < M; c++) {
    const bit = 1n << BigInt(c); let p = -1;
    for (let k = r; k < M; k++) if (rows[k].m & bit) { p = k; break; }
    if (p < 0) continue;
    [rows[r], rows[p]] = [rows[p], rows[r]];
    for (let k = 0; k < M; k++) if (k !== r && (rows[k].m & bit)) { rows[k].m ^= rows[r].m; rows[k].b ^= rows[r].b; }
    piv.push(c); r++;
  }
  for (let k = r; k < M; k++) if (rows[k].b) return null;
  const isPiv = new Set(piv), free = [...Array(M).keys()].filter(c => !isPiv.has(c));
  const lim = Math.min(free.length, 12); let best = null;
  for (let a = 0; a < (1 << lim); a++) {
    let x = 0n;
    free.forEach((c, t) => { if (t < lim && (a >> t) & 1) x |= 1n << BigInt(c); });
    for (let k = 0; k < r; k++) {
      const c = piv[k], others = rows[k].m & ~(1n << BigInt(c));
      if (rows[k].b ^ (pop(others & x) & 1)) x |= 1n << BigInt(c);
    }
    const w = pop(x); if (!best || w < best.w) best = {w, x};
  }
  return [...Array(M).keys()].filter(i => (best.x >> BigInt(i)) & 1n);
}

function generate(L) {
  const {N: n, kinds, k} = levelCfg(L); N = n;
  for (let t = 0; t < 50; t++) {
    const r = rng(L * 4241 + t * 7717 + 3);
    shape = Array.from({length: N * N}, () => kinds[Math.floor(r() * kinds.length)]);
    aff = shape.map((_, i) => affected(i));
    const state = Array(N * N).fill(1);
    shuffle([...Array(N * N).keys()], r).slice(0, k).forEach(i => apply(state, i));
    const sol = solve(state);
    if (sol && sol.length >= Math.min(k, 3) && state.some(v => !v)) return {state, par: sol.length};
  }
  throw new Error('Kein Blech gefunden');
}

function begin(L, resume, a) {
  api = a; lvl = L; mel = melodyFor(L + 1);
  const gen = generate(L); g = gen.state; par = gen.par; taps = 0; hints = 0; noteI = 0; hist = [];
  const c = resume ? api.getCur() : null;
  if (c && Array.isArray(c.g) && c.g.length === g.length) { g = c.g; taps = c.taps || 0; hints = c.hints || 0; noteI = c.noteI || 0; hist = c.hist || []; }
  else api.saveCur(null);
  api.stage.innerHTML = `<div class="blech" id="blech" style="--n:${N}">${g.map((v, i) =>
    `<button class="cell" data-i="${i}" aria-label="${SHAPES[shape[i]].name}"><span class="cookie s-${shape[i]}${v ? ' on' : ''}"></span></button>`).join('')}</div>`;
  $('blech').onclick = onTap;
  api.controls.innerHTML = `<button class="btn" id="bUndo">↶ Rückgängig</button><button class="btn" id="hint">Tipp</button><button class="btn" id="restart">Neu starten</button>`;
  $('bUndo').onclick = () => { if (!hist.length) return; const i = hist.pop(); apply(g, i); taps--; Snd.tap(.7); paint(aff[i]); saveCur(); status(); };
  $('hint').onclick = showHint;
  $('restart').onclick = () => api.restart();
  const kinds = [...new Set(shape)];
  api.legend.innerHTML = kinds.map(k => `<span class="pat">${mini(k)}${SHAPES[k].name}</span>`).join('');
  status();
}
// kleines 5×5-Schema: welche Nachbarn wechseln mit
function mini(k) {
  const on = new Set(SHAPES[k].off.map(([r, c]) => (r + 2) * 5 + c + 2));
  return `<span class="mini" aria-hidden="true">${[...Array(25).keys()].map(i => `<b class="${i === 12 ? 'me' : on.has(i) ? 'y' : ''}"></b>`).join('')}</span>`;
}
function status() { api.status(`${taps} ${taps === 1 ? 'Zug' : 'Züge'} · Bestwert ${par}`); $('bUndo').disabled = !hist.length; }
function saveCur() { api.saveCur({g, taps, hints, noteI, hist: hist.slice(-60)}); }
function paint(idx) {
  idx.forEach((j, n) => {
    const el = document.querySelector(`.cell[data-i="${j}"] .cookie`); if (!el) return;
    el.classList.toggle('on', !!g[j]);
    el.classList.remove('flip'); void el.offsetWidth; el.style.animationDelay = (n * 40) + 'ms'; el.classList.add('flip');
  });
}
function onTap(e) {
  const b = e.target.closest('.cell'); if (!b) return;
  const i = +b.dataset.i;
  document.querySelectorAll('.cell.hint').forEach(x => x.classList.remove('hint'));
  apply(g, i); taps++; hist.push(i);
  const notes = mel.notes; Snd.note(notes[noteI % notes.length][0], .4); noteI++;
  paint(aff[i]); saveCur(); status();
  if (g.every(v => v)) setTimeout(() => {
    let stars = taps <= par ? 3 : taps <= par + 4 ? 2 : 1; stars = Math.max(1, stars - hints);
    api.win({stars, melody: mel,
      text: taps <= par ? `Meisterhaft – ${taps} Züge, genau der Bestwert!` : `Glasiert in ${taps} Zügen. Der Bestwert wäre ${par}.`});
  }, 500);
}
function showHint() {
  const sol = solve(g); if (!sol || !sol.length) return;
  hints++; saveCur();
  const el = document.querySelector(`.cell[data-i="${sol[0]}"]`); el && el.classList.add('hint');
  api.status(`Tipp: das leuchtende Plätzchen (kostet einen Stern)`);
}

return {id:'blech', title:'Glasur-Blech', sub:'Glasiere alle Plätzchen – die Form verrät, wer mitwechselt',
  desc:'Knobeln: jedes Plätzchen nimmt Nachbarn mit',
  start: begin, stop() {}, _test: {generate, solve, levelCfg, apply: (st, i) => apply(st, i)}};
})();
