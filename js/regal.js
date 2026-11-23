/* Mechanik 1: Gewürzregal – Zutaten in Gläser sortieren.
   Jedes volle Glas spielt das nächste Stück der Level-Melodie (Glockenspiel). */
const Regal = (() => {
let CAP = 4;
/* ---- Regeln ---- */
const top = j => j[j.length - 1];
const full = j => j.length === CAP && j.every(x => x === j[0]);
const solved = s => s.every(j => !j.length || full(j));
const canPour = (s, a, b) => a !== b && s[a].length > 0 && s[b].length < CAP && (!s[b].length || top(s[b]) === top(s[a]));
function pourCount(s, a, b) { const A = s[a], t = top(A); let n = 0; while (n < A.length && A[A.length - 1 - n] === t) n++; return Math.min(n, CAP - s[b].length); }
function pour(s, a, b) { const n = pourCount(s, a, b); for (let i = 0; i < n; i++) s[b].push(s[a].pop()); return n; }

/* ---- Schwierigkeit ----
   Zutaten: L1 = 6 (8 Gläser) … ab L25 = 12 (14 Gläser).
   Ab L12 jedes dritte Level hohe Gläser mit 5 Schichten. */
function levelCfg(L) {
  const steps = [[1,6],[3,7],[6,8],[9,9],[13,10],[18,11],[25,12]];
  let colors = 6; for (const [from, c] of steps) if (L >= from) colors = c;
  const cap = L >= 12 && L % 3 === 0 ? 5 : 4;
  return {colors, cap};
}

/* ---- Level-Generator mit Lösbarkeitsprüfung ---- */
function solvable(start, limit = 120000) {
  const seen = new Set(); let nodes = 0;
  const key = s => s.map(j => j.join(',')).sort().join('|');
  const dfs = s => {
    if (solved(s)) return true;
    if (++nodes > limit) return false;
    const k = key(s); if (seen.has(k)) return false; seen.add(k);
    for (let a = 0; a < s.length; a++) {
      const A = s[a]; if (!A.length || full(A)) continue;
      const uni = A.every(x => x === A[0]);
      for (let b = 0; b < s.length; b++) {
        if (!canPour(s, a, b) || (uni && !s[b].length)) continue;
        const n = s.map(j => j.slice()); pour(n, a, b);
        if (dfs(n)) return true;
      }
    }
    return false;
  };
  return dfs(start.map(j => j.slice()));
}
// gleiche Nachbarschichten machen es leichter – stark gemischte Level bevorzugen
const clumps = s => s.reduce((n, j) => n + j.filter((x, i) => i && x === j[i - 1]).length, 0);
function generate(L) {
  const {colors, cap} = levelCfg(L); CAP = cap; let s;
  for (let t = 0; t < 200; t++) {
    const r = rng(L * 7919 + t * 104729 + 13);
    const ids = shuffle([...ING.keys()], r).slice(0, colors);
    const pieces = shuffle(ids.flatMap(i => Array(cap).fill(i)), r);
    s = [];
    for (let i = 0; i < colors; i++) s.push(pieces.slice(i * cap, i * cap + cap));
    s.push([], []);
    if (clumps(s) > (t < 120 ? 1 : 3)) continue;
    if (solvable(s)) return s;
  }
  s.push([]); return s; // Notfall: ein Extraglas macht es sicher lösbar
}


let api, lvl, start, s, sel = null, hist = [], moves = 0, undos = 0, busy = false, doneCount = 0, parts = [];
const countDone = () => s.filter(full).length;
const jarEl = i => document.querySelector(`.jar[data-i="${i}"]`);
function flash(i, cls) { const el = jarEl(i); if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

function begin(L, resume, a) {
  api = a; lvl = L; start = generate(L); s = start.map(j => j.slice());
  sel = null; hist = []; moves = 0; undos = 0; busy = false; doneCount = 0;
  const c = resume ? api.getCur() : null;
  if (c && Array.isArray(c.s) && c.s.length === s.length) { // angefangenes Level fortsetzen
    s = c.s; hist = c.hist || []; moves = c.moves || 0; undos = c.undos || 0; doneCount = c.done || countDone();
  } else api.saveCur(null);
  parts = chunks(melodyFor(L).notes, start.filter(j => j.length).length);
  api.controls.innerHTML = `<button class="btn" id="undo">↶ Rückgängig</button><button class="btn" id="restart">Neu starten</button>`;
  $('undo').onclick = () => { if (!hist.length || busy) return; s = hist.pop(); undos++; sel = null; Snd.tap(.7); render(); saveCur(); };
  $('restart').onclick = () => { if (!busy) api.restart(); };
  api.stage.innerHTML = `<div id="shelves" aria-live="polite"></div>`;
  $('shelves').onclick = onTap;
  const used = [...new Set(start.flat())].sort((a, b) => a - b);
  api.legend.innerHTML = used.map(x => `<span><i style="${layerStyle(x)}"></i>${ING[x].name}</span>`).join('');
  render();
}
function saveCur() { api.saveCur({s, hist: hist.slice(-40), moves, undos, done: doneCount}); }
function jarHTML(i) {
  const j = s[i], done = full(j);
  const label = j.length ? j.map(x => ING[x].name).join(', ') : 'leer';
  return `<button class="jar${sel === i ? ' sel' : ''}${done ? ' done' : ''}" data-i="${i}" aria-label="Glas ${i + 1}: ${label}">
    <span class="lid"></span>
    <span class="glass">${j.map(x => `<span class="layer" style="${layerStyle(x)}"></span>`).join('')}</span>
    ${done ? `<span class="tag">${ING[j[0]].name}</span>` : ''}
  </button>`;
}
function render() {
  const n = s.length, per = n > 7 ? Math.ceil(n / 2) : n, rows = [];
  for (let i = 0; i < n; i += per) rows.push([...Array(Math.min(per, n - i)).keys()].map(k => k + i));
  const sh = $('shelves');
  sh.style.setProperty('--cap', CAP);
  sh.style.setProperty('--per', per);
  sh.innerHTML = rows.map(r => `<div class="shelf">${r.map(jarHTML).join('')}</div>`).join('');
  $('undo').disabled = !hist.length;
  api.status(`${moves} ${moves === 1 ? 'Zug' : 'Züge'}`);
}

/* ---- Umfüll-Animation: Glas fliegt hin, kippt, Zutat fließt ---- */
async function animatePour(a, b, n, ing) {
  const src = jarEl(a), dst = jarEl(b);
  const sg = src.querySelector('.glass'), dg = dst.querySelector('.glass');
  const sr = sg.getBoundingClientRect(), dr = dg.getBoundingClientRect();
  const dir = dr.left + dr.width / 2 >= sr.left + sr.width / 2 ? 1 : -1;
  const ang = 72 * Math.PI / 180, r = sr.height / 2;
  const tx = dr.left + dr.width / 2, ty = dr.top - 14;
  const cx = tx - dir * r * Math.sin(ang), cy = ty + r * Math.cos(ang);
  const dx = cx - (sr.left + sr.width / 2), dy = cy - (sr.top + sr.height / 2);
  src.classList.add('flying');
  src.style.transform = `translate(${dx}px, ${dy}px) rotate(${dir * 72}deg)`;
  await wait(300);
  // Strahl
  const lh = sg.querySelector('.layer')?.getBoundingClientRect().height || 30;
  const stream = document.createElement('div');
  stream.className = 'stream';
  stream.style.cssText = `left:${tx - 4}px;top:${ty}px;${layerStyle(ing)}`;
  document.body.appendChild(stream);
  const fillTop = dr.bottom - 7 - (s[b].length + n) * (lh + 2);
  requestAnimationFrame(() => { stream.style.height = Math.max(10, fillTop - ty + lh) + 'px'; });
  // Quelle leert sich, Ziel füllt sich
  const srcLayers = [...sg.querySelectorAll('.layer')].slice(-n);
  srcLayers.forEach(el => { el.style.transition = 'height .42s ease-in, margin .42s'; el.style.height = '0px'; el.style.marginTop = '-2px'; });
  for (let i = 0; i < n; i++) {
    const el = document.createElement('span');
    el.className = 'layer grow'; el.style.cssText = layerStyle(ing) + ';height:0';
    dg.appendChild(el);
    setTimeout(() => { el.style.height = ''; }, 60 + i * 110);
  }
  await wait(460);
  stream.style.transition = 'opacity .15s, transform .15s'; stream.style.opacity = '0'; stream.style.transform = 'translateY(30px)';
  src.style.transform = '';
  await wait(280);
  stream.remove(); src.classList.remove('flying');
}

async function onTap(e) {
  const b = e.target.closest('.jar'); if (!b || busy) return;
  const i = +b.dataset.i;
  if (sel === null) { if (s[i].length) { sel = i; Snd.tap(); render(); } return; }
  if (sel === i) { sel = null; Snd.tap(.8); render(); return; }
  if (canPour(s, sel, i)) {
    const a = sel, ing = top(s[a]), n = pourCount(s, a, i);
    busy = true;
    Snd.pour(.42 + n * .04);
    await animatePour(a, i, n, ing);
    if (!$('shelves')) return; // inzwischen Spiel verlassen
    hist.push(s.map(j => j.slice())); pour(s, a, i); moves++; sel = null; busy = false; render(); flash(i, 'pop');
    const now = countDone();
    if (now > doneCount) { Snd.phrase(parts[doneCount] || [], 'bell'); doneCount = now; }
    saveCur();
    if (solved(s)) setTimeout(() => {
      const stars = undos === 0 ? 3 : undos <= 3 ? 2 : 1;
      api.win({stars, melody: melodyFor(lvl),
        text: stars === 3 ? `Perfekt – in ${moves} Zügen ohne Rückgängig.` : `Geschafft in ${moves} Zügen. Ohne Rückgängig gibt’s 3 Sterne.`});
    }, 450);
  } else if (s[i].length) { sel = i; Snd.tap(); render(); }
  else { Snd.nope(); flash(sel, 'shake'); }
}

return {id:'regal', title:'Gewürzregal', sub:'Sortiere jede Zutat in ihr eigenes Glas',
  desc:'Zutaten sortieren – jedes volle Glas spielt ein Stück Musik',
  start: begin, stop() { busy = false; },
  _test: {generate, solvable, levelCfg, get CAP() { return CAP; }}};
})();
