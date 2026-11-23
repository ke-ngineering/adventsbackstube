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

function showHub() {
  $('help').classList.remove('on');
  if (cur) cur.stop(); cur = null; Snd.stop();
  $('hub').hidden = false; $('game').hidden = true;
  $('sub').textContent = 'Wähle eine Station in deiner Backstube';
  $('hub').innerHTML = GAMES.map(g => {
    const p = prog(g.id);
    return `<button class="station" data-g="${g.id}">
      <span class="pic pic-${g.id}" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="st-t">${g.title}</span>
      <span class="st-d">${g.desc}</span>
      <span class="st-l">Level ${p.level} · ★ ${starsOf(p)}</span>
    </button>`;
  }).join('');
  save.last = null; persist(); updateStars();
  $('status').textContent = TEST ? 'Testmodus' : '';
}
function open(id) {
  cur = GAMES.find(g => g.id === id); if (!cur) return showHub();
  const p = prog(id);
  curL = (p.cur && p.cur.lvl) || p.level;
  $('hub').hidden = true; $('game').hidden = false;
  $('sub').textContent = cur.sub;
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
  Snd.phrase(melody.notes, 'brass', .2);
  $('winTitle').textContent = {regal: 'Regal sortiert!', blech: 'Blech glasiert!', spritz: 'Spritzgebäck gebacken!', buch: 'Rezept gemerkt!'}[cur.id];
  $('winStars').innerHTML = '★'.repeat(stars) + `<span class="off">${'★'.repeat(3 - stars)}</span>`;
  $('winText').textContent = text;
  $('tip').textContent = TIPS[(curL - 1) % TIPS.length];
  $('song').textContent = Snd.on ? `♪ Es erklingt: „${melody.name}“` : '';
  $('win').classList.add('on'); $('go').focus(); updateStars();
  $('next').disabled = false;
}

$('hub').onclick = e => { const b = e.target.closest('.station'); if (b) { Snd.tap(); open(b.dataset.g); } };
$('back').onclick = () => { Snd.tap(.8); showHub(); };
$('prev').onclick = () => { if (curL > 1) { curL--; startLevel(true); } };
$('next').onclick = () => { if (TEST || curL < prog(cur.id).level) { curL++; startLevel(true); } };
$('go').onclick = () => { $('win').classList.remove('on'); curL++; startLevel(false); };
$('helpOk').onclick = () => $('help').classList.remove('on');
$('toHub').onclick = () => { $('win').classList.remove('on'); showHub(); };

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

// Beim Öffnen dort weitermachen, wo sie aufgehört hat
if (save.last && GAMES.some(g => g.id === save.last)) open(save.last); else showHub();
}
