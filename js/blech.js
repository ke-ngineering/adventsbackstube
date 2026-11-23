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
  {R:3, C:3, kinds:['taler'], mode:'jagd', k:2, title:'Lektion 1: Die Jagd', lesson:'jagd'},
  {R:4, C:3, kinds:['taler'], mode:'jagd', k:3, title:'Jagd üben'},
  {R:4, C:4, kinds:['taler'], mode:'jagd', k:5, title:'Jagd üben'},
  {R:2, C:2, kinds:['taler'], mode:'rest', k:2, title:'Lektion 2: Der Rest-Trick', lesson:'rest'},
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
function levelCfg(L) {
  if (L < PLAN.length) return PLAN[L];
  const n = L < 22 ? 6 : 7; // danach: freie Bleche zum Genießen
  return {R:n, C:n, kinds:ALL, mode: L % 4 === 0 ? 'jagd' : 'rest', k: Math.min(Math.floor(n * n * .5), 6 + Math.floor(L * .45)), title:'Meisterblech'};
}
const LETTERS = 'ABCDEFG';

let api, lvl, cfg, R, C, shape, aff, fps, g, taps, hints, par, best, noteI, mel, hist, coachOn = false, coachUsed = false, restPlan = [];

/* ---- Regeln & Werkzeuge ---- */
const rowOf = i => Math.floor(i / C), colOf = i => i % C;
function affected(i) {
  const r = rowOf(i), c = colOf(i);
  return SHAPES[shape[i]].off.map(([dr, dc]) => [r + dr, c + dc])
    .filter(([a, b]) => a >= 0 && b >= 0 && a < R && b < C).map(([a, b]) => a * C + b);
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
  const isPiv = new Set(piv), free = [...Array(M).keys()].filter(c => !isPiv.has(c));
  const lim = Math.min(free.length, 12); let bestX = null;
  for (let a = 0; a < (1 << lim); a++) {
    let x = 0n;
    free.forEach((c, t) => { if (t < lim && (a >> t) & 1) x |= 1n << BigInt(c); });
    for (let k = 0; k < r; k++) { const c = piv[k], others = rows[k].m & ~(1n << BigInt(c)); if (rows[k].b ^ (pop(others & x) & 1)) x |= 1n << BigInt(c); }
    const w = pop(x); if (!bestX || w < bestX.w) bestX = {w, x};
  }
  return [...Array(M).keys()].filter(i => (bestX.x >> BigInt(i)) & 1n);
}

