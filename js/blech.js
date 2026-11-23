/* Mechanik 2: Glasur-Blech – alle Plätzchen glasieren.
   Antippen wechselt ein Plätzchen UND seine Nachbarn zwischen glasiert/unglasiert.
   Eigene Wendung: Die FORM bestimmt, welche Nachbarn mitwechseln.
   Level entstehen rückwärts (fertiges Blech + zufällige Tipper) → immer lösbar.
   Ein GF(2)-Löser berechnet die minimale Zugzahl (Ziel für 3 Sterne) und liefert Tipps. */
const Blech = (() => {
const SHAPES = {
  taler:  {name:'Taler',        how:'oben, unten, links und rechts', off:[[0,0],[1,0],[-1,0],[0,1],[0,-1]]},   // Kreuz
  stern:  {name:'Zimtstern',    how:'die vier schrägen Nachbarn',    off:[[0,0],[1,1],[1,-1],[-1,1],[-1,-1]]}, // schräg
  stange: {name:'Spritzgebäck', how:'zwei links und zwei rechts',    off:[[0,0],[0,1],[0,-1],[0,2],[0,-2]]},   // waagerechte Reihe
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
  coachOn = false; coachUsed = false; restMode = false;
  if (c && Array.isArray(c.g) && c.g.length === g.length) { g = c.g; taps = c.taps || 0; hints = c.hints || 0; noteI = c.noteI || 0; hist = c.hist || []; coachOn = !!c.coachOn; coachUsed = !!c.coachUsed; restMode = !!c.restMode; }
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
    <p class="how-tip">Halte den Finger auf ein Plätzchen: Alle, die mitwechseln würden, leuchten rot umrandet. Erst beim Loslassen wird glasiert – zieh den Finger weg, um abzubrechen.</p>`);
}
// kleines 5×5-Schema: welche Nachbarn wechseln mit
function mini(k, big = false) {
  const on = new Set(SHAPES[k].off.map(([r, c]) => (r + 2) * 5 + c + 2));
  return `<span class="mini${big ? ' big' : ''}" aria-hidden="true">${[...Array(25).keys()].map(i => `<b class="${i === 12 ? 'me' : on.has(i) ? 'y' : ''}"></b>`).join('')}</span>`;
}
function status() { api.status(`${taps} ${taps === 1 ? 'Zug' : 'Züge'} · Bestwert ${par}`); $('bUndo').disabled = !hist.length; }
function saveCur() { api.saveCur({g, taps, hints, noteI, hist: hist.slice(-60), coachOn, coachUsed, restMode}); }
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
      text: taps <= par ? `Meisterhaft – ${taps} Züge, genau der Bestwert!` : `Glasiert in ${taps} Zügen. Der Bestwert wäre ${par}.`});
  }, 500);
}
function showHint() {
  const sol = solve(g); if (!sol || !sol.length) return;
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
  if (!restMode) {
    let best = null;
    for (let i = 0; i < N * N; i++) {
      const A = aff[i]; if (!A.includes(t) || A.some(j => j < t)) continue;
      const score = Math.abs(rowOf(i) - (rowOf(t) + 1)) * 100 + Math.abs(colOf(i) - colOf(t)) * 10 + A.filter(j => rowOf(j) === rowOf(t)).length;
      if (!best || score < best.score) best = {i, score};
    }
    if (best) return {kind: 'jagd', target: t, picks: [best.i]};
  }
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
    const below = rowOf(i) === rowOf(a.target) + 1 && colOf(i) === colOf(a.target);
    const diag = rowOf(i) === rowOf(a.target) + 1 && Math.abs(colOf(i) - colOf(a.target)) === 1;
    box.innerHTML = `<b>Jagd-Methode, Reihe ${r}:</b> Das erste unglasierte Plätzchen ist <span class="k-t">rot gestrichelt</span>. ` +
      (below ? `Tippe den ${name} <span class="k-p">direkt darunter</span>: Er erwischt das rote, lässt aber alles darüber in Ruhe.`
       : diag ? `Tippe den ${name} <span class="k-p">schräg darunter</span>: Er reicht schräg nach oben genau an das rote heran.`
       : `Tippe das <span class="k-p">gold markierte</span> Plätzchen (${name}): Es erwischt das rote, ohne fertige Plätzchen davor zu stören.`) +
      ` So wandert das Problem Schritt für Schritt nach unten.`;
  } else {
    box.innerHTML = `<b>Rest-Trick:</b> Mit der Jagd kommt man hier nicht weiter – die übrigen unglasierten Plätzchen liegen am Rand. ` +
      `Tippe jetzt die <span class="k-p">gold markierten</span> Plätzchen${a.picks.length > 1 ? ' (Reihenfolge egal)' : ''}. ` +
      `Das sieht erst nach Chaos aus, aber jeder dieser Züge bringt dich der Lösung näher.`;
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
    <p><b>2. Zweimal ist wie keinmal.</b> Tippst du ein Plätzchen zweimal, ist alles wieder wie vorher. Jedes Plätzchen brauchst du also höchstens <b>einmal</b>.</p>
    <p>Das heißt: Die Frage ist nie „in welcher Reihenfolge?“, sondern nur „<b>welche</b> Plätzchen tippe ich an?“</p>`],
  ['Die Jagd: Reihe für Reihe', `
    <p>Arbeite dich <b>von oben nach unten</b> vor. Suche das erste unglasierte Plätzchen und tippe den Taler <b>direkt darunter</b>.</p>
    <div class="demos">${demo(['oxo', 'oOo', 'ooo'], 'Vorher: oben fehlt eins')}${demo(['ooo', 'xxx', 'oxo'], 'Nachher: oben fertig')}</div>
    <p>Oben ist jetzt alles fertig – das Problem ist nach unten gewandert. Mach mit der nächsten Reihe genauso weiter. Fertige Reihen rührst du nie wieder an.</p>`],
  ['Sterne und Spritzgebäck', `
    <p>Bei anderen Formen gilt dieselbe Idee: Tippe ein Plätzchen <b>unterhalb</b>, das das unglasierte erwischt, aber <b>nichts darüber</b> verändert.</p>
    <p><b>Zimtstern:</b> Er reicht schräg nach oben – tippe ihn <b>schräg darunter</b>.<br>
    <b>Spritzgebäck:</b> Es wirkt nur in seiner eigenen Reihe. Nimm es, wenn in einer Reihe mehrere nebeneinander fehlen.</p>
    <p>Prüfen kannst du jeden Zug mit dem Finger: drücken, schauen, ob oben etwas rot umrandet ist – wenn ja, wegziehen.</p>`],
  ['Der Rest-Trick', `
    <p>Oft bleiben am Ende <b>nur ganz unten</b> ein paar unglasierte Plätzchen übrig – darunter ist ja nichts mehr zum Tippen.</p>
    <p>Dann hilft ein Trick: Ganz <b>oben</b> bestimmte Plätzchen antippen und danach <b>noch einmal jagen</b>. Welche oben die richtigen sind, hängt vom Rest unten ab – das ist der knifflige Teil, den Profis auswendig lernen.</p>
    <p>Die <b>Lernhilfe</b> rechnet dir aus, welche es sind.</p>`],
  ['Die Lernhilfe', `
    <p>Schaltest du die Lernhilfe ein, denkt das Spiel mit:</p>
    <p><span class="k-t">Rot gestrichelt</span> = das Plätzchen, um das es gerade geht.<br><span class="k-p">Gold</span> = der Vorschlag, wo du tippen kannst.<br>Darunter steht, <b>warum</b>.</p>
    <p>Du kannst jederzeit selbst etwas anderes tippen – die Lernhilfe rechnet dann neu. Mit Lernhilfe gibt es höchstens 2 Sterne.</p>`],
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
    coachSolve(L) { const gen = generate(L); g = gen.state.slice(); restMode = false; let n = 0; for (;;) { const a = advise(); if (!a) return n; if (a.kind === 'rest') restMode = true; apply(g, a.picks[0]); if (++n > 400) return -1; } }}};
})();
