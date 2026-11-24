/* App-Rahmen: Backstube (Startseite), Spielwechsel, Levelleiste, Gewinn-Dialog, Ton-Schalter.
   Jedes Spiel-Modul liefert {id, title, sub, desc, start(level, resume, api), stop()}. */
{
const GAMES = [Regal, Blech, Spritz, Buch];
let cur = null, curL = 1;

const api = {
  get stage() { return $('stage'); },
  get controls() { return $('controls'); },
  get legend() { return $('legend'); },
  status: t => { $('status').textContent = t + (TEST ? ' · Testmodus' : ''); },
  getCur: () => { const p = prog(cur.id); return p.cur && p.cur.lvl === curL ? p.cur : null; },
  saveCur: o => { prog(cur.id).cur = o ? Object.assign({lvl: curL}, o) : null; persist(); },
  restart: () => startLevel(false),
  help: (title, html) => { $('helpOk').hidden = false; $('helpTitle').textContent = title; $('helpBody').innerHTML = html; $('help').classList.add('on'); $('helpOk').focus(); },
  win,
};

function updateStars() { $('stars').innerHTML = `<b>★</b> ${totalStars()}`; }

// ---- Adventskalender ----
const calApi = {
  get screen() { return $('calendar'); },
  hub: () => showHub(),
  play: id => open(id),
  setTitle: t => { $('sub').textContent = t; },
  toast,
};
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.remove('on'); void t.offsetWidth; t.classList.add('on'); }
function screens(which) { $('calendar').hidden = which !== 'cal'; $('hub').hidden = which !== 'hub'; $('game').hidden = which !== 'game'; }
function showCal(d) {
  $('help').classList.remove('on'); $('win').classList.remove('on');
  if (cur) cur.stop(); cur = null;
  screens('cal'); save.last = null; persist(); updateStars();
  d ? Kalender.openDay(d) : Kalender.showGrid(calApi);
  $('status').textContent = TEST ? 'Testmodus' : '';
}
function showHub() {
  $('help').classList.remove('on');
  if (cur) cur.stop(); cur = null; Snd.stop();
  screens('hub');
  if (save.cal) { save.cal.active = null; }
  $('sub').textContent = 'Wähle eine Station in deiner Backstube';
  $('hub').innerHTML = `<button class="btn cal-back" id="toCal">‹ Adventskalender</button>` + GAMES.map(g => {
    const p = prog(g.id);
    return `<button class="station" data-g="${g.id}">
      <span class="pic pic-${g.id}" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="st-t">${g.title}</span>
      <span class="st-d">${g.desc}</span>
      <span class="st-l">Level ${p.level} · ★ ${starsOf(p)}</span>
    </button>`;
  }).join('');
  save.last = null; persist(); updateStars();
  $('toCal').onclick = () => { Snd.tap(.8); showCal(); };
  $('status').textContent = TEST ? 'Testmodus' : '';
}
function open(id) {
  cur = GAMES.find(g => g.id === id); if (!cur) return showHub();
  const p = prog(id);
  curL = (p.cur && p.cur.lvl) || p.level;
  screens('game');
  $('sub').textContent = cur.sub;
  const d = Kalender.active; $('back').textContent = d ? `‹ Türchen ${d}` : '‹ Backstube';
  save.last = id; persist();
  startLevel(true);
}
function startLevel(resume) {
  Snd.stop(); cur.stop();
  const p = prog(cur.id);
  $('lvl').textContent = `Level ${curL}`;
  $('prev').disabled = curL <= 1;
  $('next').disabled = !TEST && curL >= p.level;
  $('stage').className = 'stage stage-' + cur.id;
  cur.start(curL, resume, api);
  updateStars();
}
function win({stars, text, melody}) {
  const p = prog(cur.id);
  p.best[curL] = Math.max(p.best[curL] || 0, stars);
  p.level = Math.max(p.level, curL + 1); p.cur = null; persist();
  Snd.stop(); setTimeout(() => melody.voices ? Snd.choir(melody.voices, .2) : Snd.phrase(melody.notes, 'brass', .2), 350); // kurz absetzen, damit nichts überlappt
  $('winTitle').textContent = {regal: 'Regal sortiert!', blech: 'Blech glasiert!', spritz: 'Spritzgebäck gebacken!', buch: 'Rezept gemerkt!'}[cur.id];
  $('winStars').innerHTML = '★'.repeat(stars) + `<span class="off">${'★'.repeat(3 - stars)}</span>`;
  const calMsg = Kalender.onWin(cur.id);
  $('winText').textContent = text + (calMsg ? ' ' + calMsg : '');
  $('toHub').textContent = Kalender.active ? `Zum Türchen ${Kalender.active}` : 'Backstube';
  $('tip').textContent = TIPS[(curL - 1) % TIPS.length];
  $('song').textContent = Snd.on ? `♪ Es erklingt: „${melody.name}“${melody.voices ? ' – vierstimmig' : ''}` : '';
  $('win').classList.add('on'); $('go').focus(); updateStars();
  $('next').disabled = false;
}

