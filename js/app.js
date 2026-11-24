/* App-Rahmen: Kalender (Startseite), Übungsküche, Spielwechsel, Levelleiste, Gewinn-Dialog, Ton-Schalter.
   Jedes Spiel-Modul liefert {id, title, sub, desc, winTitle, start(level, resume, api), stop()}.
   Tagesrätsel: api.special enthält den Bauplan (spec) – das Spiel baut daraus ein einmaliges Level. */
{
const GAMES = [Regal, Blech, Spritz,
  typeof Licht !== 'undefined' && Licht, Buch, typeof Aus !== 'undefined' && Aus,
  typeof Streu !== 'undefined' && Streu, typeof Schlitten !== 'undefined' && Schlitten].filter(Boolean);
GAMES.forEach(g => { Spiele[g.id] = g; });
let cur = null, curL = 1, sp = null; // sp = laufendes Tagesrätsel {day, part, game, spec, title}

const api = {
  get stage() { return $('stage'); },
  get controls() { return $('controls'); },
  get legend() { return $('legend'); },
  status: t => { $('status').textContent = t + (TEST ? ' · Testmodus' : ''); },
  getCur: () => { if (sp) return Kalender.specialCur(sp); const p = prog(cur.id); return p.cur && p.cur.lvl === curL ? p.cur : null; },
  saveCur: o => { if (sp) return Kalender.specialCur(sp, o || null); prog(cur.id).cur = o ? Object.assign({lvl: curL}, o) : null; persist(); },
  get special() { return sp ? sp.spec : null; },
  restart: () => startLevel(false),
  help: (title, html) => { $('helpOk').hidden = false; $('helpTitle').textContent = title; $('helpBody').innerHTML = html; $('help').classList.add('on'); $('help').querySelector('.dialog').scrollTop = 0; $('helpOk').focus({preventScroll: true}); },
  win,
  toast: m => toast(m),
};

// Bildchen für die neuen Stationen (SVG)
const ICONS = {
  licht: '<svg viewBox="0 0 64 64" width="64" height="64"><path d="M6,14 Q20,30 32,16 T58,16" stroke="#3b5d2a" stroke-width="3" fill="none"/><circle cx="14" cy="24" r="6" fill="#ffd45a"/><circle cx="32" cy="18" r="6" fill="#ff6b6b"/><circle cx="50" cy="22" r="6" fill="#ffd45a"/><path d="M10,44 h16 v12 h-16z M32,40 v16 M32,48 h22" stroke="#5d6a52" stroke-width="5" fill="none" stroke-linecap="round"/></svg>',
  aus: '<svg viewBox="0 0 64 64" width="64" height="64"><rect x="6" y="10" width="52" height="44" rx="8" fill="#ecc98a"/><path d="M12,16 h16 v8 h8 v16 h-24z" fill="#c98a4a" stroke="#8f5a28" stroke-width="2"/><path d="M40,16 h12 v24 h-8 v-8 h-4z" fill="#f2b8b0" stroke="#b97a56" stroke-width="2"/><path d="M12,44 h28 v6 h-28z" fill="none" stroke="#9aa0a8" stroke-width="2" stroke-dasharray="3 3"/></svg>',
  streu: '<svg viewBox="0 0 64 64" width="64" height="64"><rect x="10" y="10" width="44" height="44" rx="4" fill="#fff8ea" stroke="#8a5533" stroke-width="2"/><g fill="#3f8a4a"><rect x="29" y="13" width="7" height="7"/><rect x="22" y="20" width="21" height="7"/><rect x="15" y="27" width="35" height="7"/><rect x="22" y="34" width="21" height="7"/></g><rect x="29" y="41" width="7" height="8" fill="#8a5533"/><circle cx="26" cy="31" r="2.5" fill="#c8283a"/><circle cx="40" cy="24" r="2.5" fill="#e0a82e"/></svg>',
  schlitten: '<svg viewBox="0 0 64 64" width="64" height="64"><rect x="6" y="6" width="52" height="52" rx="8" fill="#eef3f8" stroke="#8a5533" stroke-width="3"/><rect x="10" y="26" width="26" height="12" rx="4" fill="#c8283a"/><circle cx="17" cy="32" r="3" fill="#e7b56e"/><circle cx="26" cy="32" r="3" fill="#fff8ea"/><rect x="40" y="10" width="12" height="40" rx="4" fill="#8fb3c9"/><rect x="10" y="44" width="26" height="10" rx="4" fill="#d6913f"/><path d="M58,32 h4" stroke="#c8283a" stroke-width="4"/></svg>',
};
function updateStars() { $('stars').innerHTML = `<b>★</b> ${totalStars()}`; }

// ---- Adventskalender ----
const calApi = {
  get screen() { return $('calendar'); },
  hub: () => showHub(),
  play: id => open(id),
  special: x => openSpecial(x),
  setTitle: t => { $('sub').textContent = t; },
  toast,
  help: (t, html) => api.help(t, html),
};
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.remove('on'); void t.offsetWidth; t.classList.add('on'); }
function screens(which) { $('calendar').hidden = which !== 'cal'; $('hub').hidden = which !== 'hub'; $('game').hidden = which !== 'game'; }
function showCal(d) {
  $('help').classList.remove('on'); $('win').classList.remove('on');
  if (cur) cur.stop(); cur = null; sp = null;
  screens('cal'); save.last = null; persist(); updateStars();
  d ? Kalender.openDay(d) : Kalender.showGrid(calApi);
  $('status').textContent = TEST ? 'Testmodus' : '';
}
function showHub() {
  $('help').classList.remove('on');
  if (cur) cur.stop(); cur = null; sp = null; Snd.stop();
  screens('hub');
  if (save.cal) { save.cal.active = null; }
  $('sub').textContent = 'Übungsküche: alles Ausgepackte frei spielen';
  const da = GAMES.filter(g => Feat.has('game:' + g.id));
  $('hub').innerHTML = `<button class="btn cal-back" id="toCal">‹ Adventskalender</button>` + (da.length ? '' : '<p class="cal-note hub-empty">Die Übungsküche ist noch leer. Ab dem 1. Dezember packt jedes Türchen etwas aus – dann kannst du hier frei weiterspielen.</p>') + da.map(g => {
    const p = prog(g.id);
    return `<button class="station" data-g="${g.id}">
      <span class="pic pic-${g.id}" aria-hidden="true">${ICONS[g.id] || '<i></i><i></i><i></i>'}</span>
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
  sp = null;
  cur = GAMES.find(g => g.id === id); if (!cur) return showHub();
  const p = prog(id);
  curL = (p.cur && p.cur.lvl) || p.level;
  screens('game');
  $('sub').textContent = cur.sub;
  const d = Kalender.active; $('back').textContent = d ? `‹ Türchen ${d}` : '‹ Übungsküche';
  save.last = id; persist();
  startLevel(true);
}
function openSpecial(x) {
  cur = Spiele[x.game]; if (!cur) return;
  sp = x; curL = 1000 + x.day * 10 + (x.part || 0); // eigene Nummer, damit Zufallsfolgen der Übungsküche unberührt bleiben
  screens('game'); $('sub').textContent = cur.sub;
  $('back').textContent = `‹ Türchen ${x.day}`;
  save.last = null; persist();
  startLevel(true);
}
function startLevel(resume) {
  Snd.stop(); cur.stop();
  const p = prog(cur.id);
  $('lvl').textContent = sp ? `★ ${sp.title}` : `Level ${curL}`;
  $('prev').hidden = $('next').hidden = !!sp;
  $('prev').disabled = curL <= 1;
  $('next').disabled = !TEST && curL >= p.level;
  $('stage').className = 'stage stage-' + cur.id;
  cur.start(curL, resume, api);
  updateStars();
}
function win({stars, text, melody}) {
  const p = prog(cur.id);
  if (!sp) { p.best[curL] = Math.max(p.best[curL] || 0, stars); p.level = Math.max(p.level, curL + 1); p.cur = null; persist(); }
  Snd.stop(); setTimeout(() => Snd.song(melody), 350); // kurz absetzen, damit nichts überlappt
  $('winTitle').textContent = sp ? 'Tagesrätsel gelöst!' : (cur.winTitle || {regal: 'Regal sortiert!', blech: 'Blech glasiert!', spritz: 'Spritzgebäck gebacken!', buch: 'Rezept gemerkt!'}[cur.id] || 'Geschafft!');
  $('winStars').innerHTML = '★'.repeat(stars) + `<span class="off">${'★'.repeat(3 - stars)}</span>`;
  const calMsg = sp ? Kalender.onSpecialWin(sp, stars) : Kalender.onWin(cur.id);
  $('winText').textContent = text + (calMsg ? ' ' + calMsg : '');
  $('toHub').textContent = Kalender.active ? `Zum Türchen ${Kalender.active}` : 'Übungsküche';
  $('go').hidden = !!sp;
  $('tip').textContent = TIPS[(curL - 1) % TIPS.length];
  $('song').textContent = Snd.on ? `♪ Es erklingt: „${melody.name}“ · ${Snd.styleName(melody.style)}${melody.voices ? ', vierstimmig' : ''}` : '';
  $('win').classList.add('on'); $('go').focus(); updateStars();
  $('next').disabled = false;
}

$('hub').onclick = e => { const b = e.target.closest('.station'); if (b) { Snd.tap(); open(b.dataset.g); } };
$('back').onclick = () => { Snd.tap(.8); const d = Kalender.active || (sp && sp.day); d ? showCal(d) : showHub(); };
$('prev').onclick = () => { if (curL > 1) { curL--; startLevel(true); } };
$('next').onclick = () => { if (TEST || curL < prog(cur.id).level) { curL++; startLevel(true); } };
$('go').onclick = () => { $('win').classList.remove('on'); if (sp) return; curL++; startLevel(false); };
$('helpOk').onclick = () => $('help').classList.remove('on');
$('toHub').onclick = () => { $('win').classList.remove('on'); const d = Kalender.active || (sp && sp.day); d ? showCal(d) : showHub(); };

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
  const list = () => ALLE_LIEDER.map((m, i) => `<div class="song-row"><button class="btn small" data-play="${i}">▶</button><button class="btn small" data-mel="${i}">nur Melodie</button>
      <span class="song-name">${m.name}<small>${m.teile ? m.teile.map(t => `${t.titel} (${Snd.styleName(t.style)}${t.percIns ? ', ' + (t.percIns === 'pauke' ? 'Pauken' : 'Trommel') : ''})`).join(' · ') : Snd.styleName(m.style) + (m.percIns ? ', Trommel' : '')}${m.voices ? ', vierstimmig' + (m.satz ? ' (' + m.satz + ')' : '') : m.chords ? ', mit Akkorden' : ''}${m.tempo ? ', ruhiger' : ''} · ${m.ok === false ? 'aus dem Gedächtnis – bitte prüfen' : 'Noten: ' + (m.src || '')}</small></span>
      <button class="btn small ${marks[m.name] === 'ok' ? 'active' : ''}" data-ok="${i}">stimmt</button>
      <button class="btn small ${marks[m.name] === 'bad' ? 'bad' : ''}" data-bad="${i}">klingt falsch</button></div>`).join('');
  api.help('Lieder-Prüfung', `<p>Tippe auf ▶ und hör dir jede Melodie an. Stimmt sie? Dann „stimmt“, sonst „klingt falsch“ – und sag Claude am besten, an welcher Stelle.</p>
    <p class="klang-wahl"><b>Klang:</b> <button class="btn small" id="klangAuf">echte Aufnahmen</button><button class="btn small" id="klangSyn">nachgebaut</button> <span class="soft" id="klangStand"></span></p>
    <div id="songList">${list()}</div><p class="how-tip" id="songSum"></p>`);
  // Klangwahl (D67): Aufnahmen oder Synthese – zum Vergleichen; ohne geladene Aufnahmen spielt immer die Synthese
  const klang = () => {
    $('klangAuf').classList.toggle('active', Snd.aufnahmen); $('klangSyn').classList.toggle('active', !Snd.aufnahmen);
    const s = Snd.ladeStand(); $('klangStand').textContent = !Snd.aufnahmen ? '' : s.fertig === s.gesamt ? `alle ${s.gesamt} Instrumente geladen` : `${s.fertig} von ${s.gesamt} Instrumenten geladen${s.fehler ? `, ${s.fehler} nicht ladbar – dort klingt die Nachbildung` : ' …'}`;
  };
  $('klangAuf').onclick = () => { Player.reset(); Snd.stop(); Snd.aufnahmen = true; Snd.ladenAlle(); klang(); };
  $('klangSyn').onclick = () => { Player.reset(); Snd.stop(); Snd.aufnahmen = false; klang(); };
  klang(); const iv = setInterval(() => { if (!$('songList')) return clearInterval(iv); klang(); }, 700);
  const sum = () => { const v = Object.values(marks); $('songSum').textContent = `${v.filter(x => x === 'ok').length} bestätigt, ${v.filter(x => x === 'bad').length} falsch, ${ALLE_LIEDER.length - v.length} offen.`; };
  $('songList').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.play) { Player.toggle('p' + b.dataset.play, b, () => Snd.song(ALLE_LIEDER[+b.dataset.play])); return; }
    if (b.dataset.mel) { const m = ALLE_LIEDER[+b.dataset.mel]; Player.toggle('m' + b.dataset.mel, b, () => Snd.phrase(m.notes, m.style, .2 * (m.tempo || 1))); return; }
    const m = ALLE_LIEDER[+(b.dataset.ok || b.dataset.bad)]; marks[m.name] = b.dataset.ok ? 'ok' : 'bad'; persist();
    $('songList').innerHTML = list(); sum();
  };
  sum();
}
if (/lieder/.test(location.hash + location.search)) setTimeout(liederCheck, 300);

// Beim Öffnen dort weitermachen, wo sie aufgehört hat
if (save.last && GAMES.some(g => g.id === save.last) && Feat.has('game:' + save.last)) open(save.last); else showCal();
}
