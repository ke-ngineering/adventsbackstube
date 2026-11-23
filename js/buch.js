/* Mechanik 3: Omas Rezeptbuch – Reihenfolge merken und nachtippen.
   Zutaten-Schalen spielen Töne vor (aufsteigend sortiert wie ein Glockenspiel).
   Eigene Wendung: Jedes ungerade Level ist die Folge ein echtes Adventslied –
   wer es erkennt, merkt es sich leichter. Gerade Level: zufällige Folge.
   Fehler sind nicht schlimm: die Zeile wird wiederholt, kostet aber Sterne. */
const Buch = (() => {
function levelCfg(L) {
  return {
    T: Math.min(18, 5 + Math.floor(L * .7)),          // Länge der vollständigen Folge
    melodic: L % 2 === 1,
    nPads: Math.min(8, 4 + Math.floor((L - 1) / 3)),  // nur für zufällige Folgen
    gap: Math.max(.3, .62 - L * .012),                 // Sekunden pro Ton beim Vorspielen
  };
}
let api, lvl, cfg, pads, seq, mel, round, pos, phase, mistakes, token = 0;

function build(L) {
  cfg = levelCfg(L); const r = rng(L * 31337 + 7);
  if (cfg.melodic) {
    mel = MELODIES[Math.floor((L - 1) / 2) % MELODIES.length];
    const notes = mel.notes.slice(0, cfg.T).map(x => x[0]);
    const uniq = [...new Set(notes)].sort((a, b) => a - b);
    pads = uniq.map(n => ({note: n})); seq = notes.map(n => uniq.indexOf(n));
  } else {
    mel = null;
    const scale = [60, 62, 64, 67, 69, 72, 74, 76];
    pads = scale.slice(0, cfg.nPads).map(n => ({note: n}));
    seq = [];
    while (seq.length < cfg.T) { const x = Math.floor(r() * pads.length); if (seq.length >= 2 && seq.at(-1) === x && seq.at(-2) === x) continue; seq.push(x); }
  }
  shuffle([...ING.keys()], r).slice(0, pads.length).forEach((ing, i) => pads[i].ing = ing);
}

function begin(L, resume, a) {
  api = a; lvl = L; build(L); token++;
  round = 1; mistakes = 0; phase = 'idle';
  const c = resume ? api.getCur() : null;
  if (c && c.round) { round = Math.min(c.round, cfg.T); mistakes = c.mistakes || 0; } else api.saveCur(null);
  api.stage.innerHTML = `<div class="book">
      <div class="page-head"><span id="bkLine"></span><span class="dots" id="bkDots"></span></div>
      <div class="pads" id="pads" style="--per:${pads.length <= 4 ? pads.length : pads.length <= 6 ? 3 : 4}">${pads.map((p, i) =>
        `<button class="pad" data-i="${i}" aria-label="${ING[p.ing].name}"><span class="bowl" style="${layerStyle(p.ing)}"></span><span class="pname">${ING[p.ing].name}</span></button>`).join('')}</div>
      <div class="bk-msg" id="bkMsg">Tippe auf „Vorspielen“ und hör gut zu.</div>
    </div>`;
  $('pads').onclick = onTap;
  api.controls.innerHTML = `<button class="btn red" id="play">▶ Vorspielen</button><button class="btn" id="restart">Neu starten</button>`;
  $('play').onclick = () => playRound();
  $('restart').onclick = () => api.restart();
  api.legend.innerHTML = cfg.melodic ? '<span>♪ Diese Folge ist ein bekanntes Lied – erkennst du es?</span>' : '<span>Zufällige Folge – nur Gedächtnis zählt.</span>';
  head();
}
function head() {
  $('bkLine').textContent = `Zeile ${round} von ${cfg.T}`;
  $('bkDots').innerHTML = seq.map((_, i) => `<i class="${i < round - 1 ? 'ok' : i === round - 1 ? 'now' : ''}"></i>`).join('');
  api.status(`${mistakes} ${mistakes === 1 ? 'Fehler' : 'Fehler'}`);
}
function light(i, ms = 300) {
  const el = document.querySelector(`.pad[data-i="${i}"]`); if (!el) return;
  el.classList.add('lit'); setTimeout(() => el.classList.remove('lit'), ms);
}
async function playRound() {
  const my = ++token; phase = 'listen';
  $('play').disabled = true; $('bkMsg').textContent = 'Hör gut zu …'; head();
  await wait(450);
  for (let k = 0; k < round; k++) {
    if (my !== token) return;
    const p = pads[seq[k]]; Snd.note(p.note, cfg.gap * .9); light(seq[k], cfg.gap * 800);
    await wait(cfg.gap * 1000);
  }
  if (my !== token) return;
  phase = 'input'; pos = 0;
  $('bkMsg').textContent = round === 1 ? 'Jetzt du: tippe die Schale nach.' : `Jetzt du: ${round} Zutaten in dieser Reihenfolge.`;
  $('play').disabled = false; $('play').textContent = '↻ Nochmal hören';
}
async function onTap(e) {
  const b = e.target.closest('.pad'); if (!b) return;
  const i = +b.dataset.i;
  Snd.note(pads[i].note, .35); light(i, 220);
  if (phase !== 'input') return;
  if (i === seq[pos]) {
    pos++;
    if (pos === round) {
      phase = 'busy';
      if (round === cfg.T) return finish();
      round++; api.saveCur({round, mistakes});
      $('bkMsg').textContent = ['Richtig!', 'Genau so!', 'Prima!', 'Oma wäre stolz!'][round % 4];
      head(); await wait(750); playRound();
    }
  } else {
    mistakes++; phase = 'busy'; Snd.nope(); api.saveCur({round, mistakes});
    b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
    $('bkMsg').textContent = 'Hoppla – die Zeile kommt noch einmal.'; head();
    await wait(1100); playRound();
  }
}
function finish() {
  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
  head();
  api.win({stars, melody: mel || melodyFor(lvl),
    text: (stars === 3 ? 'Fehlerfrei gemerkt!' : `Geschafft mit ${mistakes} Fehlern.`) + (mel ? ` Erkannt? Das war „${mel.name}“.` : '')});
}

return {id:'buch', title:'Omas Rezeptbuch', sub:'Merke dir die Reihenfolge und tippe sie nach',
  desc:'Gedächtnis & Gehör – manchmal steckt ein Lied darin',
  start: begin, stop() { token++; }, _test: {build, levelCfg, get seq() { return seq; }, get pads() { return pads; }}};
})();
