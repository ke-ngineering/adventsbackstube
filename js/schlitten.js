/* Neues Spiel (Türchen 14): Marktschlitten – Schiebe-Rätsel im Stil von „Rush Hour“.
   Der rote Plätzchenschlitten muss rechts durch die Lücke hinaus. Schlitten (2 Felder) und Buden (3 Felder) gleiten nur in ihrer Richtung.
   Erzeugung: zufällige Aufstellung → Breitensuche über alle erreichbaren Stellungen → die Stellung mit dem weitesten Weg zum Ziel wird das Level.
   Damit ist jedes Level lösbar, und die kürzeste Zugzahl ist bekannt (ein Zug = ein Fahrzeug beliebig weit schieben). */
const Schlitten = (() => {
const N = 6, EXIT = 2; // Ausfahrt rechts in Reihe 2
function levelCfg(L) {
  const gross = Feat.has('schlitten.gross');
  const min = Math.min(gross ? 22 : 15, 3 + Math.floor(L * 1.1)), cars = Math.min(gross ? 13 : 11, 5 + Math.floor(L / 2));
  return {min, cars};
}
// Fahrzeug: {h: waagerecht?, line: Reihe/Spalte, len}; Stellung: Array der Startfelder entlang der Fahrtrichtung
function occupancy(V, pos) {
  const o = new Int8Array(N * N).fill(-1);
  V.forEach((v, k) => { for (let t = 0; t < v.len; t++) { const r = v.h ? v.line : pos[k] + t, c = v.h ? pos[k] + t : v.line; o[r * N + c] = k; } });
  return o;
}
function movesOf(V, pos) { // alle Stellungen nach einem Zug
  const o = occupancy(V, pos), out = [];
  V.forEach((v, k) => {
    const free = p => { const r = v.h ? v.line : p, c = v.h ? p : v.line; return p >= 0 && p < N && o[r * N + c] < 0; };
    for (let p = pos[k] - 1; free(p); p--) { const n = pos.slice(); n[k] = p; out.push([n, k, p]); }
    for (let p = pos[k] + v.len; free(p); p++) { const n = pos.slice(); n[k] = p - v.len + 1; out.push([n, k, p - v.len + 1]); }
  });
  return out;
}
const isGoal = pos => pos[0] === N - 2;
const key = pos => String.fromCharCode(...pos.map(x => x + 48));
function generate(L, spec) {
  const c = spec ? {min: spec.min, cars: spec.min >= 15 ? 12 : spec.min >= 12 ? 11 : 9} : levelCfg(L), seed = spec ? spec.seed : L * 2909 + 17;
  let best = null, budget = 220000; // feste Rechenmenge statt Zeitlimit → auf jedem Gerät dasselbe Level
  for (let t = 0; t < 300 && (budget > 0 || !best); t++) {
    const r = rng(seed + t * 7877), V = [{h: true, line: EXIT, len: 2, red: true}], pos = [Math.floor(r() * 3)];
    let o = occupancy(V, pos);
    for (let tries = 0; V.length < c.cars + 1 && tries < 200; tries++) {
      const h = r() < .5, len = r() < .3 ? 3 : 2, line = Math.floor(r() * N), p = Math.floor(r() * (N - len + 1));
      if (h && line === EXIT) continue; // waagerecht in der Ausfahrtsreihe würde ewig blockieren
      let ok = true; for (let k = 0; k < len; k++) { const rr = h ? line : p + k, cc = h ? p + k : line; if (o[rr * N + cc] >= 0) ok = false; }
      if (!ok) continue;
      V.push({h, line, len}); pos.push(p); o = occupancy(V, pos);
    }
    // alle erreichbaren Stellungen
    const seen = new Map([[key(pos), pos]]), q = [pos];
    let big = false;
    for (let i = 0; i < q.length && !big; i++) for (const [n] of movesOf(V, q[i])) { const k = key(n); if (!seen.has(k)) { seen.set(k, n); q.push(n); if (q.length > 25000) { big = true; break; } } }
    budget -= q.length * 2;
    if (big) continue; // zu viele Stellungen – lieber eine übersichtlichere Aufstellung
    const goals = q.filter(isGoal); if (!goals.length) continue;
    // Abstand zum Ziel (Züge sind umkehrbar → Breitensuche von allen Zielstellungen)
    const dist = new Map(goals.map(g => [key(g), 0])), q2 = goals.slice();
    for (let i = 0; i < q2.length; i++) { const d = dist.get(key(q2[i])); for (const [n] of movesOf(V, q2[i])) { const k = key(n); if (!dist.has(k)) { dist.set(k, d + 1); q2.push(n); } } }
    let far = null, fd = -1; for (const s of q2) { const d = dist.get(key(s)); if (d > fd || (d === fd && r() < .1)) { fd = d; far = s; } }
    if (!best || fd > best.min) best = {V, start: far, min: fd};
    if (fd >= c.min) break;
  }
  return best;
}
function solveFrom(V, pos) { // nächster Zug auf kürzestem Weg
  const seen = new Map([[key(pos), null]]), q = [pos];
  for (let i = 0; i < q.length && q.length < 80000; i++) {
    if (isGoal(q[i])) { let s = q[i], prev; const path = []; while ((prev = seen.get(key(s)))) { path.unshift(prev.m); s = prev.from; } return path; }
    for (const [n, k, p] of movesOf(V, q[i])) { const kk = key(n); if (!seen.has(kk)) { seen.set(kk, {from: q[i], m: [k, p]}); q.push(n); } }
  }
  return null;
}

let api, lvl, G, pos, moves, hints, mel, won, drag = null, noteI;
const COLORS = ['#c9a06a', '#8fb3c9', '#a8b86a', '#d6913f', '#b97a56', '#9c8ac4', '#e0b45a', '#7fa38a', '#c48a8a', '#88a0b8', '#b8a07a', '#a07a6a', '#7a9cc4'];
function begin(L, resume, a) {
  api = a; lvl = L; mel = melodyFor(L + 10); G = generate(L, api.special); pos = G.start.slice(); moves = 0; hints = 0; won = false; noteI = 0;
  const c = resume ? api.getCur() : null;
  if (c && Array.isArray(c.pos) && c.pos.length === pos.length) { pos = c.pos; moves = c.moves || 0; hints = c.hints || 0; } else api.saveCur(null);
  api.stage.innerHTML = `<div class="markt" id="markt"><div class="markt-grid">${[...Array(N * N)].map(() => '<span></span>').join('')}</div><div class="ausfahrt" style="top:calc(${EXIT} * 100% / ${N})"></div><div class="markt-layer" id="mLayer"></div></div>`;
  $('mLayer').innerHTML = G.V.map((v, k) => `<div class="fz${v.red ? ' rot' : v.len === 3 ? ' bude' : ''}${v.h ? ' h' : ' v'}" data-k="${k}" style="--len:${v.len};${v.red ? '' : `--fc:${COLORS[k % COLORS.length]}`}">${v.red ? '<i></i><i></i><i></i>' : v.len === 3 ? '<b></b>' : ''}</div>`).join('');
  const m = $('markt'); m.onpointerdown = down; m.onpointermove = move; m.onpointerup = m.onpointercancel = up;
  api.controls.innerHTML = `<button class="btn" id="mHint">Tipp</button><button class="btn" id="restart">Neu starten</button><button class="btn" id="mHelp">Wie geht das?</button>`;
  $('mHint').onclick = hint; $('restart').onclick = () => api.restart(); $('mHelp').onclick = explain;
  api.legend.innerHTML = `<span>Schiebe die Schlitten und Buden, bis der <b>rote Plätzchenschlitten</b> rechts hinausfahren kann. Kürzester Weg: ${G.min} Züge.</span>`;
  place();
  const p = prog('schlitten'); if (!p.intro) { p.intro = true; persist(); explain(); }
}
function explain() {
  api.help('Der Marktschlitten', `<ol class="how">
    <li>Der <b>rote Plätzchenschlitten</b> soll rechts durch die Lücke zum Weihnachtsmarkt.</li>
    <li>Schiebe Schlitten und Buden mit dem Finger. Jedes Fahrzeug gleitet nur <b>in seiner Richtung</b>: waagerechte nach links und rechts, senkrechte nach oben und unten.</li>
    <li>Ein Zug ist ein Schieben – egal wie weit.</li></ol>
    <p class="how-tip">Tipp: Überlege rückwärts – was steht dem roten Schlitten im Weg, und was blockiert wiederum das?</p>`);
}
function place() {
  document.querySelectorAll('#mLayer .fz').forEach(el => {
    const k = +el.dataset.k, v = G.V[k], r = v.h ? v.line : pos[k], c = v.h ? pos[k] : v.line;
    el.style.left = `calc(${c} * 100% / ${N})`; el.style.top = `calc(${r} * 100% / ${N})`;
    el.style.transform = '';
  });
  api.status(`${moves} ${moves === 1 ? 'Zug' : 'Züge'} · kürzester Weg: ${G.min}`);
}
function range(k) { // erlaubte Startfelder für Fahrzeug k
  const v = G.V[k], o = occupancy(G.V, pos), free = p => { const r = v.h ? v.line : p, c = v.h ? p : v.line; return p >= 0 && p < N && (o[r * N + c] < 0 || o[r * N + c] === k); };
  let lo = pos[k], hi = pos[k];
  while (free(lo - 1)) lo--;
  while (free(hi + v.len)) hi++;
  return [lo, hi];
}
function down(e) {
  if (won) return; const el = e.target.closest('.fz'); if (!el) return;
  const k = +el.dataset.k; document.querySelectorAll('#mLayer .hint').forEach(x => x.classList.remove('hint'));
  drag = {k, el, x0: e.clientX, y0: e.clientY, p0: pos[k], rg: range(k), cell: $('markt').getBoundingClientRect().width / N};
  e.currentTarget.setPointerCapture?.(e.pointerId); el.classList.add('greif');
}
function move(e) {
  if (!drag) return; const v = G.V[drag.k], d = (v.h ? e.clientX - drag.x0 : e.clientY - drag.y0) / drag.cell;
  const p = Math.max(drag.rg[0], Math.min(drag.rg[1], drag.p0 + d));
  drag.el.style.transform = v.h ? `translateX(${(p - drag.p0) * drag.cell}px)` : `translateY(${(p - drag.p0) * drag.cell}px)`;
  drag.p = p;
}
function up() {
  if (!drag) return; const d = drag; drag = null; d.el.classList.remove('greif');
  const p = Math.round(d.p === undefined ? d.p0 : d.p);
  if (p !== d.p0) { pos[d.k] = p; moves++; const n = tones(mel); Snd.note(n[noteI % n.length][0], .35); noteI++; } else Snd.tap(.8);
  place(); api.saveCur({pos, moves, hints});
  if (isGoal(pos)) finish();
}
function finish() {
  won = true; const red = document.querySelector('#mLayer .fz.rot');
  red.style.transition = 'left .7s ease-in'; red.style.left = '115%';
  let stars = moves <= G.min ? 3 : moves <= G.min * 1.5 + 2 ? 2 : 1; stars = Math.max(1, stars - hints);
  setTimeout(() => api.win({stars, melody: mel, text: moves <= G.min ? `Der kürzeste Weg – ${moves} Züge! Ab zum Weihnachtsmarkt.` : `Durchgekommen in ${moves} Zügen. Der kürzeste Weg hat ${G.min}.`}), 900);
}
function hint() {
  if (won) return; const path = solveFrom(G.V, pos); if (!path || !path.length) return;
  const [k, p] = path[0]; hints++; api.saveCur({pos, moves, hints});
  const el = document.querySelector(`#mLayer .fz[data-k="${k}"]`); el.classList.add('hint');
  const v = G.V[k], dir = v.h ? (p > pos[k] ? 'nach rechts' : 'nach links') : (p > pos[k] ? 'nach unten' : 'nach oben');
  api.status(`Tipp: das blinkende Fahrzeug ${dir} schieben – noch ${path.length} Züge (kostet einen Stern)`);
}
return {id: 'schlitten', title: 'Marktschlitten', sub: 'Schiebe den roten Schlitten aus dem Gedränge', winTitle: 'Freie Fahrt!',
  desc: 'Schiebe-Rätsel auf dem Weihnachtsmarkt',
  start: begin, stop() { won = true; drag = null; }, _test: {generate, solveFrom, movesOf, isGoal, levelCfg}};
})();
