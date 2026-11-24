/* Mechanik 1: Vorratsregal (früher „Gewürzregal“) – Zutaten in Gläser sortieren.
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
// eis: {Glas: nötige fertige Gläser} – ein zugefrorenes Glas lässt sich erst danach benutzen
function solvable(start, limit = 120000, eis = {}) {
  const seen = new Set(); let nodes = 0, frozen = Object.keys(eis).length > 0;
  const key = s => frozen ? s.map(j => j.join(',')).join('|') : s.map(j => j.join(',')).sort().join('|');
  const dfs = s => {
    if (solved(s)) return true;
    if (++nodes > limit) return false;
    const k = key(s); if (seen.has(k)) return false; seen.add(k);
    const done = frozen ? s.filter(full).length : 0, ice = i => frozen && (eis[i] || 0) > done;
    for (let a = 0; a < s.length; a++) {
      const A = s[a]; if (!A.length || full(A) || ice(a)) continue;
      const uni = A.every(x => x === A[0]);
      for (let b = 0; b < s.length; b++) {
        if (!canPour(s, a, b) || ice(b) || (uni && !s[b].length)) continue;
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
/* Bauplan: Übungsküche = levelCfg(L); Tagesrätsel = spec {colors, cap, ings, seed, spare, geheim, eis: [[Glas, nötig]]}.
   Wendungen (D54) erst nach dem Auspacken: Geheimgläser ab Türchen 10, Eisgläser ab Türchen 20. */
function planFor(L, spec) {
  if (spec) return Object.assign({cap: 4, spare: 2, seed: L}, spec, {colors: spec.ings ? spec.ings.length : spec.colors});
  const c = levelCfg(L), o = {colors: c.colors, cap: c.cap, spare: 2, seed: L};
  if (Feat.has('regal.geheim') && L >= 4 && L % 3 === 1) o.geheim = true;
  if (Feat.has('regal.eis') && L >= 6 && L % 4 === 2) o.eis = [[L % 3, 1 + L % 2]];
  return o;
}
function generate(L, plan = planFor(L)) {
  const {colors, cap, spare} = plan; CAP = cap; let s; const eis = {}; (plan.eis || []).forEach(([j, n]) => { eis[j] = n; });
  for (let t = 0; t < 300; t++) {
    const r = rng(plan.seed * 7919 + t * 104729 + 13);
    const ids = plan.ings ? plan.ings.slice() : shuffle([...ING.keys()], r).slice(0, colors);
    const pieces = shuffle(ids.flatMap(i => Array(cap).fill(i)), r);
    s = [];
    for (let i = 0; i < colors; i++) s.push(pieces.slice(i * cap, i * cap + cap));
    for (let i = 0; i < spare; i++) s.push([]);
    if (clumps(s) > (t < 120 ? 1 : 3)) continue;
    if (solvable(s, 120000, eis)) return {s, eis};
  }
  s.push([]); return {s, eis}; // Notfall: ein Extraglas macht es sicher lösbar
}


