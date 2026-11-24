/* Mechanik 2: Glasur-Blech – alle Plätzchen glasieren (Lights-Out-Prinzip mit eigenen Formen).
   Antippen wechselt ein Plätzchen UND bestimmte Nachbarn (glasiert ↔ unglasiert). Die FORM bestimmt das Muster;
   jede Form nimmt genau das Plätzchen direkt darüber mit und reicht sonst nie nach oben.

   Lösungsweg (wird im Spiel Schritt für Schritt gelehrt, siehe Lehrplan PLAN):
   1. JAGD: Reihe für Reihe direkt unter jedes unglasierte Plätzchen tippen → nur die unterste Reihe kann übrig bleiben.
   2. REST-TRICK: Jedes Plätzchen der obersten Reihe hinterlässt nach der Jagd unten einen festen „Fingerabdruck“.
      Abdrücke überlagern sich (zweimal = keinmal). Rest unten = Kombination von Abdrücken → diese oben tippen, nochmal jagen.
      Die Abdrücke entdeckt die Spielerin selbst im „Labor“ und sammelt sie auf ihrer „Rezeptkarte“.
   Level werden rückwärts aus Tippern erzeugt → immer lösbar. Ziel für 3 Sterne = Zugzahl dieses Lösungswegs. */
const Blech = (() => {
const SHAPES = {
  taler:  {name:'Taler',        how:'oben, unten, links und rechts',         off:[[0,0],[-1,0],[1,0],[0,-1],[0,1]]},
  stern:  {name:'Zimtstern',    how:'oben und die zwei schrägen unten',      off:[[0,0],[-1,0],[1,-1],[1,1]]},
  stange: {name:'Spritzgebäck', how:'oben sowie zwei links und zwei rechts', off:[[0,0],[-1,0],[0,-1],[0,-2],[0,1],[0,2]]},
};
const ALL = ['taler', 'stern', 'stange'];
/* Lehrplan. mode: free = beliebig, jagd = Jagd reicht, rest = Rest-Trick nötig. lesson = Lektion, die sich beim ersten Mal öffnet. */
const PLAN = [null,
  {R:2, C:2, kinds:['taler'], mode:'free', k:1, title:'Das erste Blech'},
  {R:2, C:3, kinds:['taler'], mode:'free', k:2, title:'Ausprobieren'},
  {R:3, C:3, kinds:['taler'], mode:'jagd', k:2, title:'Lektion 1: Die Jagd (Übung mit Lernhilfe)', lesson:'jagd', tutorial:true},
  {R:4, C:3, kinds:['taler'], mode:'jagd', k:3, title:'Jagd üben'},
  {R:4, C:4, kinds:['taler'], mode:'jagd', k:5, title:'Jagd üben'},
  {R:2, C:2, kinds:['taler'], mode:'rest', k:2, title:'Lektion 2: Der Rest-Trick (Übung mit Lernhilfe)', lesson:'rest', tutorial:true},
  {R:4, C:2, kinds:['taler'], mode:'rest', k:3, title:'Rest-Trick: längeres Blech'},
  {R:4, C:3, kinds:['taler'], mode:'rest', k:4, title:'Rest-Trick: Abdrücke spiegelverkehrt'},
  {R:3, C:3, kinds:['taler'], mode:'rest', k:3, combo:true, title:'Rest-Trick: Abdrücke kombinieren'},
  {R:5, C:4, kinds:['taler'], mode:'rest', k:6, title:'Rest-Trick: vier breit'},
  {R:5, C:5, kinds:['taler'], mode:'rest', k:7, title:'Das klassische 5×5'},
  {R:4, C:4, kinds:['taler', 'stern'], mode:'jagd', k:5, title:'Neue Form: Zimtstern'},
  {R:5, C:4, kinds:['taler', 'stern'], mode:'rest', k:6, title:'Zimtsterne mit Rest'},
  {R:5, C:5, kinds:['taler', 'stern'], mode:'rest', k:8, title:'Sternenblech'},
  {R:5, C:5, kinds:ALL, mode:'jagd', k:8, title:'Neue Form: Spritzgebäck'},
  {R:5, C:5, kinds:ALL, mode:'rest', k:9, title:'Alle Formen'},
];
function rawCfg(L) {
  if (L < PLAN.length) return PLAN[L];
  const n = L < 22 ? 6 : 7; // danach: freie Bleche zum Genießen
  return {R:n, C:n, kinds:ALL, mode: L % 4 === 0 ? 'jagd' : 'rest', k: Math.min(Math.floor(n * n * .5), 6 + Math.floor(L * .45)), title:'Meisterblech'};
}
/* Kalender 2.0: Stern-Pinsel ab Türchen 8, Stangen-Pinsel ab 15, Meisterbleche ab 22 – vorher Ersatzbleche ohne diese Formen */
function levelCfg(L) {
  let c = rawCfg(L);
  if (L > 16 && !Feat.has('blech.meister')) c = Object.assign({}, rawCfg(13 + L % 4), {title: 'Übungsblech'});
  const kinds = c.kinds.filter(k => k === 'taler' || (k === 'stern' && Feat.has('blech.stern')) || (k === 'stange' && Feat.has('blech.stange')));
  if (kinds.length < c.kinds.length) c = Object.assign({}, c, {kinds, title: c.title.startsWith('Neue Form') ? 'Jagd üben' : c.title.replace(/Zimtsterne|Sternenblech|Alle Formen/, 'Rest-Trick üben')});
  return c;
}
/* Tagesrätsel: Bleche mit Motiv. X = Plätzchen, . = Lücke. */
const MOTIFS = {
  herz: ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'],
  stiefel: ['XXX...', 'XXX...', 'XXX...', 'XXXXXX', 'XXXXXX'],
  sternform: ['...X...', '..XXX..', 'XXXXXXX', '.XXXXX.', '.XX.XX.'],
};
const LETTERS = 'ABCDEFG';

let api, lvl, cfg, R, C, shape, aff, fps, g, taps, hints, par, best, noteI, mel, hist, coachOn = false, coachUsed = false, restPlan = [], secondPass = false, mask = null;
const inM = i => !mask || mask[i];

/* ---- Regeln & Werkzeuge ---- */
const rowOf = i => Math.floor(i / C), colOf = i => i % C;
function affected(i) {
  const r = rowOf(i), c = colOf(i);
  return SHAPES[shape[i]].off.map(([dr, dc]) => [r + dr, c + dc])
    .filter(([a, b]) => a >= 0 && b >= 0 && a < R && b < C && inM(a * C + b)).map(([a, b]) => a * C + b);
}
const apply = (st, i) => { for (const j of aff[i]) st[j] ^= 1; };
function chase(state) { // Reihe für Reihe direkt darunter tippen
  const st = state.slice(), t = [];
  for (let r = 0; r < R - 1; r++) for (let c = 0; c < C; c++) if (!st[r * C + c]) { const i = (r + 1) * C + c; apply(st, i); t.push(i); }
  return {st, taps: t};
}
const leftover = st => st.slice((R - 1) * C).map(v => v ? 0 : 1); // 1 = unglasiert in der untersten Reihe
function fingerprint(j) { const st = Array(R * C).fill(1); apply(st, j); return leftover(chase(st).st); }
function restSet(left) { // kleinste Auswahl oberer Plätzchen, deren Abdrücke zusammen genau den Rest ergeben
  let bestS = null;
  for (let m = 0; m < (1 << C); m++) {
    const x = Array(C).fill(0), S = [];
    for (let j = 0; j < C; j++) if (m >> j & 1) { S.push(j); fps[j].forEach((v, k) => x[k] ^= v); }
    if (x.every((v, k) => v === left[k]) && (!bestS || S.length < bestS.length)) bestS = S;
  }
  return bestS;
}
function method(state) { // Zugzahl des gelehrten Lösungswegs
  const c1 = chase(state), left = leftover(c1.st);
  if (left.every(v => !v)) return c1.taps.length;
  const S = restSet(left); if (!S) return -1;
  const st = c1.st.slice(); S.forEach(j => apply(st, j));
  const c2 = chase(st);
  return c2.st.every(v => v) ? c1.taps.length + S.length + c2.taps.length : -1;
}
const pop = x => { let n = 0; while (x) { n += Number(x & 1n); x >>= 1n; } return n; };
function solve(state) { // mathematisches Minimum (Gauß über GF(2)) – für „kürzer geht es nicht“ und Tests
  const M = R * C, rows = [];
  for (let j = 0; j < M; j++) { let m = 0n; for (let i = 0; i < M; i++) if (aff[i].includes(j)) m |= 1n << BigInt(i); rows.push({m, b: state[j] ? 0 : 1}); }
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
  const isPiv = new Set(piv), free = [...Array(M).keys()].filter(c => !isPiv.has(c) && inM(c));
  const lim = Math.min(free.length, 12); let bestX = null;
  for (let a = 0; a < (1 << lim); a++) {
    let x = 0n;
    free.forEach((c, t) => { if (t < lim && (a >> t) & 1) x |= 1n << BigInt(c); });
    for (let k = 0; k < r; k++) { const c = piv[k], others = rows[k].m & ~(1n << BigInt(c)); if (rows[k].b ^ (pop(others & x) & 1)) x |= 1n << BigInt(c); }
    const w = pop(x); if (!bestX || w < bestX.w) bestX = {w, x};
  }
  return [...Array(M).keys()].filter(i => (bestX.x >> BigInt(i)) & 1n);
}

// Tagesrätsel: spec {shape: Motiv | 'rechteck', w, h, stamp, seed} – Lösung per Gauß, Ziel = kürzeste Lösung
function generateSpecial(spec) {
  const rows = spec.shape === 'rechteck' ? Array(spec.h).fill('X'.repeat(spec.w)) : MOTIFS[spec.shape];
  R = rows.length; C = rows[0].length; mask = rows.join('').split('').map(ch => ch === 'X');
  const kinds = spec.stamp ? [spec.stamp] : spec.shape === 'rechteck' ? ALL : ['taler'];
  cfg = {R, C, kinds, mode: 'motiv', title: 'Tagesrätsel'};
  const cells = [...Array(R * C).keys()].filter(i => mask[i]);
  for (let t = 0; t < 400; t++) {
    const r = rng(spec.seed * 977 + t * 7717 + 5);
    shape = Array.from({length: R * C}, () => kinds[Math.floor(r() * kinds.length)]);
    aff = shape.map((_, i) => inM(i) ? affected(i) : []);
    const k = Math.round(cells.length * .32), pick = shuffle(cells.slice(), r).slice(0, k);
    const state = Array(R * C).fill(1); pick.forEach(i => apply(state, i));
    if (state.filter(v => !v).length < cells.length * .3) continue;
    const sol = solve(state); if (!sol || sol.length < Math.min(6, k)) continue;
    return {state, par: sol.length, best: sol.length};
  }
  throw new Error('Kein Motiv-Blech gefunden');
}
function generate(L, spec) {
  if (spec) return generateSpecial(spec);
  mask = null;
  cfg = levelCfg(L); R = cfg.R; C = cfg.C;
  const M = R * C, k = Math.min(cfg.k, M - (cfg.mode === 'jagd' ? C : 0));
  for (let t = 0; t < 400; t++) {
    const strict = t < 300; // notfalls Bedingungen lockern, damit immer ein Blech entsteht
    const r = rng(L * 4241 + t * 7717 + 3);
    shape = Array.from({length: M}, () => cfg.kinds[Math.floor(r() * cfg.kinds.length)]);
    if (t < 150 && cfg.kinds.length > 1 && !cfg.kinds.every(s => shape.includes(s))) continue; // jede Form soll vorkommen
    aff = shape.map((_, i) => affected(i));
    fps = [...Array(C).keys()].map(fingerprint);
    const pool = [...Array(M).keys()].filter(i => cfg.mode !== 'jagd' || i >= C);
    const pick = shuffle(pool, r).slice(0, k);
    if (cfg.mode === 'rest' && !pick.some(i => i < C)) pick[0] = Math.floor(r() * C);
    const state = Array(M).fill(1); pick.forEach(i => apply(state, i));
    if (state.every(v => v)) continue;
    const left = leftover(chase(state).st), hasRest = left.some(v => v);
    if (cfg.mode === 'jagd' && hasRest) continue;
    if (strict && cfg.mode === 'rest' && !hasRest) continue;
    if (strict && cfg.combo && (restSet(left) || []).length < 2) continue;
    const m = method(state); if (m < 0) continue;
    return {state, par: m, best: (solve(state) || []).length};
  }
  throw new Error('Kein Blech gefunden');
}

/* ---- Rezeptkarte: entdeckte Fingerabdrücke, gemerkt pro Blech (Größe + Formen) ---- */
const sig = () => `${R}x${C}:${shape.join(',')}`;
function card() { const p = prog('blech'); p.cards = p.cards || {}; return p.cards[sig()] || (p.cards[sig()] = {}); }
const bits = (arr, cls = '') => `<span class="fp ${cls}">${arr.map(v => `<i class="${v ? 'x' : 'o'}"></i>`).join('')}</span>`;

/* ---- Spielaufbau ---- */
function begin(L, resume, a) {
  api = a; lvl = L; mel = melodyFor(L + 1);
  const gen = generate(L, api.special); g = gen.state; par = gen.par; best = gen.best;
  const motiv = !!mask;
  taps = 0; hints = 0; noteI = 0; hist = []; coachOn = !!cfg.tutorial; coachUsed = false; restPlan = []; secondPass = false;
  const c = resume ? api.getCur() : null;
  if (c && c.v === 8 && Array.isArray(c.g) && c.g.length === g.length) {
    g = c.g; taps = c.taps || 0; hints = c.hints || 0; noteI = c.noteI || 0; hist = c.hist || []; coachOn = !!c.coachOn; coachUsed = !!c.coachUsed; restPlan = c.restPlan || []; secondPass = !!c.secondPass;
  } else api.saveCur(null);
  const maxW = Math.min(460, C * 92 + 40);
  api.stage.innerHTML = `
    <div class="blech${motiv ? ' motiv' : ''}" id="blech" style="--n:${C};aspect-ratio:${C}/${R};width:min(100%,${maxW}px)">${g.map((v, i) => !inM(i) ? '<span class="cell gap"></span>' :
      `<button class="cell" data-i="${i}" aria-label="${SHAPES[shape[i]].name}${i < C && !motiv ? ' ' + LETTERS[i] : ''}">${i < C && L >= 6 && !motiv ? `<span class="colname">${LETTERS[i]}</span>` : ''}<span class="cookie s-${shape[i]}${v ? ' on' : ''}"></span></button>`).join('')}</div>
    <div class="coach" id="coach" aria-live="polite" hidden></div>
    <div class="rcard" id="rcard" hidden></div>`;
  const bl = $('blech'), clearPv = () => bl.querySelectorAll('.pv').forEach(x => x.classList.remove('pv'));
  bl.onclick = onTap;
  bl.onpointerdown = e => { const x = e.target.closest('.cell'); if (!x) return; clearPv(); aff[+x.dataset.i].forEach(j => bl.querySelector(`.cell[data-i="${j}"]`).classList.add('pv')); };
  bl.onpointerup = bl.onpointercancel = bl.onpointerleave = () => setTimeout(clearPv, 260);
  const kinds = [...new Set(shape)];
  api.legend.innerHTML = `<span class="lesson">${cfg.title}</span>` +
    kinds.map(k => `<span class="pat">${mini(k)}<span><b>${SHAPES[k].name}</b> wechselt ${SHAPES[k].how}</span></span>`).join('');
  api.controls.innerHTML = `<button class="btn" id="bUndo">↶ Zurück</button><button class="btn" id="hint">Tipp</button><button class="btn" id="restart">Neu</button>` +
    `<button class="btn" id="bHelp">Regeln</button>` + (motiv ? '' : `<button class="btn" id="bCourse">Lösungsweg</button>` +
    (L >= 6 ? `<button class="btn" id="bLab">Abdruck-Labor</button>` : '') + `<button class="btn" id="bCoach" aria-pressed="false">Lernhilfe</button>`);
  $('bHelp').onclick = () => explain(kinds);
  $('bCourse') && ($('bCourse').onclick = () => course(0));
  $('bLab') && ($('bLab').onclick = lab);
  $('bCoach') && ($('bCoach').onclick = () => setCoach(!coachOn));
  $('bUndo').onclick = () => { if (!hist.length) return; const i = hist.pop(); apply(g, i); taps--; restPlan = []; secondPass = false; Snd.tap(.7); paint(aff[i]); saveCur(); refresh(); };
  $('hint').onclick = showHint;
  $('restart').onclick = () => api.restart();
  refresh();
  // Lektionen und neue Formen beim ersten Mal
  const p = prog('blech'); p.seen = p.seen || []; p.lessons = p.lessons || [];
  const fresh = kinds.filter(k => !p.seen.includes(k));
  if (motiv) { if (fresh.length) { p.seen.push(...fresh); persist(); explain(kinds, p.seen.length !== fresh.length); } else api.toast && api.toast('Ein Blech mit Motiv: Hier hilft die Jagd nicht immer – probier dich heran!'); return; }
  if (L >= 10 && !p.lessons.includes('warum') && !fresh.length) { p.lessons.push('warum'); persist(); offerWhy(); }
  else if (cfg.lesson && !p.lessons.includes(cfg.lesson)) { p.lessons.push(cfg.lesson); p.seen.push(...fresh); persist(); course(cfg.lesson === 'jagd' ? 1 : 2, true); }
  else if (fresh.length) { p.seen.push(...fresh); persist(); explain(p.seen.length === fresh.length ? kinds : fresh, p.seen.length !== fresh.length); }
}
function refresh() { status(); if (!mask) { coach(); showCard(); } }
function status() {
  api.status(`${taps} ${taps === 1 ? 'Zug' : 'Züge'} · Ziel: ${par}` + (coachOn ? (cfg.tutorial ? ' · Übungslevel: Lernhilfe kostenlos' : ' · Lernhilfe an (max. 2 Sterne)') : ''));
  $('bUndo').disabled = !hist.length;
}
function saveCur() { if (api) api.saveCur({v: 8, g, taps, hints, noteI, hist: hist.slice(-80), coachOn, coachUsed, restPlan, secondPass}); }
function paint(idx) {
  idx.forEach((j, n) => {
    const el = document.querySelector(`#blech .cell[data-i="${j}"] .cookie`); if (!el) return;
    el.classList.toggle('on', !!g[j]);
    el.classList.remove('flip'); void el.offsetWidth; el.style.animationDelay = (n * 40) + 'ms'; el.classList.add('flip');
  });
}
function onTap(e) {
  const b = e.target.closest('.cell'); if (!b) return;
  const i = +b.dataset.i;
  document.querySelectorAll('#blech .cell.hint').forEach(x => x.classList.remove('hint'));
  apply(g, i); taps++; hist.push(i);
  if (restPlan.includes(i)) restPlan = restPlan.filter(x => x !== i); else restPlan = [];
  const n = tones(mel); Snd.note(n[noteI % n.length][0], .4); noteI++;
  paint(aff[i]); saveCur(); refresh();
  if (g.every(v => v)) secondPass = false;
  if (g.every(v => v)) setTimeout(() => {
    let stars = taps <= par ? 3 : taps <= par + 4 ? 2 : 1; stars = Math.max(1, stars - hints);
    if (coachUsed) stars = Math.min(stars, 2);
    api.win({stars, melody: mel,
      text: taps <= best ? `Meisterhaft – ${taps} Züge, kürzer geht es gar nicht!`
        : taps <= par ? `Sauber gelöst in ${taps} Zügen – genau nach Lösungsweg.`
        : mask ? `Glasiert in ${taps} Zügen. Die kürzeste Lösung braucht ${best}.` : `Glasiert in ${taps} Zügen. Mit Jagd und Rest-Trick geht es in ${par}.`});
  }, 500);
}

/* ---- Lernhilfe ---- */
function advise() {
  const t = g.findIndex(v => !v); if (t < 0) return null;
  if (restPlan.length) return {kind: 'plan', target: -1, picks: restPlan.slice()};
  if (rowOf(t) < R - 1) return {kind: 'jagd', target: t, picks: [t + C]};
  const left = leftover(g), S = restSet(left) || [];
  restPlan = S.slice(); secondPass = true; saveCur();
  return {kind: 'rest', target: t, picks: S, left};
}
function coach() {
  const box = $('coach'); if (!box) return;
  document.querySelectorAll('#blech .cell.cpick,#blech .cell.ctarget').forEach(x => x.classList.remove('cpick', 'ctarget'));
  $('bCoach').setAttribute('aria-pressed', coachOn); $('bCoach').classList.toggle('active', coachOn);
  if (!coachOn) { box.hidden = true; return; }
  const a = advise(); box.hidden = false;
  if (!a) { box.innerHTML = '<b>Alles glasiert!</b>'; return; }
  const cell = i => document.querySelector(`#blech .cell[data-i="${i}"]`);
  if (a.target >= 0) cell(a.target)?.classList.add('ctarget');
  a.picks.forEach(i => cell(i)?.classList.add('cpick'));
  const steps = now => `<ol class="steps">${['Jagen, bis nur unten etwas übrig ist', 'Rest unten ablesen', 'Passende Plätzchen oben tippen', 'Noch einmal von oben jagen']
    .map((s, k) => `<li class="${k < now ? 'done' : k === now ? 'now' : ''}">${s}</li>`).join('')}</ol>`;
  if (a.kind === 'jagd') {
    box.innerHTML = (secondPass ? `<b>Rest-Trick</b>${steps(3)}` : '') +
      `<b>Jagd, Reihe ${rowOf(a.target) + 1}:</b> Das erste unglasierte Plätzchen ist <span class="k-t">rot gestrichelt</span>. ` +
      `Tippe <span class="k-p">direkt darunter</span>. Jede Form reicht genau eins nach oben – so wird das rote glasiert, und alles darüber bleibt fertig.`;
  } else {
    const names = a.picks.map(j => LETTERS[j]).join(' und ');
    const known = card(), allKnown = a.picks.every(j => known[j]);
    box.innerHTML = `<b>Rest-Trick</b>${steps(2)}` +
      (a.left ? `<p>Unten übrig: ${bits(a.left)}</p>` : '') +
      `<p>Tippe oben <span class="k-p">${names}</span>${a.picks.length > 1 ? ' (Reihenfolge egal)' : ''}. ` +
      `<b>${a.picks.length > 1 ? 'A, B, C …' : names}</b> ${a.picks.length > 1 ? 'sind' : 'ist'} ${a.picks.length > 1 ? 'die Plätzchen' : 'das Plätzchen'} der <b>obersten Reihe</b> – die Buchstaben stehen darüber.</p>` +
      `<p><b>Warum ${names}?</b> Tippt man auf einem fertigen Blech oben ${names} und jagt nach unten, bleibt genau dieses Muster übrig – ` +
      `das ist ${a.picks.length > 1 ? 'die Überlagerung ihrer' : 'sein'} <b>„Fingerabdruck${a.picks.length > 1 ? 'e' : ''}“</b>. Kommt dieses Muster beim nächsten Jagen ein zweites Mal unten an, heben sich beide auf: zweimal ist wie keinmal.</p>` +
      `<p>${allKnown ? 'Steht auch auf deiner Rezeptkarte unten. ' : ''}Selbst nachprüfen kannst du das im <b>Abdruck-Labor</b>: Dort probierst du auf einem frischen Blech aus, welchen Abdruck jedes obere Plätzchen hinterlässt.</p>` +
      `<button class="btn small" id="coachLab">Im Labor ausprobieren</button>`;
    $('coachLab').onclick = lab;
  }
}
function setCoach(on) { coachOn = on; if (on && !cfg.tutorial) coachUsed = true; saveCur(); refresh(); }
function showHint() {
  if (mask) { const sol = solve(g); if (!sol || !sol.length) return; hints++; saveCur(); document.querySelector(`#blech .cell[data-i="${sol[0]}"]`)?.classList.add('hint'); api.status('Tipp: das leuchtende Plätzchen gehört zur kürzesten Lösung (kostet einen Stern)'); return; }
  const a = advise(); if (!a || !a.picks.length) return;
  hints++; saveCur();
  document.querySelector(`#blech .cell[data-i="${a.picks[0]}"]`)?.classList.add('hint');
  api.status(`Tipp: das leuchtende Plätzchen (kostet einen Stern)`);
}

/* ---- Rezeptkarte unter dem Blech ---- */
function showCard() {
  const box = $('rcard'); if (!box) return;
  const known = card();
  if (cfg.mode !== 'rest' && !Object.keys(known).length) { box.hidden = true; return; }
  box.hidden = false;
  const atBottom = g.findIndex(v => !v) >= (R - 1) * C;
  box.innerHTML = `<div class="rc-head"><b>Rezeptkarte</b> – was jedes Plätzchen der obersten Reihe (A, B, C …) nach der Jagd unten hinterlässt</div>
    <div class="rc-list">${[...Array(C).keys()].map(j => `<div class="rc-item"><b>${LETTERS[j]}</b> ${known[j] ? bits(known[j]) : '<span class="rc-q">? – noch nicht im Abdruck-Labor getestet</span>'}</div>`).join('')}</div>
    ${atBottom ? `<div class="rc-now">Jetzt unten übrig: ${bits(leftover(g), 'now')}</div>` : ''}`;
}

/* ---- Labor: frisch glasiertes Blech, oben tippen, automatisch jagen, Abdruck ablesen ---- */
function lab() {
  let st = Array(R * C).fill(1), chosen = new Set(), busy = false;
  const cellSize = Math.max(26, Math.min(44, Math.floor(280 / C)));
  const draw = (mark = -1, target = -1, pick = -1) => {
    $('labGrid').innerHTML = st.map((v, i) => `<button class="lcell${i < C ? ' top' : ''}${i === mark ? ' tap' : ''}${i === target ? ' ltarget' : ''}${i === pick ? ' lpick' : ''}" data-i="${i}" ${i < C ? '' : 'tabindex="-1"'}>` +
      `${i < C ? `<span class="colname">${LETTERS[i]}</span>` : ''}<span class="cookie s-${shape[i]}${v ? ' on' : ''}"></span></button>`).join('');
  };
  api.help('Fingerabdruck-Labor', `
    <p>Hier ist dein Blech <b>frisch glasiert</b>. Tippe ein Plätzchen in der <b>obersten Reihe</b> an und drücke dann <b>„Jagen“</b>. Das Spiel jagt langsam für dich nach unten (Schritt für Schritt zum Mitgehen) – was unten übrig bleibt, ist der <b>Fingerabdruck</b> dieses Plätzchens.</p>
    <div class="labgrid" id="labGrid" style="--n:${C};--cs:${cellSize}px"></div>
    <div class="lab-msg" id="labMsg">Tippe oben ein Plätzchen (A${C > 1 ? '–' + LETTERS[C - 1] : ''}).</div>
    <div class="course-nav"><button class="btn" id="labReset">Leeren</button><button class="btn red" id="labGo">Jagen ▶</button></div>`);
  draw();
  $('labGrid').onclick = e => {
    const b = e.target.closest('.lcell'); if (!b || busy) return; const i = +b.dataset.i;
    if (i >= C) { $('labMsg').textContent = 'Im Labor tippst du nur oben – den Rest jagt das Spiel.'; return; }
    apply(st, i); chosen.has(i) ? chosen.delete(i) : chosen.add(i); Snd.tap(); draw();
    $('labMsg').textContent = chosen.size ? `Oben getippt: ${[...chosen].sort().map(j => LETTERS[j]).join(' + ')}. Jetzt „Jagen“!` : 'Tippe oben ein Plätzchen.';
  };
  $('labGo').addEventListener('pointerdown', () => { if (busy) speed = 2; });
  $('labReset').onclick = () => { if (busy) return; st = Array(R * C).fill(1); chosen = new Set(); draw(); $('labMsg').textContent = 'Frisch glasiert. Tippe oben ein Plätzchen.'; };
  let speed = 1; // 1 = langsam zum Mitgehen, 2 = schneller
  $('labGo').onclick = async () => {
    if (busy || !chosen.size) return; busy = true;
    $('labGo').textContent = 'Schneller';
    const step = () => wait(speed === 1 ? 950 : 300);
    const gone = () => !$('labGrid') || !$('help').classList.contains('on'); // Labor geschlossen → Vorführung abbrechen
    for (let r = 0; r < R - 1; r++) for (let c = 0; c < C; c++) if (!st[r * C + c]) {
      if (gone()) { busy = false; return; }
      const i = (r + 1) * C + c;
      draw(-1, r * C + c, i);
      $('labMsg').innerHTML = `Reihe ${r + 1}: Dieses Plätzchen ist <span class="k-t">unglasiert</span> → <span class="k-p">direkt darunter</span> tippen …`;
      await step(); if (gone()) { busy = false; return; }
      apply(st, i); Snd.tap(1.2); draw(i);
      $('labMsg').innerHTML = `Reihe ${r + 1}: getippt. Oben ist es jetzt glasiert, darunter hat sich etwas verändert.`;
      await step();
    }
    if (gone()) { busy = false; return; }
    $('labGo').textContent = 'Jagen ▶'; speed = 1;
    draw(); busy = false;
    const left = leftover(st), ch = [...chosen].sort();
    if (ch.length === 1) {
      const kn = card(), isNew = !kn[ch[0]]; kn[ch[0]] = left; persist(); showCard();
      $('labMsg').innerHTML = `Fingerabdruck von <b>${LETTERS[ch[0]]}</b>: ${bits(left)} ${isNew ? '– neu auf deiner Rezeptkarte!' : '(steht schon auf der Karte)'}`;
    } else {
      $('labMsg').innerHTML = `${ch.map(j => LETTERS[j]).join(' + ')} zusammen hinterlassen ${bits(left)}. Vergleiche mit der Karte: Das ist die <b>Überlagerung</b> der einzelnen Abdrücke – wo beide dasselbe Plätzchen treffen, heben sie sich auf.`;
    }
    chosen = new Set(); st = Array(R * C).fill(1);
  };
}

/* ---- Regeln, Kurs, Schemata ---- */
function explain(kinds, onlyNew = false) {
  const shapes = kinds.map(k => `<div class="how-row">${mini(k, true)}<div><b>${SHAPES[k].name}</b><br>wechselt mit: ${SHAPES[k].how}</div></div>`).join('');
  if (onlyNew) return api.help('Neu auf dem Blech!', `<p>Ab jetzt gibt es eine neue Form. Auch sie reicht genau eins nach oben – Jagd und Rest-Trick funktionieren wie gewohnt:</p>${shapes}`);
  api.help('So wird glasiert', `
    <ol class="how">
      <li><b>Ziel:</b> Alle Plätzchen sollen <b>weiß glasiert</b> sein.</li>
      <li>Tippst du ein Plätzchen an, <b>wechselt</b> es: unglasiert wird glasiert – aber glasiert wird auch wieder unglasiert!</li>
      <li>Dabei wechseln immer auch <b>Nachbarn mit</b>. Welche, verrät die <b>Form</b>:</li>
    </ol>${shapes}
    <p class="how-tip">Halte den Finger auf ein Plätzchen: Alle, die mitwechseln würden, werden rot umrandet. Erst beim Loslassen wird glasiert – zieh den Finger weg, um abzubrechen. Wie man systematisch vorgeht, lernst du unter „Lösungsweg“ – und Level für Level im Spiel.</p>`);
}
function mini(k, big = false) {
  const on = new Set(SHAPES[k].off.map(([r, c]) => (r + 2) * 5 + c + 2));
  return `<span class="mini${big ? ' big' : ''}" aria-hidden="true">${[...Array(25).keys()].map(i => `<b class="${i === 12 ? 'me' : on.has(i) ? 'y' : ''}"></b>`).join('')}</span>`;
}
// Beispiel-Blech: o = glasiert, x = unglasiert, Großbuchstabe = hier wird getippt
function demo(rows, label) {
  return `<figure class="demo"><span class="dgrid" style="--n:${rows[0].length}">${rows.join('').split('').map(ch =>
    `<i class="${ch.toLowerCase() === 'x' ? 'x' : 'o'}${ch === ch.toUpperCase() ? ' t' : ''}"></i>`).join('')}</span><figcaption>${label}</figcaption></figure>`;
}
const COURSE = [
  ['Zwei Grundregeln', `
    <p><b>1. Die Reihenfolge ist egal.</b> Ob du erst A und dann B tippst oder umgekehrt – am Ende sieht das Blech gleich aus.</p>
    <p><b>2. Zweimal ist wie keinmal.</b> Tippst du ein Plätzchen zweimal, ist alles wie vorher. Jedes Plätzchen brauchst du also höchstens <b>einmal</b>.</p>
    <p>Diese zweite Regel ist später der Schlüssel zum Rest-Trick.</p>`],
  ['Die Jagd: Reihe für Reihe', `
    <p>Fang <b>oben</b> an. Suche das erste unglasierte Plätzchen und tippe <b>direkt darunter</b>.</p>
    <div class="demos">${demo(['oxo', 'oOo', 'ooo'], 'Vorher')}${demo(['ooo', 'xxx', 'oxo'], 'Nachher: oben fertig')}</div>
    <p>Jede Form reicht genau <b>eins nach oben</b> – in der Reihe darüber wechselt also nur das eine Plätzchen. Fertige Reihen bleiben fertig, das Durcheinander wandert nach unten. Dann die nächste Reihe, und so weiter.</p>`],
  ['Und unten?', `
    <p>Unter der letzten Reihe ist nichts mehr zum Tippen. Manchmal geht die letzte Reihe von selbst auf – manchmal bleibt dort etwas <b>übrig</b>.</p>
    <p>Dafür gibt es den <b>Rest-Trick</b>. Er klingt erst nach Zauberei, ist aber nur eine Beobachtung, die du selbst machen kannst – Schritt für Schritt, angefangen mit einem winzigen 2×2-Blech.</p>`],
  ['Rest-Trick 1: Fingerabdrücke', `
    <p>Nimm ein <b>frisch glasiertes</b> Blech, tippe oben ein Plätzchen – sagen wir <b>A</b> – und jage nach unten.</p>
    <div class="demos">${demo(['Oo', 'oo'], 'A tippen')}${demo(['xx', 'xo'], 'danach')}${demo(['oo', 'xo'], 'nach der Jagd')}</div>
    <p>(Die Plätzchen der obersten Reihe heißen von links nach rechts <b>A, B, C …</b> – die Buchstaben stehen im Spiel über dem Blech.)</p>
    <p>Unten bleibt immer <b>dasselbe Muster</b> übrig – der <b>Fingerabdruck von A</b>. Jedes obere Plätzchen hat seinen eigenen. Im <b>Abdruck-Labor</b> (Knopf unter dem Blech) probierst du das für jedes Blech selbst aus; die Abdrücke landen auf deiner <b>Rezeptkarte</b>.</p>`],
  ['Rest-Trick 2: Abdrücke überlagern sich', `
    <p>Tippst du oben <b>A und B</b> und jagst, bleibt unten die <b>Überlagerung</b> beider Abdrücke übrig.</p>
    <p>Wo beide Abdrücke dasselbe Plätzchen treffen, heben sie sich auf – <b>zweimal ist wie keinmal</b> (Grundregel 2!).</p>
    <p>Probier es im Labor: erst A, dann B, dann A und B zusammen.</p>`],
  ['Rest-Trick 3: So geht’s', `
    <ol class="how">
      <li><b>Jagen</b>, bis nur unten etwas übrig ist.</li>
      <li>Den <b>Rest ablesen</b> und auf der Rezeptkarte suchen: Welcher Abdruck (oder welche zusammen) sieht genau so aus?</li>
      <li>Diese Plätzchen <b>oben tippen</b>.</li>
      <li><b>Noch einmal jagen</b> – fertig!</li>
    </ol>
    <p><b>Warum?</b> Der Rest unten <i>ist</i> ein Abdruck. Tippst du oben dasselbe Plätzchen, kommt beim Jagen derselbe Abdruck ein zweites Mal unten an – und zweimal ist wie keinmal.</p>
    <p class="how-tip"><b>Profi-Tipp für weniger Züge:</b> Hast du einmal herausgefunden, welche Plätzchen oben nötig sind, drück „Neu“, tippe <i>zuerst</i> diese oben und jage dann nur ein einziges Mal. Das spart viele Züge – manchmal bis zu „kürzer geht es gar nicht“.</p>`],
  ['Die Lernhilfe', `
    <p>Schaltest du die Lernhilfe ein, löst das Spiel mit dir zusammen:</p>
    <p><span class="k-t">Rot gestrichelt</span> = das erste unglasierte Plätzchen.<br><span class="k-p">Gold</span> = wo du tippen kannst – bei der Jagd direkt darunter, beim Rest-Trick oben.</p>
    <p>Mit Lernhilfe gibt es höchstens 2 Sterne. Ziel ist, dass du sie bald nicht mehr brauchst.</p>`],
];
function course(n, lesson = false) {
  const [title, body] = COURSE[n], last = n === COURSE.length - 1;
  const endOfLesson = lesson && (n === 1 || n === 5);
  api.help(`Lösungsweg ${n + 1}/${COURSE.length}: ${title}`, `${body}
    <div class="course-nav">
      ${n > 0 && !(lesson && (n === 1 || n === 2)) ? '<button class="btn" id="cPrev">‹ Zurück</button>' : '<button class="btn" id="cClose">Schließen</button>'}
      ${n === 5 && !lesson ? '<button class="btn" id="cWhy">Bonus: Warum?</button>' : ''}
      ${endOfLesson ? (n === 5 ? '<button class="btn red" id="cLab">Ins Labor</button>' : '<button class="btn red" id="cClose2">Los geht’s</button>')
        : last ? '<button class="btn red" id="cCoach">Lernhilfe einschalten</button>' : '<button class="btn red" id="cNext">Weiter ›</button>'}
    </div>`);
  $('helpOk').hidden = true;
  const close = () => $('help').classList.remove('on');
  $('cClose') && ($('cClose').onclick = close);
  $('cClose2') && ($('cClose2').onclick = close);
  $('cPrev') && ($('cPrev').onclick = () => course(n - 1, lesson));
  $('cNext') && ($('cNext').onclick = () => course(n + 1, lesson));
  $('cLab') && ($('cLab').onclick = () => lab());
  $('cWhy') && ($('cWhy').onclick = () => why(0));
  $('cCoach') && ($('cCoach').onclick = () => { close(); setCoach(true); });
}

/* ---- Bonus-Lerneinheit (optional): Warum funktioniert der Rest-Trick? Erklärung mit „Folien“ ---- */
const plus = '<span class="op">+</span>', eq = '<span class="op">=</span>';
const WHY = [
  ['Die Folien-Idee', `
    <p>Stell dir jedes Blech als <b>durchsichtige Folie</b> vor. Auf die Folie malen wir nur die <b>unglasierten</b> Plätzchen.</p>
    <p>Legt man zwei Folien übereinander, ist ein Plätzchen unglasiert, wenn es auf <b>genau einer</b> Folie unglasiert ist. Ist es auf beiden unglasiert, heben sich beide auf – <b>zweimal ist wie keinmal</b>.</p>
    <div class="demos eqn">${demo(['xo', 'oo'], 'Folie 1')}${plus}${demo(['xx', 'oo'], 'Folie 2')}${eq}${demo(['ox', 'oo'], 'übereinander')}</div>`],
  ['Jeder Tipp ist eine Folie', `
    <p>Ein Tipp auf ein Plätzchen macht nichts anderes, als eine kleine Folie mit dem <b>Muster der Form</b> auf das Blech zu legen.</p>
    <div class="demos eqn">${demo(['xo', 'oo'], 'dein Blech')}${plus}${demo(['xx', 'xo'], 'Tipp auf A')}${eq}${demo(['ox', 'xo'], 'danach')}</div>
    <p>Deshalb ist die <b>Reihenfolge egal</b>: Folien kann man in jeder Reihenfolge stapeln – das Ergebnis ist dasselbe.</p>`],
  ['Die Jagd arbeitet auf jeder Folie getrennt', `
    <p>Die Jagd schaut nur: „Ist hier etwas unglasiert? Dann direkt darunter tippen.“</p>
    <p>Liegen zwei Folien übereinander, kommt beim Jagen <b>dasselbe</b> heraus, als hättest du jede Folie <b>einzeln</b> gejagt und die Ergebnisse danach übereinandergelegt.</p>
    <p>Das hast du im Labor schon gesehen: A allein, B allein – und A + B zusammen ergibt genau die Überlagerung der beiden Abdrücke.</p>`],
  ['Der Trick – mit Folien erklärt', `
    <p><b>Folie 1</b> ist dein Blech. Nach der Jagd bleibt unten ein Rest.<br><b>Folie 2</b> ist ein frisches Blech, auf dem nur A getippt ist. Nach der Jagd bleibt unten der Abdruck von A.</p>
    <div class="demos eqn">${demo(['oo', 'xo'], 'dein Rest')}${plus}${demo(['oo', 'xo'], 'Abdruck A')}${eq}${demo(['oo', 'oo'], 'nichts mehr!')}</div>
    <p>Wenn du oben A tippst, legst du genau Folie 2 auf dein Blech. Jagst du dann, werden beide Folien gejagt und überlagert: Ist der Rest <b>gleich</b> dem Abdruck, heben sie sich auf – <b>alles glasiert</b>.</p>`],
  ['Und das Durcheinander oben?', `
    <p>Wenn du oben A tippst, ist die oberste Reihe ja erst einmal wieder kaputt. Das macht nichts:</p>
    <p>Die Jagd räumt <b>immer</b> alle Reihen bis auf die unterste auf – das ist ihre Aufgabe. Offen ist also nur, was ganz unten passiert. Und genau dort heben sich Rest und Abdruck gegenseitig auf.</p>
    <p><b>Zusammengefasst:</b> Rest ablesen → Plätzchen mit gleichem Abdruck oben tippen → jagen → fertig. Jetzt weißt du nicht nur <i>wie</i>, sondern auch <i>warum</i>.</p>`],
];
function why(n) {
  const [title, body] = WHY[n], last = n === WHY.length - 1;
  api.help(`Bonus: Warum es funktioniert (${n + 1}/${WHY.length})`, `<div class="why-title">${title}</div>${body}
    <div class="course-nav">
      ${n > 0 ? '<button class="btn" id="wPrev">‹ Zurück</button>' : '<button class="btn" id="wClose">Später</button>'}
      ${last ? '<button class="btn red" id="wDone">Verstanden!</button>' : '<button class="btn red" id="wNext">Weiter ›</button>'}
    </div>`);
  $('helpOk').hidden = true;
  const close = () => $('help').classList.remove('on');
  $('wClose') && ($('wClose').onclick = close);
  $('wDone') && ($('wDone').onclick = close);
  $('wPrev') && ($('wPrev').onclick = () => why(n - 1));
  $('wNext') && ($('wNext').onclick = () => why(n + 1));
}
function offerWhy() {
  api.help('Bonus-Lerneinheit', `<p>Du hast den Rest-Trick jetzt ein paar Mal angewendet. Möchtest du wissen, <b>warum</b> er funktioniert?</p>
    <p>5 kurze Seiten mit Bildern – ganz ohne Mathe, versprochen. Du findest sie auch später jederzeit unter „Lösungsweg“.</p>
    <div class="course-nav"><button class="btn" id="wLater">Später</button><button class="btn red" id="wYes">Ja, zeig’s mir</button></div>`);
  $('helpOk').hidden = true;
  $('wLater').onclick = () => $('help').classList.remove('on');
  $('wYes').onclick = () => why(0);
}

return {id:'blech', title:'Glasur-Blech', sub:'Glasiere alle Plätzchen – mit Jagd und Rest-Trick',
  desc:'Knobeln mit Lehrplan: vom 2×2 bis zum Meisterblech',
  start: begin, stop() {}, winTitle: 'Blech glasiert!',
  _test: {generate, solve, levelCfg, method, MOTIFS, apply: (st, i) => apply(st, i),
    coachSolve(L) { const gen = generate(L); g = gen.state.slice(); restPlan = []; let n = 0;
      for (;;) { const a = advise(); if (!a) return n === gen.par ? n : -2; const i = a.picks[0]; apply(g, i);
        if (restPlan.includes(i)) restPlan = restPlan.filter(x => x !== i); else restPlan = []; if (++n > 600) return -1; } }}};
})();
