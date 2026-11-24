/* Neues Spiel (Türchen 5): Lichterkette – Kabelstücke drehen, bis jedes Lämpchen Strom vom Stecker bekommt.
   Erzeugung: zufälliger Spannbaum über das Raster (Kabelnetz ohne Kreise) → Lämpchen an den Enden → alle Teile verdrehen.
   Damit ist jedes Level garantiert lösbar (die Ausgangsstellung ist eine Lösung).
   Wendung „bunte Lämpchen“ (Türchen 16): zwei Netze in Rot und Gold mit je eigenem Stecker; Strom fließt nur über gleichfarbige Kabel. */
const Licht = (() => {
const N = 1, E = 2, S = 4, W = 8, DIRS = [[N, -1, 0, S], [E, 0, 1, W], [S, 1, 0, N], [W, 0, -1, E]];
const rot = m => ((m << 1) | (m >> 3)) & 15; // 90° im Uhrzeigersinn
const rotN = (m, k) => { for (let i = 0; i < k; i++) m = rot(m); return m; };
const MOTIFS = { // X = Feld
  fenster: ['XXXXXX', 'X.XX.X', 'XXXXXX', 'X.XX.X', 'XXXXXX'],
  baum: ['..XX..', '.XXXX.', '..XX..', '.XXXX.', 'XXXXXX', '..XX..'],
  kranz: ['.XXXX.', 'XX..XX', 'X....X', 'XX..XX', '.XXXX.'],
};
function levelCfg(L) {
  const sizes = [[3, 3], [3, 4], [4, 4], [4, 4], [4, 5], [5, 5], [5, 5], [5, 6], [6, 6], [6, 6], [6, 7], [7, 7]];
  const [R, C] = sizes[Math.min(L, sizes.length) - 1];
  return {R, C, farben: Feat.has('licht.farben') && L >= 5 && L % 2 === 0};
}
function generate(L, spec) {
  let R, C, mask, farben, seed;
  if (spec) { const rows = MOTIFS[spec.motif]; R = rows.length; C = rows[0].length; mask = rows.join('').split('').map(ch => ch === 'X'); farben = !!spec.farben; seed = spec.seed; }
  else { const c = levelCfg(L); R = c.R; C = c.C; mask = Array(R * C).fill(true); farben = c.farben; seed = L * 7331 + 11; }
  const cells = [...mask.keys()].filter(i => mask[i]);
  for (let t = 0; t < 200; t++) {
    const r = rng(seed + t * 7919), sol = Array(R * C).fill(0), col = Array(R * C).fill(-1);
    // Stecker: einer (oder zwei bei Farben), möglichst weit auseinander
    const plugs = [cells[Math.floor(r() * cells.length)]];
    if (farben) { let far = plugs[0], fd = -1; for (const i of cells) { const d = Math.abs(Math.floor(i / C) - Math.floor(plugs[0] / C)) + Math.abs(i % C - plugs[0] % C); if (d > fd || (d === fd && r() < .5)) { fd = d; far = i; } } plugs.push(far); }
    plugs.forEach((p, k) => { col[p] = k; });
    // zufälliges Wachsen (Prim), bei zwei Netzen abwechselnd
    const front = plugs.map(p => [p]);
    let left = cells.length - plugs.length, guard = 0;
    while (left > 0 && guard++ < 10000) {
      const k = farben ? (front[0].length && front[1].length ? Math.floor(r() * 2) : front[0].length ? 0 : 1) : 0;
      const F = front[k]; if (!F.length) break;
      const fi = Math.floor(r() * F.length), i = F[fi], ri = Math.floor(i / C), ci = i % C;
      const opts = DIRS.filter(([, dr, dc]) => { const a = ri + dr, b = ci + dc; return a >= 0 && b >= 0 && a < R && b < C && mask[a * C + b] && col[a * C + b] < 0; });
      if (!opts.length) { F.splice(fi, 1); continue; }
      const [bit, dr, dc, back] = opts[Math.floor(r() * opts.length)], j = (ri + dr) * C + ci + dc;
      sol[i] |= bit; sol[j] |= back; col[j] = k; F.push(j); left--;
    }
    if (left > 0) continue;
    const deg = m => [N, E, S, W].filter(b => m & b).length;
    const lamps = cells.filter(i => !plugs.includes(i) && deg(sol[i]) === 1);
    if (lamps.length < 2) continue;
    // verdrehen – aber jedes Teil, das sich drehen lässt, muss falsch stehen können
    const state = sol.slice();
    let wrong = 0;
    for (const i of cells) { const k = Math.floor(r() * 4); state[i] = rotN(sol[i], k); if (state[i] !== sol[i]) wrong++; }
    if (wrong < cells.length * .5) continue;
    if (powered(state, R, C, mask, plugs, col).lit === lamps.length) continue; // schon gelöst? neu würfeln
    return {R, C, mask, sol, state, plugs, col: farben ? col : null, lamps};
  }
  throw new Error('Keine Lichterkette gefunden');
}
// Strom: vom Stecker aus über beidseitig verbundene Kabel (bei Farben nur gleiche Farbe)
function powered(state, R, C, mask, plugs, col) {
  const on = Array(R * C).fill(-1);
  plugs.forEach((p, k) => {
    const q = [p]; on[p] = k;
    while (q.length) {
      const i = q.pop(), ri = Math.floor(i / C), ci = i % C;
      for (const [bit, dr, dc, back] of DIRS) {
        if (!(state[i] & bit)) continue;
        const a = ri + dr, b = ci + dc, j = a * C + b;
        if (a < 0 || b < 0 || a >= R || b >= C || !mask[j] || on[j] >= 0 || !(state[j] & back)) continue;
        if (col && col[j] !== k) continue;
        on[j] = k; q.push(j);
      }
    }
  });
  return {on, lit: 0};
}
// minimale Drehungen bis zur Lösung (Symmetrie beachten: gerade Stücke brauchen höchstens 1)
const need = (cur, goal) => { for (let k = 0; k < 4; k++) if (rotN(cur, k) === goal) return k; return 0; };

let api, lvl, G, st, taps, hints, par, mel, won, noteI;
function begin(L, resume, a) {
  api = a; lvl = L; mel = melodyFor(L + 4); G = generate(L, api.special); st = G.state.slice(); taps = 0; hints = 0; won = false; noteI = 0;
  par = G.mask.reduce((n, m, i) => n + (m ? need(G.state[i], G.sol[i]) : 0), 0);
  const c = resume ? api.getCur() : null;
  if (c && Array.isArray(c.st) && c.st.length === st.length) { st = c.st; taps = c.taps || 0; hints = c.hints || 0; } else api.saveCur(null);
  const maxW = Math.min(440, G.C * 72 + 24);
  api.stage.innerHTML = `<div class="licht${G.col ? ' farben' : ''}" id="licht" style="--c:${G.C};width:min(100%,${maxW}px);aspect-ratio:${G.C}/${G.R}">${G.mask.map((m, i) => m
    ? `<button class="lt" data-i="${i}" aria-label="Kabelstück"><svg viewBox="-50 -50 100 100" class="lt-svg"></svg></button>` : '<span class="lt gap"></span>').join('')}</div>`;
  $('licht').onclick = onTap;
  api.controls.innerHTML = `<button class="btn" id="ltHint">Tipp</button><button class="btn" id="restart">Neu starten</button><button class="btn" id="ltHelp">Wie geht das?</button>`;
  $('ltHint').onclick = hint; $('restart').onclick = () => api.restart(); $('ltHelp').onclick = explain;
  api.legend.innerHTML = G.col ? '<span><b>Bunte Lämpchen:</b> Rot leuchtet nur über rote Kabel, Gold nur über goldene.</span>' : '<span>Tippe ein Kabelstück, um es zu drehen. Ziel: Alle Lämpchen leuchten.</span>';
  draw();
  const p = prog('licht'); if (!p.intro) { p.intro = true; persist(); explain(); }
}
function explain() {
  api.help('Die Lichterkette', `<ol class="how">
    <li>Der <b>Stecker</b> (das Kästchen mit den zwei Stiften) gibt Strom.</li>
    <li>Tippe ein Kabelstück an – es <b>dreht sich</b> um eine Vierteldrehung.</li>
    <li>Strom fließt nur, wo zwei Kabel <b>genau aneinanderstoßen</b>. Verbundene Kabel leuchten gelb.</li>
    <li><b>Ziel:</b> Alle Lämpchen leuchten. Kein Kabel darf ins Leere zeigen – jedes Stück gehört zur Kette.</li></ol>
    <p class="how-tip">Tipp: Fang am Rand und in den Ecken an – dort passt ein Kabelstück oft nur auf eine Art.</p>`);
}
function wire(m, lit, color) {
  const cls = lit ? 'w on' : 'w', c = color === 0 ? ' red' : color === 1 ? ' gold' : '';
  let s = '';
  if (m & N) s += `<line x1="0" y1="0" x2="0" y2="-50" class="${cls}${c}"/>`;
  if (m & E) s += `<line x1="0" y1="0" x2="50" y2="0" class="${cls}${c}"/>`;
  if (m & S) s += `<line x1="0" y1="0" x2="0" y2="50" class="${cls}${c}"/>`;
  if (m & W) s += `<line x1="0" y1="0" x2="-50" y2="0" class="${cls}${c}"/>`;
  return s + `<circle r="7" class="${cls}${c} knot"/>`;
}
function draw() {
  const pw = powered(st, G.R, G.C, G.mask, G.plugs, G.col).on;
  let lit = 0;
  document.querySelectorAll('#licht .lt[data-i]').forEach(b => {
    const i = +b.dataset.i, on = pw[i] >= 0, col = G.col ? G.col[i] : null;
    const lamp = G.lamps.includes(i), plug = G.plugs.includes(i);
    if (lamp && on) lit++;
    b.querySelector('svg').innerHTML = wire(st[i], on, col) +
      (plug ? `<rect x="-17" y="-17" width="34" height="34" rx="7" class="plug${col === 1 ? ' gold' : col === 0 ? ' red' : ''}"/><path d="M-6,-6 v-8 M6,-6 v-8" class="pin"/>` : '') +
      (lamp ? `<circle r="15" class="bulb${on ? ' on' : ''}${col === 0 ? ' red' : col === 1 ? ' gold' : ''}"/><circle r="5" cx="-5" cy="-5" class="glint"/>` : '');
    b.classList.toggle('powered', on);
  });
  api.status(`${lit} von ${G.lamps.length} Lämpchen leuchten · ${taps} ${taps === 1 ? 'Drehung' : 'Drehungen'}`);
  return lit;
}
function onTap(e) {
  if (won) return;
  const b = e.target.closest('.lt[data-i]'); if (!b) return;
  const i = +b.dataset.i;
  document.querySelectorAll('#licht .hint').forEach(x => x.classList.remove('hint'));
  st[i] = rot(st[i]); taps++;
  const svg = b.querySelector('svg'); svg.classList.remove('turn'); void svg.offsetWidth; svg.classList.add('turn');
  const before = document.querySelectorAll('#licht .bulb.on').length;
  const lit = draw();
  if (lit > before) { const n = tones(mel); Snd.note(n[noteI % n.length][0], .4); noteI++; } else Snd.tap(1.1);
  api.saveCur({st, taps, hints});
  if (lit === G.lamps.length) {
    won = true; $('licht').classList.add('alle');
    let stars = taps <= par + 2 ? 3 : taps <= par * 1.6 + 4 ? 2 : 1; stars = Math.max(1, stars - hints);
    setTimeout(() => api.win({stars, melody: mel, text: stars === 3 ? `Strahlend! ${taps} Drehungen – fast ohne Umweg.` : `Alles leuchtet nach ${taps} Drehungen. Mit ${par} ginge es auch.`}), 900);
  }
}
function hint() {
  if (won) return;
  const pw = powered(st, G.R, G.C, G.mask, G.plugs, G.col).on;
  // erst ein falsches Stück nahe am Strom, sonst irgendeins
  const wrong = G.mask.map((m, i) => m && need(st[i], G.sol[i]) ? i : -1).filter(i => i >= 0);
  if (!wrong.length) return;
  const nearPower = wrong.find(i => [[-1, 0], [1, 0], [0, -1], [0, 1]].some(([dr, dc]) => { const a = Math.floor(i / G.C) + dr, b = i % G.C + dc; return a >= 0 && b >= 0 && a < G.R && b < G.C && pw[a * G.C + b] >= 0; }));
  const i = nearPower !== undefined ? nearPower : wrong[0];
  hints++; api.saveCur({st, taps, hints});
  document.querySelector(`#licht .lt[data-i="${i}"]`)?.classList.add('hint');
  api.status(`Tipp: Das leuchtende Stück steht noch falsch – ${need(st[i], G.sol[i])}× drehen (kostet einen Stern)`);
}
return {id: 'licht', title: 'Lichterkette', sub: 'Drehe die Kabel, bis alle Lämpchen leuchten', winTitle: 'Alles leuchtet!',
  desc: 'Kabelstücke drehen – bis die ganze Kette strahlt',
  start: begin, stop() { won = true; }, _test: {generate, powered, levelCfg, rotN, MOTIFS}};
})();