$('hub').onclick = e => { const b = e.target.closest('.station'); if (b) { Snd.tap(); open(b.dataset.g); } };
$('back').onclick = () => { Snd.tap(.8); const d = Kalender.active; d ? showCal(d) : showHub(); };
$('prev').onclick = () => { if (curL > 1) { curL--; startLevel(true); } };
$('next').onclick = () => { if (TEST || curL < prog(cur.id).level) { curL++; startLevel(true); } };
$('go').onclick = () => { $('win').classList.remove('on'); curL++; startLevel(false); };
$('helpOk').onclick = () => $('help').classList.remove('on');
$('toHub').onclick = () => { $('win').classList.remove('on'); const d = Kalender.active; d ? showCal(d) : showHub(); };

const setSndBtn = () => { const b = $('snd'); b.setAttribute('aria-pressed', Snd.on); b.classList.toggle('off', !Snd.on); b.setAttribute('aria-label', Snd.on ? 'Ton ausschalten' : 'Ton einschalten'); };
$('snd').onclick = () => { Snd.toggle(); setSndBtn(); };
setSndBtn();
$('ver').textContent = VERSION;


// Ton-Test: Seite mit #tontest öffnen → Diagnose, welche Art von Ton auf diesem Gerät funktioniert
function wavBeep(freq = 660, dur = .4, rate = 22050) {
  const n = Math.floor(rate * dur), buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
  const w = (o, s) => [...s].forEach((ch, i) => v.setUint8(o + i, ch.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.sin(2 * Math.PI * freq * i / rate) * Math.min(1, (n - i) / 2000) * 12000, true);
  let bin = ''; new Uint8Array(buf).forEach(b => bin += String.fromCharCode(b));
  return 'data:audio/wav;base64,' + btoa(bin);
}
function tonTest() {
  const row = (k, v, ok) => `<tr><td>${k}</td><td class="${ok === undefined ? '' : ok ? 'ok' : 'bad'}">${v}</td></tr>`;
  const info = () => `<table class="tontest">
    ${row('Ton im Spiel', Snd.on ? 'an' : 'AUS – oben rechts einschalten', Snd.on)}
    ${row('Web Audio vorhanden', (window.AudioContext || window.webkitAudioContext) ? 'ja' : 'nein', !!(window.AudioContext || window.webkitAudioContext))}
    ${row('Zustand', Snd.state, Snd.state === 'running')}
    ${row('iPhone-Stummschalter-Schutz', navigator.audioSession ? 'verfügbar (' + navigator.audioSession.type + ')' : 'nicht verfügbar')}
    ${row('Browser', navigator.userAgent.split(' ').slice(-2).join(' '))}</table>`;
  api.help('Ton-Test', `<p>Tippe nacheinander auf die drei Knöpfe und merke dir, <b>welche du hörst</b>.</p>
    <div id="ttInfo">${info()}</div>
    <div class="course-nav" style="flex-wrap:wrap">
      <button class="btn" id="tt1">1 · Spiel-Klang</button><button class="btn" id="tt2">2 · Einfacher Ton</button><button class="btn" id="tt3">3 · Audio-Datei</button>
    </div><p id="ttMsg" class="how-tip"></p>`);
  const upd = msg => { $('ttInfo').innerHTML = info(); $('ttMsg').textContent = msg; };
  $('tt1').onclick = () => { if (!Snd.on) Snd.toggle(); Snd.phrase([[72, 1], [76, 1], [79, 2]], 'bell', .18); setTimeout(() => upd('Spiel-Klang abgespielt (Glockenspiel).'), 250); };
  $('tt2').onclick = () => {
    try { const C = window.AudioContext || window.webkitAudioContext, c = new C(), o = c.createOscillator(), g = c.createGain();
      g.gain.value = .3; o.frequency.value = 660; o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + .4);
      setTimeout(() => upd('Einfacher Ton: Zustand ' + c.state), 250); } catch (e) { upd('Einfacher Ton: Fehler – ' + e.message); }
  };
  $('tt3').onclick = () => { const a = new Audio(wavBeep()); a.play().then(() => upd('Audio-Datei läuft.')).catch(e => upd('Audio-Datei blockiert: ' + e.message)); };
}
if (/tontest/.test(location.hash + location.search)) setTimeout(tonTest, 300);