function generate(L) {
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
  const gen = generate(L); g = gen.state; par = gen.par; best = gen.best;
  taps = 0; hints = 0; noteI = 0; hist = []; coachOn = false; coachUsed = false; restPlan = [];
  const c = resume ? api.getCur() : null;
  if (c && c.v === 8 && Array.isArray(c.g) && c.g.length === g.length) {
    g = c.g; taps = c.taps || 0; hints = c.hints || 0; noteI = c.noteI || 0; hist = c.hist || []; coachOn = !!c.coachOn; coachUsed = !!c.coachUsed; restPlan = c.restPlan || [];
  } else api.saveCur(null);
  const maxW = Math.min(460, C * 92 + 40);
  api.stage.innerHTML = `
    <div class="blech" id="blech" style="--n:${C};aspect-ratio:${C}/${R};width:min(100%,${maxW}px)">${g.map((v, i) =>
      `<button class="cell" data-i="${i}" aria-label="${SHAPES[shape[i]].name}${i < C ? ' ' + LETTERS[i] : ''}">${i < C && cfg.mode === 'rest' ? `<span class="colname">${LETTERS[i]}</span>` : ''}<span class="cookie s-${shape[i]}${v ? ' on' : ''}"></span></button>`).join('')}</div>
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
    `<button class="btn" id="bHelp">Regeln</button><button class="btn" id="bCourse">Lösungsweg</button>` +
    (L >= 6 ? `<button class="btn" id="bLab">Labor</button>` : '') + `<button class="btn" id="bCoach" aria-pressed="false">Lernhilfe</button>`;
  $('bHelp').onclick = () => explain(kinds);
  $('bCourse').onclick = () => course(0);
  $('bLab') && ($('bLab').onclick = lab);
  $('bCoach').onclick = () => setCoach(!coachOn);
  $('bUndo').onclick = () => { if (!hist.length) return; const i = hist.pop(); apply(g, i); taps--; restPlan = []; Snd.tap(.7); paint(aff[i]); saveCur(); refresh(); };
  $('hint').onclick = showHint;
  $('restart').onclick = () => api.restart();
  refresh();
  // Lektionen und neue Formen beim ersten Mal
  const p = prog('blech'); p.seen = p.seen || []; p.lessons = p.lessons || [];
  const fresh = kinds.filter(k => !p.seen.includes(k));
  if (cfg.lesson && !p.lessons.includes(cfg.lesson)) { p.lessons.push(cfg.lesson); p.seen.push(...fresh); persist(); course(cfg.lesson === 'jagd' ? 1 : 2, true); }
  else if (fresh.length) { p.seen.push(...fresh); persist(); explain(p.seen.length === fresh.length ? kinds : fresh, p.seen.length !== fresh.length); }
}
function refresh() { status(); coach(); showCard(); }
function status() {
  api.status(`${taps} ${taps === 1 ? 'Zug' : 'Züge'} · Ziel: ${par}` + (coachOn ? ' · Lernhilfe an (max. 2 Sterne)' : ''));
  $('bUndo').disabled = !hist.length;
}
function saveCur() { if (api) api.saveCur({v: 8, g, taps, hints, noteI, hist: hist.slice(-80), coachOn, coachUsed, restPlan}); }
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
  const n = mel.notes; Snd.note(n[noteI % n.length][0], .4); noteI++;
  paint(aff[i]); saveCur(); refresh();
  if (g.every(v => v)) setTimeout(() => {
    let stars = taps <= par ? 3 : taps <= par + 4 ? 2 : 1; stars = Math.max(1, stars - hints);
    if (coachUsed) stars = Math.min(stars, 2);
    api.win({stars, melody: mel,
      text: taps <= best ? `Meisterhaft – ${taps} Züge, kürzer geht es gar nicht!`
        : taps <= par ? `Sauber gelöst in ${taps} Zügen – genau nach Lösungsweg.`
        : `Glasiert in ${taps} Zügen. Mit Jagd und Rest-Trick geht es in ${par}.`});
  }, 500);
}

/* ---- Lernhilfe ---- */
function advise() {
  const t = g.findIndex(v => !v); if (t < 0) return null;
  if (restPlan.length) return {kind: 'plan', target: -1, picks: restPlan.slice()};
  if (rowOf(t) < R - 1) return {kind: 'jagd', target: t, picks: [t + C]};
  const left = leftover(g), S = restSet(left) || [];
  restPlan = S.slice(); saveCur();
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
  if (a.kind === 'jagd') {
    box.innerHTML = `<b>Jagd, Reihe ${rowOf(a.target) + 1}:</b> Das erste unglasierte Plätzchen ist <span class="k-t">rot gestrichelt</span>. ` +
      `Tippe <span class="k-p">direkt darunter</span>. Jede Form reicht genau eins nach oben – so wird das rote glasiert, und alles darüber bleibt fertig.`;
  } else {
    const names = a.picks.map(j => LETTERS[j]).join(' und ');
    const known = card(), allKnown = a.picks.every(j => known[j]);
    box.innerHTML = (a.kind === 'rest'
      ? `<b>Rest-Trick:</b> Die Jagd ist unten angekommen. Übrig bleibt ${bits(a.left)}. `
      : `<b>Rest-Trick, weiter:</b> `) +
      `Das ist der Fingerabdruck von <b>${names}</b>${a.picks.length > 1 ? ' zusammen (überlagert)' : ''}` +
      (allKnown ? ' – schau auf deine Rezeptkarte.' : ' – probier es im <b>Labor</b> aus!') +
      ` Tippe oben <span class="k-p">${names}</span>${a.picks.length > 1 ? ' (Reihenfolge egal)' : ''} und jage danach noch einmal von oben. Der gleiche Abdruck kommt dann ein zweites Mal unten an – und zweimal ist wie keinmal.`;
  }
}
function setCoach(on) { coachOn = on; if (on) coachUsed = true; saveCur(); refresh(); }
function showHint() {
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
  box.innerHTML = `<div class="rc-head"><b>Rezeptkarte</b> – Fingerabdrücke für dieses Blech</div>
    <div class="rc-list">${[...Array(C).keys()].map(j => `<div class="rc-item"><b>${LETTERS[j]}</b> ${known[j] ? bits(known[j]) : '<span class="rc-q">? – im Labor testen</span>'}</div>`).join('')}</div>
    ${atBottom ? `<div class="rc-now">Jetzt unten übrig: ${bits(leftover(g), 'now')}</div>` : ''}`;
}

/* ---- Labor: frisch glasiertes Blech, oben tippen, automatisch jagen, Abdruck ablesen ---- */
function lab() {
  let st = Array(R * C).fill(1), chosen = new Set(), busy = false;
  const cellSize = Math.max(26, Math.min(44, Math.floor(280 / C)));
  const draw = (mark = -1) => {
    $('labGrid').innerHTML = st.map((v, i) => `<button class="lcell${i < C ? ' top' : ''}${i === mark ? ' tap' : ''}" data-i="${i}" ${i < C ? '' : 'tabindex="-1"'}>` +
      `${i < C ? `<span class="colname">${LETTERS[i]}</span>` : ''}<span class="cookie s-${shape[i]}${v ? ' on' : ''}"></span></button>`).join('');
  };
  api.help('Fingerabdruck-Labor', `
    <p>Hier ist dein Blech <b>frisch glasiert</b>. Tippe ein Plätzchen in der <b>obersten Reihe</b> an und drücke dann <b>„Jagen“</b>. Das Spiel jagt für dich nach unten – was unten übrig bleibt, ist der <b>Fingerabdruck</b> dieses Plätzchens.</p>
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
  $('labReset').onclick = () => { if (busy) return; st = Array(R * C).fill(1); chosen = new Set(); draw(); $('labMsg').textContent = 'Frisch glasiert. Tippe oben ein Plätzchen.'; };
  $('labGo').onclick = async () => {
    if (busy || !chosen.size) return; busy = true;
    for (let r = 0; r < R - 1; r++) for (let c = 0; c < C; c++) if (!st[r * C + c]) {
      const i = (r + 1) * C + c; apply(st, i); Snd.tap(1.2); draw(i); await wait(260);
    }
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
    <p>Unten bleibt immer <b>dasselbe Muster</b> übrig – der <b>Fingerabdruck von A</b>. Jedes obere Plätzchen hat seinen eigenen. Im <b>Labor</b> kannst du sie für jedes Blech ausprobieren; sie landen auf deiner <b>Rezeptkarte</b>.</p>`],
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
  $('cCoach') && ($('cCoach').onclick = () => { close(); setCoach(true); });
}

return {id:'blech', title:'Glasur-Blech', sub:'Glasiere alle Plätzchen – mit Jagd und Rest-Trick',
  desc:'Knobeln mit Lehrplan: vom 2×2 bis zum Meisterblech',
  start: begin, stop() {},
  _test: {generate, solve, levelCfg, method, apply: (st, i) => apply(st, i),
    coachSolve(L) { const gen = generate(L); g = gen.state.slice(); restPlan = []; let n = 0;
      for (;;) { const a = advise(); if (!a) return n === gen.par ? n : -2; const i = a.picks[0]; apply(g, i);
        if (restPlan.includes(i)) restPlan = restPlan.filter(x => x !== i); else restPlan = []; if (++n > 600) return -1; } }}};
})();