let api, lvl, start, s, sel = null, hist = [], moves = 0, undos = 0, busy = false, doneCount = 0, parts = [], plan = {}, eis = {}, hid = [];
const countDone = () => s.filter(full).length;
const jarEl = i => document.querySelector(`.jar[data-i="${i}"]`);
function flash(i, cls) { const el = jarEl(i); if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

function begin(L, resume, a) {
  api = a; lvl = L; plan = planFor(L, api.special); const g = generate(L, plan); start = g.s; eis = g.eis; s = start.map(j => j.slice());
  hid = start.map(j => plan.geheim ? Math.max(0, j.length - 1) : 0); // Geheimgläser: nur die oberste Schicht ist zu sehen
  sel = null; hist = []; moves = 0; undos = 0; busy = false; doneCount = 0;
  const c = resume ? api.getCur() : null;
  if (c && Array.isArray(c.s) && c.s.length === s.length) { // angefangenes Level fortsetzen
    s = c.s; hist = c.hist || []; moves = c.moves || 0; undos = c.undos || 0; doneCount = c.done || countDone(); if (c.hid) hid = c.hid;
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
function saveCur() { api.saveCur({s, hist: hist.slice(-40), moves, undos, done: doneCount, hid}); }
const iced = i => (eis[i] || 0) > countDone();
function jarHTML(i) {
  const j = s[i], done = full(j), h = Math.min(hid[i] || 0, j.length), ice = iced(i);
  const label = j.length ? j.map((x, k) => k < h ? 'unbekannt' : ING[x].name).join(', ') : 'leer';
  return `<button class="jar${sel === i ? ' sel' : ''}${done ? ' done' : ''}${ice ? ' iced' : ''}" data-i="${i}" aria-label="Glas ${i + 1}: ${label}${ice ? ' (zugefroren)' : ''}">
    <span class="lid"></span>
    <span class="glass">${j.map((x, k) => k < h ? '<span class="layer secret">?</span>' : `<span class="layer" style="${layerStyle(x)}"></span>`).join('')}</span>
    ${ice ? `<span class="ice"><b>${eis[i] - countDone()}</b></span>` : ''}
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
  // Je nach Zutat: Honig fließt als Strahl, Zucker/Mohn rieseln, Kakao/Zimt stäuben, Kirschen & Co. purzeln als Stückchen
  const lh = sg.querySelector('.layer')?.getBoundingClientRect().height || 30;
  const fillTop = dr.bottom - 7 - (s[b].length + n) * (lh + 2);
  const fall = Math.max(10, fillTop - ty + lh * .6), kind = ING[ing].kind || 'grain';
  const fx = document.createElement('div'); fx.className = 'pourfx'; document.body.appendChild(fx);
  if (kind === 'liquid') {
    const stream = document.createElement('div');
    stream.className = 'stream';
    stream.style.cssText = `left:${tx - 4}px;top:${ty}px;${layerStyle(ing)}`;
    fx.appendChild(stream);
    requestAnimationFrame(() => { stream.style.height = fall + 'px'; });
    setTimeout(() => { stream.style.transition = 'opacity .15s, transform .15s'; stream.style.opacity = '0'; stream.style.transform = 'translateY(30px)'; }, 460);
  } else {
    const chunk = kind === 'chunk', count = chunk ? n * 3 : n * 18 + 10, span = 440;
    for (let k = 0; k < count; k++) {
      const p = document.createElement('i');
      const sz = chunk ? (ING[ing].shape === 'small' ? 7 : 10) : kind === 'powder' ? 3 : 3.5;
      p.className = 'pt ' + (chunk ? 'chunk ' + (ING[ing].shape || 'round') : kind);
      p.style.cssText = `left:${tx - sz / 2 + (Math.random() - .5) * (chunk ? 6 : 5)}px;top:${ty}px;width:${sz}px;height:${chunk && ING[ing].shape === 'oval' ? sz * .65 : sz}px;background:${ING[ing].c}`;
      fx.appendChild(p);
      const delay = chunk ? k * (span / count) + Math.random() * 30 : Math.random() * span;
      const drift = (Math.random() - .5) * (chunk ? 14 : kind === 'powder' ? 16 : 8), rot = chunk ? (Math.random() - .5) * 540 : 0;
      const frames = chunk
        ? [{transform: 'translate(0,0) rotate(0deg)', opacity: 1},
           {transform: `translate(${drift}px,${fall}px) rotate(${rot}deg)`, opacity: 1, offset: .82},
           {transform: `translate(${drift * 1.2}px,${fall - 6}px) rotate(${rot * 1.1}deg)`, opacity: 1, offset: .92},
           {transform: `translate(${drift * 1.3}px,${fall}px) rotate(${rot * 1.15}deg)`, opacity: 0}]
        : [{transform: 'translate(0,0)', opacity: kind === 'powder' ? .8 : 1},
           {transform: `translate(${drift}px,${fall}px)`, opacity: kind === 'powder' ? .2 : .9}];
      p.animate(frames, {duration: chunk ? 380 : 300 + Math.random() * 120, delay, easing: 'cubic-bezier(.45,0,.9,.6)', fill: 'both'});
    }
  }
  // Quelle leert sich, Ziel füllt sich
  const srcLayers = [...sg.querySelectorAll('.layer')].slice(-n);
  srcLayers.forEach(el => { el.style.transition = 'height .42s ease-in, margin .42s'; el.style.height = '0px'; el.style.marginTop = '-2px'; });
  for (let i = 0; i < n; i++) {
    const el = document.createElement('span');
    el.className = 'layer grow'; el.style.cssText = layerStyle(ing) + ';height:0';
    dg.appendChild(el);
    setTimeout(() => { el.style.height = ''; }, 60 + i * 110);
  }
  await wait(ING[ing].kind === 'chunk' ? 560 : 480);
  src.style.transform = '';
  await wait(280);
  fx.remove(); src.classList.remove('flying');
}

async function onTap(e) {
  const b = e.target.closest('.jar'); if (!b || busy) return;
  const i = +b.dataset.i;
  if (iced(i)) { Snd.nope(); flash(i, 'shake'); api.status(`Dieses Glas taut erst auf, wenn ${eis[i] - countDone()} weitere ${eis[i] - countDone() === 1 ? 'Glas' : 'Gläser'} fertig ${eis[i] - countDone() === 1 ? 'ist' : 'sind'}.`); return; }
  if (sel === null) { if (s[i].length) { sel = i; Snd.tap(); render(); } return; }
  if (sel === i) { sel = null; Snd.tap(.8); render(); return; }
  if (canPour(s, sel, i)) {
    const a = sel, ing = top(s[a]), n = pourCount(s, a, i);
    busy = true;
    Snd.pour(.42 + n * .04, ING[ing].kind, n * 3);
    await animatePour(a, i, n, ing);
    if (!$('shelves')) return; // inzwischen Spiel verlassen
    hist.push(s.map(j => j.slice())); pour(s, a, i); moves++; sel = null; busy = false;
    hid[a] = Math.min(hid[a] || 0, Math.max(0, s[a].length - 1)); // neue oberste Schicht wird sichtbar
    const thaw = Object.keys(eis).filter(k => (eis[k] || 0) === countDone() && countDone() > 0);
    render(); flash(i, 'pop'); thaw.forEach(k => { if (countDone() === eis[k]) { flash(+k, 'pop'); api.status('Ein Glas ist aufgetaut!'); } });
    const now = countDone();
    if (now > doneCount) { if (!solved(s)) Snd.phrase(parts[doneCount] || [], 'bell'); doneCount = now; } // letztes Glas: gleich das ganze Lied statt Teilstück
    saveCur();
    if (solved(s)) setTimeout(() => {
      const stars = undos === 0 ? 3 : undos <= 3 ? 2 : 1;
      api.win({stars, melody: melodyFor(lvl),
        text: stars === 3 ? `Perfekt – in ${moves} Zügen ohne Rückgängig.` : `Geschafft in ${moves} Zügen. Ohne Rückgängig gibt’s 3 Sterne.`});
    }, 450);
  } else if (s[i].length) { sel = i; Snd.tap(); render(); }
  else { Snd.nope(); flash(sel, 'shake'); }
}

return {id:'regal', title:'Vorratsregal', sub:'Sortiere jede Zutat in ihr eigenes Glas',
  desc:'Zutaten sortieren – jedes volle Glas spielt ein Stück Musik',
  start: begin, stop() { busy = false; }, winTitle: 'Regal sortiert!',
  _test: {generate, solvable, levelCfg, planFor, get CAP() { return CAP; }}};
})();
