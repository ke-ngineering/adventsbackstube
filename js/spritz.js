/* Mechanik 4: Spritzbeutel – Spritzgebäck in einem Zug.
   Mit dem Finger eine Teigspur durch ALLE Punkte auf dem Backpapier ziehen:
   nur waagerecht/senkrecht, kein Punkt doppelt, nicht absetzen (Absetzen ist erlaubt, man setzt am Ende wieder an).
   Zurückziehen nimmt die Spur zurück. Jeder neue Punkt spielt die nächste Note des Level-Lieds.
   Level entstehen aus einem zufälligen Weg (Warnsdorff-Heuristik) → immer lösbar. */
const Spritz = (() => {
function levelCfg(L) {
  // v7 schwerer: größere Bleche, Start-Stern nur in L1–2
  const n = L <= 1 ? 4 : L <= 3 ? 5 : L <= 5 ? 6 : L <= 9 ? 7 : 8;
  // Lücken machen es knifflig: mindestens ~8 % der Felder bleiben frei
  return {R: n, C: n, cover: Math.min(.86, .7 + L * .012), maxCover: .92, marked: L <= 2};
}
function generate(L) {
  const {R, C, cover, maxCover} = levelCfg(L), M = R * C;
  const nb = i => { const r = Math.floor(i / C), c = i % C, o = []; if (r > 0) o.push(i - C); if (r < R - 1) o.push(i + C); if (c > 0) o.push(i - 1); if (c < C - 1) o.push(i + 1); return o; };
  let best = null;
  for (let t = 0; t < 400; t++) {
    const rnd = rng(L * 9001 + t * 313 + 5), seen = new Set();
    let cur = Math.floor(rnd() * M); const path = [cur]; seen.add(cur);
    for (;;) {
      const opts = nb(cur).filter(j => !seen.has(j)); if (!opts.length) break;
      const deg = j => nb(j).filter(k => !seen.has(k)).length;
      opts.sort((a, b) => deg(a) - deg(b) || rnd() - .5);
      cur = rnd() < .85 ? opts[0] : opts[Math.floor(rnd() * opts.length)];
      path.push(cur); seen.add(cur);
    }
    if (path.length <= Math.floor(M * maxCover) && (!best || path.length > best.length)) best = path;
    if (path.length >= Math.ceil(M * cover) && path.length <= Math.floor(M * maxCover)) return {R, C, path};
  }
  return {R, C, path: best};
}

let api, lvl, R, C, sol, dots, path, backs, hints, mel, drawing = false, marked, won;
const adj = (a, b) => (Math.abs(a - b) === C && a % C === b % C) || (Math.abs(a - b) === 1 && Math.floor(a / C) === Math.floor(b / C));

function begin(L, resume, a) {
  api = a; lvl = L; mel = melodyFor(L + 2);
  const gen = generate(L); R = gen.R; C = gen.C; sol = gen.path; dots = new Set(sol);
  marked = levelCfg(L).marked; path = []; backs = 0; hints = 0; won = false;
  const c = resume ? api.getCur() : null;
  if (c && Array.isArray(c.path) && c.path.every(i => dots.has(i))) { path = c.path; backs = c.backs || 0; hints = c.hints || 0; }
  else api.saveCur(null);
  api.stage.innerHTML = `<div class="spritz" id="spritz" style="--r:${R};--c:${C}">
      ${[...Array(R * C).keys()].map(i => `<span class="sp ${dots.has(i) ? 'dot' : 'hole'}${marked && i === sol[0] ? ' start' : ''}"></span>`).join('')}
      <svg class="sp-svg" viewBox="0 0 ${C} ${R}" preserveAspectRatio="none" aria-hidden="true">
        <polyline id="spHint" class="sp-hint" points=""/>
        <polyline id="spDough" class="sp-dough" points=""/>
        <polyline id="spRidge" class="sp-ridge" points=""/>
        <g id="spChoc"></g>
      </svg>
    </div>`;
  const b = $('spritz');
  b.onpointerdown = down; b.onpointermove = move; b.onpointerup = b.onpointercancel = up;
  api.controls.innerHTML = `<button class="btn" id="spBack">↶ Zurück</button><button class="btn" id="spReset">Neu ansetzen</button><button class="btn" id="spHintBtn">Tipp</button><button class="btn" id="spHelp">Wie geht das?</button>`;
  $('spBack').onclick = () => { if (path.length) { path.pop(); backs++; Snd.tap(.7); draw(); save(); } };
  $('spReset').onclick = () => { if (path.length) { backs += path.length; path = []; Snd.tap(.6); draw(); save(); } };
  $('spHintBtn').onclick = hint;
  $('spHelp').onclick = explain;
  api.legend.innerHTML = marked ? '<span>Beginne beim <b>Stern</b>. Ziehe die Spur durch alle Punkte – nur gerade, nicht schräg.</span>'
    : '<span>Ab jetzt ohne Start-Stern: Wo fängst du am besten an? (Tipp: an einem Punkt mit nur einem Nachbarn)</span>';
  draw();
  const p = prog('spritz'); if (!p.intro) { p.intro = true; persist(); explain(); }
}
function explain() {
  api.help('Spritzgebäck in einem Zug', `
    <ol class="how">
      <li>Setz den Finger auf ${marked ? 'den <b>Stern</b>' : 'einen Punkt'} und zieh eine Teigspur.</li>
      <li>Die Spur muss durch <b>alle Punkte</b> gehen – jeden genau <b>einmal</b>.</li>
      <li>Nur <b>waagerecht und senkrecht</b>, nicht schräg. Leere Stellen auf dem Papier werden übersprungen – dort darf keine Spur hin.</li>
      <li>Verfahren? Zieh die Spur einfach <b>zurück</b> oder tippe auf einen Punkt in der Spur – ab dort wird zurückgenommen.</li>
    </ol>
    <p class="how-tip">Du darfst zwischendurch absetzen und am Ende der Spur wieder ansetzen. Jeder neue Punkt spielt einen Ton – am Ende ergibt sich ein Lied.</p>`);
}
function cellAt(e) {
  const r = $('spritz').getBoundingClientRect();
  const c = Math.floor((e.clientX - r.left) / r.width * C), rr = Math.floor((e.clientY - r.top) / r.height * R);
  return c < 0 || rr < 0 || c >= C || rr >= R ? -1 : rr * C + c;
}
function down(e) {
  if (won) return;
  const i = cellAt(e); if (i < 0 || !dots.has(i)) return;
  if (!path.length) {
    if (marked && i !== sol[0]) { Snd.nope(); flashStart(); return; }
    path.push(i); note();
  } else if (i !== path.at(-1)) {
    const k = path.indexOf(i);
    if (k >= 0) { backs += path.length - 1 - k; path = path.slice(0, k + 1); Snd.tap(.7); }
    else if (adj(path.at(-1), i)) { path.push(i); note(); }
    else { Snd.nope(); return; }
  }
  drawing = true; e.currentTarget.setPointerCapture?.(e.pointerId); draw();
}
function move(e) {
  if (!drawing || won) return;
  const i = cellAt(e); if (i < 0 || i === path.at(-1)) return;
  if (path.length > 1 && i === path.at(-2)) { path.pop(); backs++; draw(); return; }
  // bei schnellen Wischern Zwischenfelder in gerader Linie ergänzen
  let guard = 0;
  while (path.at(-1) !== i && guard++ < 8) {
    const l = path.at(-1), lr = Math.floor(l / C), lc = l % C, tr = Math.floor(i / C), tc = i % C;
    const next = Math.abs(tr - lr) >= Math.abs(tc - lc) ? l + Math.sign(tr - lr) * C : l + Math.sign(tc - lc);
    if (next === l || !dots.has(next) || path.includes(next) || !adj(l, next)) break;
    path.push(next); note();
  }
  draw();
}
function up() {
  if (!drawing) return; drawing = false; save();
  if (path.length === dots.size) finish();
}
function note() { const n = mel.notes; Snd.note(n[(path.length - 1) % n.length][0], .35); }
function flashStart() { const s = document.querySelector('.sp.start'); if (s) { s.classList.remove('pulse'); void s.offsetWidth; s.classList.add('pulse'); } }
const pts = arr => arr.map(i => `${i % C + .5},${Math.floor(i / C) + .5}`).join(' ');
function draw() {
  $('spDough').setAttribute('points', pts(path));
  $('spRidge').setAttribute('points', pts(path));
  document.querySelectorAll('.sp').forEach((el, i) => el.classList.toggle('on', path.includes(i)));
  $('spBack').disabled = !path.length;
  api.status(`${path.length} von ${dots.size} Punkten`);
}
function save() { api.saveCur({path, backs, hints}); }
function hint() {
  if (won) return;
  hints++; save();
  const n = Math.min(sol.length, Math.max(3, Math.ceil(sol.length / 4) * hints));
  const h = $('spHint'); h.setAttribute('points', pts(sol.slice(0, n)));
  h.classList.remove('show'); void h.getBoundingClientRect(); h.classList.add('show');
  api.status(`Tipp: Die gestrichelte Spur zeigt einen möglichen Anfang (kostet einen Stern)`);
}
function finish() {
  won = true;
  $('spritz').classList.add('baked');
  // Schokoenden: beide Enden in Schokolade getaucht
  const xy = i => [i % C + .5, Math.floor(i / C) + .5];
  const half = (a, b) => { const [x1, y1] = xy(a), [x2, y2] = xy(b); return `${x1},${y1} ${(x1 + x2) / 2},${(y1 + y2) / 2}`; };
  const ends = [half(path[0], path[1]), half(path.at(-1), path.at(-2))].map(p => `<polyline class="sp-choc" points="${p}"/>`).join('');
  $('spChoc').innerHTML = ends;
  let stars = backs <= 3 ? 3 : backs <= 15 ? 2 : 1; stars = Math.max(1, stars - hints);
  setTimeout(() => api.win({stars, melody: mel,
    text: stars === 3 ? 'Wie vom Konditor – ohne Umwege gespritzt!' : `Gebacken! Zurückgenommen: ${backs} Schritte.`}), 900);
}

return {id:'spritz', title:'Spritzbeutel', sub:'Spritze das Gebäck in einem Zug durch alle Punkte',
  desc:'Mit dem Finger eine Teigspur ziehen – jeder Punkt genau einmal',
  start: begin, stop() { drawing = false; }, _test: {generate, levelCfg}};
})();
