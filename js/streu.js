/* Neues Spiel (Türchen 11): Zuckerstreusel – Bilderrätsel (Nonogramm).
   Zahlen am Rand: Blöcke bestreuter Felder in dieser Reihe/Spalte, in Reihenfolge. Zwischen gleichfarbigen Blöcken liegt mindestens ein leeres Feld.
   Jedes Bild wird vom Zeilenlöser geprüft: Es lässt sich allein durch Schlussfolgern lösen, ohne Raten (eindeutig).
   Wendung „bunte Streusel“ (Türchen 19): mehrere Farben; verschiedenfarbige Blöcke dürfen direkt aneinanderstoßen. */
const Streu = (() => {
// Zeilenlöser für (farbige) Nonogramme. Werte: -1 unbekannt, 0 leer, k>0 Farbe k.
function clues(line) { const o = []; let i = 0; while (i < line.length) { if (!line[i]) { i++; continue; } const c = line[i]; let n = 0; while (i < line.length && line[i] === c) { n++; i++; } o.push([n, c]); } return o; }
function solveLine(cl, cur, colors) {
  const n = cur.length, m = cl.length, can = (i, v) => cur[i] === -1 || cur[i] === v;
  // f[j][i]: erreichbar
  const key = (i, j) => j * (n + 2) + i, F = new Uint8Array((n + 2) * (m + 1)), B = new Uint8Array((n + 2) * (m + 1));
  const trans = (i, j, cb) => { // liefert Übergänge von (i,j)
    if (i < n && can(i, 0)) cb(i + 1, j, [[i, 0]]);
    if (j < m) { const [len, c] = cl[j]; if (i + len <= n) { let ok = true; for (let k = i; k < i + len; k++) if (!can(k, c)) { ok = false; break; }
      if (ok) { const gap = j + 1 < m && cl[j + 1][1] === c; if (gap) { if (i + len < n && can(i + len, 0)) cb(i + len + 1, j + 1, [[i, c, len], [i + len, 0]]); } else cb(i + len, j + 1, [[i, c, len]]); } } }
  };
  F[key(0, 0)] = 1;
  for (let i = 0; i <= n; i++) for (let j = 0; j <= m; j++) if (F[key(i, j)]) trans(i, j, (a, b) => { F[key(a, b)] = 1; });
  if (!F[key(n, m)]) return null;
  B[key(n, m)] = 1;
  for (let i = n; i >= 0; i--) for (let j = m; j >= 0; j--) trans(i, j, (a, b) => { if (B[key(a, b)]) B[key(i, j)] = 1; });
  const poss = Array.from({length: n}, () => new Set());
  for (let i = 0; i <= n; i++) for (let j = 0; j <= m; j++) if (F[key(i, j)] && B[key(i, j)]) trans(i, j, (a, b, sets) => { if (!B[key(a, b)]) return; for (const s of sets) { if (s.length === 3) for (let k = s[0]; k < s[0] + s[2]; k++) poss[k].add(s[1]); else poss[s[0]].add(s[1]); } });
  return poss.map(p => p.size === 1 ? [...p][0] : -1);
}
function logicSolve(rowsC, colsC, R, C) {
  const g = Array(R * C).fill(-1); let changed = true, rounds = 0;
  while (changed && rounds++ < 200) { changed = false;
    for (let r = 0; r < R; r++) { const cur = g.slice(r * C, r * C + C), res = solveLine(rowsC[r], cur); if (!res) return null; res.forEach((v, c) => { if (v !== -1 && g[r * C + c] === -1) { g[r * C + c] = v; changed = true; } }); }
    for (let c = 0; c < C; c++) { const cur = [...Array(R)].map((_, r) => g[r * C + c]), res = solveLine(colsC[c], cur); if (!res) return null; res.forEach((v, r) => { if (v !== -1 && g[r * C + c] === -1) { g[r * C + c] = v; changed = true; } }); }
  }
  return g;
}

const FARBEN = [null, {n: 'Rot', c: '#c8283a'}, {n: 'Grün', c: '#3f8a4a'}, {n: 'Braun', c: '#8a5533'}, {n: 'Gold', c: '#e0a82e'}];
const MAP = {'.': 0, X: 1, R: 1, G: 2, B: 3, Y: 4};
const PICS = {
  herz: ['Ein Herz', '.X.X.|XXXXX|XXXXX|.XXX.|..X..'],
  stern: ['Ein Stern', '..X..|.XXX.|XXXXX|.XXX.|.X.X.'],
  glocke: ['Eine Glocke', '..X..|.XXX.|.XXX.|XXXXX|..X..'],
  tasse: ['Eine Tasse Punsch', '......|XXXX..|XXXXXX|XXXX.X|XXXXX.|.XX...'],
  kerze: ['Eine Kerze', '...X...|..XX...|...X...|..XXX..|..XXX..|..XXX..|XXXXXXX'],
  geschenk: ['Ein Geschenk', '..X..X..|...XX...|XXXXXXXX|X..XX..X|XXXXXXXX|X..XX..X|X..XX..X|XXXXXXXX'],
  schneemann: ['Ein Schneemann', '...XX...|..XXXX..|...XX...|..XXXX..|.XX..XX.|.X....X.|.XX..XX.|..XXXX..'],
  muetze: ['Eine Zipfelmütze', '......XX|.....XXX|....XXX.|...XXXX.|..XXXXX.|.XXXXXX.|XXXXXXXX|XXXXXXXX'],
  stiefel: ['Ein Nikolausstiefel', '.XXXXX..|.XXXXX..|..XXX...|..XXX...|..XXX...|..XXXXX.|.XXXXXXX|.XXXXXXX'],
  tanne: ['Ein Tannenbaum', '....X....|...XXX...|..XXXXX..|....X....|..XXXXX..|.XXXXXXX.|XXXXXXXXX|....X....'],
  schlitten: ['Ein Schlitten', '..........|X.........|X.XXXXXX..|XXXXXXXX..|XXXXXXXX..|.X.....X..|XXXXXXXXXX|..........'],
  mond: ['Ein Mond', '...XXXX...|..XXX.....|.XXX......|.XX.......|XXX.......|XXX.......|.XX.......|.XXX......|..XXX.....|...XXXX...'],
  zuckerstange: ['Eine Zuckerstange', '...XXXX...|..XX..XX..|..X....X..|.......X..|......XX..|......X...|.....XX...|.....X....|....XX....|....X.....'],
  haus: ['Ein Lebkuchenhaus', '....XX....|...XXXX...|..XXXXXX..|.XXXXXXXX.|XXXXXXXXXX|.X......X.|.X.XX.X.X.|.X.XX...X.|.X.XX...X.|.XXXXXXXX.'],
  flocke: ['Eine Schneeflocke', '....X....|.X.XXX.X.|..X.X.X..|.X.XXX.X.|XXXXXXXXX|.X.XXX.X.|..X.X.X..|.X.XXX.X.|....X....'],
  // bunt
  kugel: ['Eine Christbaumkugel', '...YY...|..RRRR..|.RRYYRR.|RRYRRYRR|RRRRRRRR|RRYRRYRR|.RRYYRR.|..RRRR..'],
  kerze_bunt: ['Eine Adventskerze', '...Y...|..YY...|...Y...|..RRR..|..RRR..|..RRR..|GGGGGGG'],
  geschenk_bunt: ['Ein Geschenk mit Schleife', '..Y..Y..|...YY...|RRRYYRRR|RRRYYRRR|YYYYYYYY|RRRYYRRR|RRRYYRRR|RRRYYRRR'],
  zuckerstange_bunt: ['Eine Zuckerstange', '...RRRR...|..RR..RR..|..R....R..|.......R..|......RR..|......R...|.....RR...|.....R....|....RR....|....R.....'],
  rentier: ['Ein Rentier', 'B.B...B.B|.BBB.BBB.|..B...B..|...BBB...|..BBBBB..|..B.B.B..|...BBB...|....R....'],
  tanne_bunt: ['Ein geschmückter Tannenbaum', '....Y....|...GGG...|..GRGGG..|....B....|..GGGRG..|.GRGGGGG.|GGGGGRGGG|....B....'],
};
const ORDER = ['herz', 'stern', 'glocke', 'tasse', 'kerze', 'geschenk', 'schneemann', 'muetze', 'stiefel', 'tanne', 'schlitten', 'mond', 'zuckerstange', 'haus', 'flocke'];
const ORDER_BUNT = ['kugel', 'kerze_bunt', 'geschenk_bunt', 'zuckerstange_bunt', 'tanne_bunt'];
const fromPic = id => { const rows = PICS[id][1].split('|'); return {name: PICS[id][0], R: rows.length, C: rows[0].length, sol: rows.join('').split('').map(ch => MAP[ch])}; };
const cluesOf = (sol, R, C) => ({rows: [...Array(R)].map((_, r) => clues(sol.slice(r * C, r * C + C))), cols: [...Array(C)].map((_, c) => clues([...Array(R)].map((_, r) => sol[r * C + c])))});
const unique = (sol, R, C) => { const k = cluesOf(sol, R, C), g = logicSolve(k.rows, k.cols, R, C); return g && g.every(v => v !== -1); };
function randomPic(seed, n, bunt) { // symmetrisches Zufallsmuster, nur wenn ohne Raten lösbar
  for (let t = 0; t < 400; t++) {
    const r = rng(seed * 613 + t * 7919), sol = Array(n * n).fill(0), half = Math.ceil(n / 2);
    for (let y = 0; y < n; y++) for (let x = 0; x < half; x++) { const v = r() < .58 ? (bunt ? (r() < .5 ? 1 : 2) : 1) : 0; sol[y * n + x] = v; sol[y * n + n - 1 - x] = v; }
    if (unique(sol, n, n)) return {name: 'Ein Streuselmuster', R: n, C: n, sol};
  }
  return fromPic('flocke');
}
function levelCfg(L) { return {bunt: Feat.has('streu.farbe') && L >= 6 && L % 2 === 0}; }
function generate(L, spec) {
  if (spec) return fromPic(spec.motif);
  if (levelCfg(L).bunt) { const k = Math.floor((L - 6) / 2); return k < ORDER_BUNT.length ? fromPic(ORDER_BUNT[k]) : randomPic(L, 10, true); }
  return L <= ORDER.length ? fromPic(ORDER[L - 1]) : randomPic(L, 10, false);
}

let api, lvl, P, K, g, tool, color, hints, mel, won, paint = null, noteI, colors;
function begin(L, resume, a) {
  api = a; lvl = L; mel = melodyFor(L + 8); P = generate(L, api.special); K = cluesOf(P.sol, P.R, P.C);
  colors = [...new Set(P.sol.filter(Boolean))].sort(); color = colors[0]; tool = 'streu'; hints = 0; won = false; noteI = 0;
  g = Array(P.R * P.C).fill(-1); // -1 offen, 0 Kreuz, k Farbe
  const c = resume ? api.getCur() : null;
  if (c && Array.isArray(c.g) && c.g.length === g.length) { g = c.g; hints = c.hints || 0; } else api.saveCur(null);
  const bunt = colors.length > 1 || colors[0] !== 1;
  const mr = Math.max(...K.rows.map(x => x.length)), mc = Math.max(...K.cols.map(x => x.length));
  const cs = `min(${Math.floor(300 / P.C)}px, calc((100vw - 40px) / ${P.C + mr * .62}))`;
  const num = ([n, col]) => `<i style="color:${bunt ? FARBEN[col].c : 'inherit'}">${n}</i>`;
  api.stage.innerHTML = `<div class="streu" id="streu" style="--cs:${cs};--mr:${mr};--mc:${mc};--r:${P.R};--c:${P.C}">
      <div class="sk-corner"></div>
      <div class="sk-cols">${K.cols.map(cl => `<div class="sk-col">${cl.map(num).join('') || '<i>0</i>'}</div>`).join('')}</div>
      <div class="sk-rows">${K.rows.map(cl => `<div class="sk-row">${cl.map(num).join('') || '<i>0</i>'}</div>`).join('')}</div>
      <div class="sk-grid" id="skGrid">${g.map((_, i) => `<span class="sz" data-i="${i}"></span>`).join('')}</div>
    </div>`;
  api.controls.innerHTML = `<div class="sk-tools" id="skTools">${colors.map(k => `<button class="btn sk-tool" data-t="streu" data-k="${k}"><span class="sk-sw" style="background:${FARBEN[k].c}"></span>${bunt ? FARBEN[k].n : 'Streuen'}</button>`).join('')}<button class="btn sk-tool" data-t="kreuz">✕ Frei</button></div>
    <button class="btn" id="skHint">Tipp</button><button class="btn" id="restart">Neu starten</button><button class="btn" id="skHelp">Wie geht das?</button>`;
  $('skTools').onclick = e => { const b = e.target.closest('.sk-tool'); if (!b) return; tool = b.dataset.t; if (b.dataset.k) color = +b.dataset.k; Snd.tap(); tools(); };
  $('skHint').onclick = hint; $('restart').onclick = () => api.restart(); $('skHelp').onclick = () => explain(bunt);
  const grid = $('skGrid'); grid.onpointerdown = down; grid.onpointermove = move; grid.onpointerup = grid.onpointercancel = () => { if (paint) { paint = null; save(); check(); } };
  api.legend.innerHTML = bunt ? '<span><b>Bunte Streusel:</b> Wähle unten die Farbe. Gleiche Farben brauchen eine Lücke, verschiedene dürfen sich berühren.</span>' : '<span>Wähle „Streuen“ oder „✕ Frei“ und tippe Felder an – oder wische über mehrere.</span>';
  tools(); draw();
  const p = prog('streu'); if (!p.intro) { p.intro = true; persist(); explain(false); } else if (bunt && !p.bunt) { p.bunt = true; persist(); explain(true); }
}
function explain(bunt) {
  api.help('Zuckerstreusel', `<ol class="how">
    <li>Die <b>Zahlen am Rand</b> sagen, wie viele Felder in dieser Reihe oder Spalte <b>am Stück</b> bestreut werden – in dieser Reihenfolge.</li>
    <li>„<b>3 1</b>“ heißt: drei Felder am Stück, dann mindestens ein freies Feld, dann ein einzelnes Feld.</li>
    <li>Mit <b>✕ Frei</b> markierst du Felder, die sicher leer bleiben. Das hilft beim Denken.</li>
    <li>Sind alle Felder richtig bestreut, erscheint ein <b>Bild</b>.</li>
    ${bunt ? '<li><b>Bunt:</b> Die Farbe der Zahl ist die Farbe der Streusel. Zwischen zwei Blöcken <b>gleicher</b> Farbe muss eine Lücke sein – <b>verschiedene</b> Farben dürfen direkt aneinanderstoßen.</li>' : ''}</ol>
    <p class="how-tip">Tipp: Fang mit großen Zahlen an. Ist eine Reihe 8 Felder lang und die Zahl 6, sind die mittleren 4 Felder auf jeden Fall bestreut – egal wo der Block genau liegt.</p>`);
}
function tools() { document.querySelectorAll('.sk-tool').forEach(b => b.classList.toggle('active', b.dataset.t === tool && (tool === 'kreuz' || +b.dataset.k === color))); }
function draw() {
  document.querySelectorAll('#skGrid .sz').forEach((el, i) => {
    const v = g[i]; el.className = 'sz' + (v === 0 ? ' x' : v > 0 ? ' on' : '') + (i % P.C === P.C - 1 ? '' : (i % P.C) % 5 === 4 ? ' r5' : '') + (Math.floor(i / P.C) % 5 === 4 && Math.floor(i / P.C) < P.R - 1 ? ' b5' : '');
    el.style.background = v > 0 ? FARBEN[v].c : '';
  });
  // erledigte Hinweise ausgrauen
  const done = (line, cl) => JSON.stringify(clues(line.map(v => v > 0 ? v : 0))) === JSON.stringify(cl);
  document.querySelectorAll('.sk-row').forEach((el, r) => el.classList.toggle('ok', done(g.slice(r * P.C, r * P.C + P.C), K.rows[r])));
  document.querySelectorAll('.sk-col').forEach((el, c) => el.classList.toggle('ok', done([...Array(P.R)].map((_, r) => g[r * P.C + c]), K.cols[c])));
  api.status(`${g.filter(v => v > 0).length} Felder bestreut`);
}
function cellOf(e) { const el = document.elementFromPoint(e.clientX, e.clientY); return el && el.classList.contains('sz') ? +el.dataset.i : -1; }
function down(e) {
  if (won) return; const i = cellOf(e); if (i < 0) return;
  const want = tool === 'kreuz' ? 0 : color;
  paint = {to: g[i] === want ? -1 : want, seen: new Set()}; e.currentTarget.setPointerCapture?.(e.pointerId);
  set(i);
}
function move(e) { if (!paint) return; const i = cellOf(e); if (i >= 0) set(i); }
function set(i) {
  if (paint.seen.has(i)) return; paint.seen.add(i);
  if (g[i] === paint.to) return; g[i] = paint.to;
  if (paint.to > 0) { const n = tones(mel); Snd.note(n[noteI % n.length][0], .25); noteI++; } else Snd.tap(paint.to === 0 ? .9 : .7);
  draw();
}
function save() { api.saveCur({g, hints}); }
function check() {
  if (won || !P.sol.every((v, i) => v ? g[i] === v : g[i] <= 0)) return;
  won = true; g = g.map(v => v > 0 ? v : -1); draw(); $('streu').classList.add('bild');
  const stars = Math.max(1, 3 - hints);
  setTimeout(() => api.win({stars, melody: mel, text: `${P.name}! ` + (hints ? `Mit ${hints} ${hints === 1 ? 'Tipp' : 'Tipps'} gelöst.` : 'Ganz ohne Tipp gelöst.')}), 1100);
}
function hint() {
  if (won) return;
  // ein Feld, das falsch ist oder noch offen, richtig setzen
  const wrong = P.sol.map((v, i) => (v ? g[i] !== v : g[i] > 0) ? i : -1).filter(i => i >= 0);
  const open = P.sol.map((v, i) => v && g[i] === -1 ? i : -1).filter(i => i >= 0);
  const bad = wrong.filter(i => g[i] !== -1), i = bad.length ? bad[0] : open.length ? open[Math.floor(open.length / 2)] : wrong[0];
  if (i === undefined) return;
  g[i] = P.sol[i] || 0; hints++; draw(); save();
  const el = document.querySelector(`#skGrid .sz[data-i="${i}"]`); el?.classList.add('hint'); setTimeout(() => el?.classList.remove('hint'), 1800);
  api.status(bad.length ? 'Tipp: Dieses Feld war falsch – jetzt stimmt es (kostet einen Stern)' : 'Tipp: Ein Feld ist jetzt richtig gesetzt (kostet einen Stern)');
  check();
}
return {id: 'streu', title: 'Zuckerstreusel', sub: 'Lies die Zahlen und streue das versteckte Bild', winTitle: 'Bild gestreut!',
  desc: 'Bilderrätsel mit Zahlen – ohne Raten lösbar',
  start: begin, stop() { paint = null; }, _test: {generate, unique, cluesOf, logicSolve, PICS, ORDER, ORDER_BUNT}};
})();