// Lieder-Prüfseite: Seite mit #lieder öffnen → jede Melodie anhören und als „stimmt“ / „klingt falsch“ markieren
function liederCheck() {
  const marks = save.songCheck || (save.songCheck = {});
  const list = () => MELODIES.map((m, i) => `<div class="song-row"><button class="btn small" data-play="${i}">▶</button>${m.voices ? `<button class="btn small" data-choir="${i}">▶ 4-stimmig</button>` : ''}
      <span class="song-name">${m.name}<small>${m.ok === false ? 'aus dem Gedächtnis – bitte prüfen' : 'Noten: ' + (m.src || '')}</small></span>
      <button class="btn small ${marks[m.name] === 'ok' ? 'active' : ''}" data-ok="${i}">stimmt</button>
      <button class="btn small ${marks[m.name] === 'bad' ? 'bad' : ''}" data-bad="${i}">klingt falsch</button></div>`).join('');
  api.help('Lieder-Prüfung', `<p>Tippe auf ▶ und hör dir jede Melodie an. Stimmt sie? Dann „stimmt“, sonst „klingt falsch“ – und sag Claude am besten, an welcher Stelle.</p>
    <div id="songList">${list()}</div><p class="how-tip" id="songSum"></p>`);
  const sum = () => { const v = Object.values(marks); $('songSum').textContent = `${v.filter(x => x === 'ok').length} bestätigt, ${v.filter(x => x === 'bad').length} falsch, ${MELODIES.length - v.length} offen.`; };
  $('songList').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.play) { Snd.stop(); if (!Snd.on) Snd.toggle(); Snd.phrase(MELODIES[+b.dataset.play].notes, 'bell', .2); return; }
    if (b.dataset.choir) { Snd.stop(); if (!Snd.on) Snd.toggle(); Snd.choir(MELODIES[+b.dataset.choir].voices, .2); return; }
    const m = MELODIES[+(b.dataset.ok || b.dataset.bad)]; marks[m.name] = b.dataset.ok ? 'ok' : 'bad'; persist();
    $('songList').innerHTML = list(); sum();
  };
  sum();
}
if (/lieder/.test(location.hash + location.search)) setTimeout(liederCheck, 300);

// Beim Öffnen dort weitermachen, wo sie aufgehört hat
if (save.last && GAMES.some(g => g.id === save.last)) open(save.last); else showCal();
}
