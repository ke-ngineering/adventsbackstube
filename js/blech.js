/* Mechanik 2: Glasur-Blech – alle Plätzchen glasieren.
   Antippen wechselt ein Plätzchen UND seine Nachbarn zwischen glasiert/unglasiert.
   Eigene Wendung: Die FORM bestimmt, welche Nachbarn mitwechseln.
   v7: JEDE Form nimmt genau das Plätzchen direkt darüber mit und reicht sonst nicht nach oben.
   Level entstehen rückwärts nur aus Tippern ab Reihe 2 → die „Jagd“ (immer direkt unter das erste
   unglasierte tippen) löst jedes Blech garantiert. Ziel für 3 Sterne = Zugzahl der Jagd. */
const Blech = (() => {
const SHAPES = {
  taler:  {name:'Taler',        how:'oben, unten, links und rechts',        off:[[0,0],[-1,0],[1,0],[0,-1],[0,1]]},          // Kreuz
  stern:  {name:'Zimtstern',    how:'oben und die zwei schrägen unten',     off:[[0,0],[-1,0],[1,-1],[1,1]]},                // wie die Sternspitzen
  stange: {name:'Spritzgebäck', how:'oben sowie zwei links und zwei rechts', off:[[0,0],[-1,0],[0,-1],[0,-2],[0,1],[0,2]]}, // T-Form
};
function levelCfg(L) {
  // sanfter Einstieg: L1–2 auf 3×3 mit 1–2 Zügen, neue Formen ab L6 (Stern) und L12 (Spritzgebäck)
  const N = L <= 2 ? 3 : L <= 5 ? 4 : L <= 10 ? 5 : L <= 18 ? 6 : 7;
  const kinds = L < 6 ? ['taler'] : L < 12 ? ['taler', 'stern'] : ['taler', 'stern', 'stange'];
  const k = L <= 2 ? L : Math.min(Math.floor(N * N * .5), 2 + Math.floor(L * .7));
  return {N, kinds, k};
}

let api, lvl, N, shape, aff, g, taps, hints, par, noteI, mel, hist, coachOn = false, coachUsed = false, restMode = false;

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

// Jagd: Reihe für Reihe direkt unter jedes unglasierte Plätzchen tippen → Liste der Tipper
function chase(state) {
  const st = state.slice(), taps = [];
  for (let r = 0; r < N - 1; r++) for (let c = 0; c < N; c++) if (!st[r * N + c]) { const i = (r + 1) * N + c; apply(st, i); taps.push(i); }
  return {taps, ok: st.every(v => v)};
}
function generate(L) {
  const {N: n, kinds, k} = levelCfg(L); N = n;
  for (let t = 0; t < 80; t++) {
    const r = rng(L * 4241 + t * 7717 + 3);
    shape = Array.from({length: N * N}, () => kinds[Math.floor(r() * kinds.length)]);
    aff = shape.map((_, i) => affected(i));
    const state = Array(N * N).fill(1);
    shuffle([...Array(N * N - N).keys()].map(i => i + N), r).slice(0, Math.min(k, N * N - N)).forEach(i => apply(state, i)); // nur ab Reihe 2
    const ch = chase(state);
    if (ch.ok && ch.taps.length >= Math.min(k, 3) && state.some(v => !v)) return {state, par: ch.taps.length};
  }
  throw new Error('Kein Blech gefunden');
}

function begin(L, resume, a) {
  api = a; lvl = L; mel = melodyFor(L + 1);
  const gen = generate(L); g = gen.state; par = gen.par; taps = 0; hints = 0; noteI = 0; hist = [];
  const c = resume ? api.getCur() : null;
  coachOn = false; coachUsed = false; restMode = false;
  if (c && c.v === 7 && Array.isArray(c.g) && c.g.length === g.length) { g = c.g; taps = c.taps || 0; hints = c.hints || 0; noteI = c.noteI || 0; hist = c.hist || []; coachOn = !!c.coachOn; coachUsed = !!c.coachUsed; restMode = !!c.restMode; }
  else api.saveCur(null);
  api.stage.innerHTML = `<div class="blech" id="blech" style="--n:${N}">${g.map((v, i) =>
    `<button class="cell" data-i="${i}" aria-label="${SHAPES[shape[i]].name}"><span class="cookie s-${shape[i]}${v ? ' on' : ''}"></span></button>`).join('')}</div>
    <div class="coach" id="coach" aria-live="polite" hidden></div>`;
  $('blech').onclick = onTap;
  const bl = $('blech'), clearPv = () => bl.querySelectorAll('.pv').forEach(x => x.classList.remove('pv'));
  bl.onpointerdown = e => { const c = e.target.closest('.cell'); if (!c) return; clearPv(); aff[+c.dataset.i].forEach(j => bl.querySelector(`.cell[data-i="${j}"]`).classList.add('pv')); };
  bl.onpointerup = bl.onpointercancel = bl.onpointerleave = () => setTimeout(clearPv, 260);
  const kinds = [...new Set(shape)];
  api.legend.innerHTML = kinds.map(k => `<span class="pat">${mini(k)}<span><b>${SHAPES[k].name}</b> wechselt ${SHAPES[k].how}</span></span>`).join('');
  api.controls.innerHTML = `<button class="btn" id="bUndo">↶ Zurück</button><button class="btn" id="hint">Tipp</button><button class="btn" id="restart">Neu</button><button class="btn" id="bHelp">Regeln</button><button class="btn" id="bCourse">Lösungsweg</button><button class="btn" id="bCoach" aria-pressed="false">Lernhilfe</button>`;
  $('bHelp').onclick = () => explain(kinds);
  $('bCourse').onclick = () => course(0);
  $('bCoach').onclick = () => setCoach(!coachOn);
  $('bUndo').onclick = () => { if (!hist.length) return; const i = hist.pop(); apply(g, i); taps--; Snd.tap(.7); paint(aff[i]); saveCur(); status(); coach(); };
  $('hint').onclick = showHint;
  $('restart').onclick = () => api.restart();

  status(); coach();
  // Anleitung beim ersten Mal, neue Formen kurz vorstellen
  const p = prog('blech'); p.seen = p.seen || [];
  const fresh = kinds.filter(k => !p.seen.includes(k));
  if (fresh.length) { p.seen.push(...fresh); persist(); explain(p.seen.length === fresh.length ? kinds : fresh, p.seen.length !== fresh.length); }
}
function explain(kinds, onlyNew = false) {
  const shapes = kinds.map(k => `<div class="how-row">${mini(k, true)}<div><b>${SHAPES[k].name}</b><br>wechselt mit: ${SHAPES[k].how}</div></div>`).join('');
  if (onlyNew) return api.help('Neu auf dem Blech!', `<p>Ab jetzt gibt es eine neue Form. Sie nimmt andere Nachbarn mit:</p>${shapes}`);
  api.help('So wird glasiert', `
    <ol class="how">
      <li><b>Ziel:</b> Alle Plätzchen sollen <b>weiß glasiert</b> sein.</li>
      <li>Tippst du ein Plätzchen an, <b>wechselt</b> es: unglasiert wird glasiert – aber glasiert wird auch wieder unglasiert!</li>
      <li>Dabei wechseln immer auch <b>Nachbarn mit</b>. Welche, verrät die <b>Form</b> des angetippten Plätzchens:</li>
    </ol>${shapes}
    <p class="how-tip"><b>Wichtig:</b> Jede Form nimmt das Plätzchen direkt <b>darüber</b> mit. Wie man das ausnutzt, zeigt der Knopf „Lösungsweg“.<br>Halte den Finger auf ein Plätzchen: Alle, die mitwechseln würden, leuchten rot umrandet. Erst beim Loslassen wird glasiert – zieh den Finger weg, um abzubrechen.</p>`);
}
// kleines 5×5-Schema: welche Nachbarn wechseln mit
function mini(k, big = false) {
  const on = new Set(SHAPES[k].off.map(([r, c]) => (r + 2) * 5 + c + 2));
  return `<span class="mini${big ? ' big' : ''}" aria-hidden="true">${[...Array(25).keys()].map(i => `<b class="${i === 12 ? 'me' : on.has(i) ? 'y' : ''}"></b>`).join('')}</span>`;
}
function status() { api.status(`${taps} ${taps === 1 ? 'Zug' : 'Züge'} · Ziel: ${par}`); $('bUndo').disabled = !hist.length; }
function saveCur() { api.saveCur({v: 7, g, taps, hints, noteI, hist: hist.slice(-60), coachOn, coachUsed, restMode}); }
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
  paint(aff[i]); saveCur(); status(); coach();
  if (g.every(v => v)) setTimeout(() => {
    let stars = taps <= par ? 3 : taps <= par + 4 ? 2 : 1; stars = Math.max(1, stars - hints);
    if (coachUsed) stars = Math.min(stars, 2);
    api.win({stars, melody: mel,
      text: taps <= par ? `Meisterhaft – in ${taps} Zügen, ohne einen einzigen Umweg!` : `Glasiert in ${taps} Zügen. Mit der Jagd geht es in ${par}.`});
  }, 500);
}
function showHint() {
  const a = advise(); const sol = a ? a.picks : []; if (!sol.length) return;
  hints++; saveCur();
  const el = document.querySelector(`.cell[data-i="${sol[0]}"]`); el && el.classList.add('hint');
  api.status(`Tipp: das leuchtende Plätzchen (kostet einen Stern)`);
}

/* ---- Lernhilfe: Jagd-Methode + Rest-Trick ----
   Jagd: erstes unglasiertes Plätzchen (Leserichtung) suchen und ein Plätzchen tippen, das es erwischt,
   ohne irgendein Plätzchen DAVOR zu verändern → der Fehler wandert garantiert nach hinten/unten.
   Geht das nicht mehr, Rest-Trick: Plätzchen aus einer (vom Löser berechneten) Lösung, oberste Reihe zuerst. */
const rowOf = i => Math.floor(i / N), colOf = i => i % N;
function advise() {
  const t = g.findIndex(v => !v); if (t < 0) return null;
  if (rowOf(t) < N - 1) return {kind: 'jagd', target: t, picks: [t + N]};
  const sol = solve(g) || [];
  const top = Math.min(...sol.map(rowOf));
  return {kind: 'rest', target: t, picks: sol.filter(i => rowOf(i) === top)};
}
function coach() {
  const box = $('coach'); if (!box) return;
  document.querySelectorAll('.cell.cpick,.cell.ctarget').forEach(x => x.classList.remove('cpick', 'ctarget'));
  $('bCoach').setAttribute('aria-pressed', coachOn); $('bCoach').classList.toggle('active', coachOn);
  if (!coachOn) { box.hidden = true; return; }
  const a = advise(); box.hidden = false;
  if (!a) { box.innerHTML = '<b>Alles glasiert!</b>'; return; }
  if (a.kind === 'rest' && !restMode) { restMode = true; saveCur(); }
  const cell = i => document.querySelector(`.cell[data-i="${i}"]`);
  cell(a.target)?.classList.add('ctarget');
  a.picks.forEach(i => cell(i)?.classList.add('cpick'));
  const r = rowOf(a.target) + 1, i = a.picks[0], name = SHAPES[shape[i]].name;
  if (a.kind === 'jagd') {
    box.innerHTML = `<b>Jagd, Reihe ${r}:</b> Das erste unglasierte Plätzchen ist <span class="k-t">rot gestrichelt</span>. ` +
      `Tippe den ${name} <span class="k-p">direkt darunter</span>. Jede Form reicht genau eins nach oben – so wird das rote glasiert, ` +
      `und alles darüber bleibt fertig. Was unten durcheinandergerät, erledigst du in der nächsten Reihe.`;
  } else {
    box.innerHTML = `<b>Unten ist etwas übrig.</b> Das passiert nur, wenn weiter oben ein Plätzchen getippt wurde, das gar nicht nötig war. ` +
      `Am einfachsten: <b>Neu</b> drücken und nur jagen – das geht bei jedem Blech garantiert auf. ` +
      `Oder du tippst die <span class="k-p">gold markierten</span> Plätzchen – die hat das Spiel für dich ausgerechnet.`;
  }
}
function setCoach(on) {
  coachOn = on; if (on) coachUsed = true; saveCur(); coach();
  if (on) api.status(`${taps} ${taps === 1 ? 'Zug' : 'Züge'} · Lernhilfe an (höchstens 2 Sterne)`); else status();
}
// kleines Beispiel-Blech für den Kurs: o = glasiert, x = unglasiert, großgeschrieben = hier tippen
function demo(rows, label) {
  return `<figure class="demo"><span class="dgrid" style="--n:${rows[0].length}">${rows.join('').split('').map(ch =>
    `<i class="${ch.toLowerCase() === 'x' ? 'x' : 'o'}${ch === ch.toUpperCase() ? ' t' : ''}"></i>`).join('')}</span><figcaption>${label}</figcaption></figure>`;
}
const COURSE = [
  ['Zwei Grundregeln', `
    <p><b>1. Die Reihenfolge ist egal.</b> Ob du erst A und dann B tippst oder umgekehrt – am Ende sieht das Blech gleich aus.</p>
    <p><b>2. Zweimal ist wie keinmal.</b> Tippst du ein Plätzchen zweimal, ist alles wieder wie vorher. Jedes Plätzchen brauchst du also höchstens <b>einmal</b>.</p>`],
  ['Die Jagd: Reihe für Reihe', `
    <p>Fang <b>oben</b> an. Suche das erste unglasierte Plätzchen und tippe das Plätzchen <b>direkt darunter</b>.</p>
    <div class="demos">${demo(['oxo', 'oOo', 'ooo'], 'Vorher: oben fehlt eins')}${demo(['ooo', 'xxx', 'oxo'], 'Nachher: oben fertig')}</div>
    <p>Oben ist jetzt alles fertig – das Durcheinander ist nach unten gewandert. Ist die erste Reihe fertig, mach mit der zweiten genauso weiter, dann mit der dritten …</p>`],
  ['Warum das immer klappt', `
    <p>Schau dir die Schemata unter dem Blech an: <b>Jede Form reicht genau ein Plätzchen nach oben</b> – nie weiter, nie schräg nach oben.</p>
    <p>Tippst du also direkt unter ein unglasiertes Plätzchen, wechselt in der Reihe darüber <b>nur dieses eine</b>. Alles, was schon fertig ist, bleibt fertig.</p>
    <p>Und die letzte Reihe? Jedes Blech in diesem Spiel ist so gebacken, dass sie <b>von selbst aufgeht</b>, wenn du nur jagst. Darauf kannst du dich verlassen.</p>`],
  ['Wo bleibt das Knifflige?', `
    <p>Mit der Jagd schaffst du jedes Blech. Für <b>3 Sterne</b> darfst du aber keinen einzigen Zug zu viel machen – also nichts tippen, was die Jagd nicht braucht.</p>
    <p>Der Profi-Trick: Schau <b>vorher</b>, was ein Tipp unten anrichtet (Finger drauf halten!). So siehst du schon beim Tippen, welche Plätzchen in der nächsten Reihe dran sein werden.</p>
    <p>Bleibt unten doch etwas übrig, wurde oben etwas Unnötiges getippt – dann einfach <b>Neu</b> und sauber jagen.</p>`],
  ['Die Lernhilfe', `
    <p>Schaltest du die Lernhilfe ein, jagt das Spiel mit dir:</p>
    <p><span class="k-t">Rot gestrichelt</span> = das erste unglasierte Plätzchen.<br><span class="k-p">Gold</span> = das Plätzchen direkt darunter, das du tippen kannst.</p>
    <p>Nach ein paar Blechen brauchst du sie nicht mehr. Mit Lernhilfe gibt es höchstens 2 Sterne.</p>`],
];
function course(n) {
  const [title, body] = COURSE[n], last = n === COURSE.length - 1;
  api.help(`Lösungsweg ${n + 1}/${COURSE.length}: ${title}`, `${body}
    <div class="course-nav">
      ${n > 0 ? '<button class="btn" id="cPrev">‹ Zurück</button>' : '<button class="btn" id="cClose">Schließen</button>'}
      ${last ? '<button class="btn red" id="cCoach">Lernhilfe einschalten</button>' : '<button class="btn red" id="cNext">Weiter ›</button>'}
    </div>`);
  $('helpOk').hidden = true;
  $('cClose') && ($('cClose').onclick = () => $('help').classList.remove('on'));
  $('cPrev') && ($('cPrev').onclick = () => course(n - 1));
  $('cNext') && ($('cNext').onclick = () => course(n + 1));
  $('cCoach') && ($('cCoach').onclick = () => { $('help').classList.remove('on'); setCoach(true); });
}

return {id:'blech', title:'Glasur-Blech', sub:'Glasiere alle Plätzchen – die Form verrät, wer mitwechselt',
  desc:'Knobeln: jedes Plätzchen nimmt Nachbarn mit',
  start: begin, stop() {}, _test: {generate, solve, levelCfg, apply: (st, i) => apply(st, i),
    coachSolve(L) { const gen = generate(L); g = gen.state.slice(); let n = 0; for (;;) { const a = advise(); if (!a) return n === gen.par ? n : -2; if (a.kind === 'rest') return -3; apply(g, a.picks[0]); if (++n > 400) return -1; } }}};
})();
