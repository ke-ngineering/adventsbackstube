/* Adventskalender 2.0 (D54): Jedes Türchen packt etwas aus – Spiele, Wendungen, ein Tagesrätsel, ein Plätzchen, eine Szene mit Krümel.
   Die Übungsküche (app.js) enthält nur, was schon ausgepackt ist.
   Inhalte: advent.js · Zeichnungen: kekse.js
   Testmodus: #test → alle Türchen offen, alles ausgepackt · #test&tag=5 → so tun, als wäre der 5. Dezember (echtes Auspacken)
   Spielstand: save.cal = {active, welcomed, days: {Tag: {opened, done: {spiel: Anzahl}, special: Sterne, kette: erledigte Teile, cur, finished, gefeiert}}} */
const Kalender = (() => {
const PLAN = ADVENT;
// Türchen-Anordnung wie ein echter Kalender (durcheinander)
const ORDER = [13, 6, 21, 2, 17, 9, 24, 11, 4, 19, 1, 15, 8, 22, 5, 12, 18, 3, 23, 10, 16, 7, 20, 14];
// Lied des Tages – passend zum Datum (Nikolaus, Heiligabend …)
const SONG_DAYS = [null, 'Macht hoch die Tür', 'Alle Jahre wieder', 'Kling, Glöckchen, klingelingeling', 'Es kommt ein Schiff geladen',
  'Leise rieselt der Schnee', 'Lasst uns froh und munter sein', 'O Tannenbaum', 'Jingle Bells', 'O du fröhliche', 'Kommet, ihr Hirten',
  'We Wish You a Merry Christmas', 'Süßer die Glocken nie klingen', 'Zu Bethlehem geboren', 'Deck the Halls', 'Ihr Kinderlein kommet',
  'Good King Wenceslas', 'Es ist ein Ros entsprungen', 'We Three Kings', 'Morgen kommt der Weihnachtsmann', 'Joy to the World',
  'Herbei, o ihr Gläubigen', 'Tochter Zion, freue dich', 'Es ist ein Ros entsprungen', 'Stille Nacht, heilige Nacht'];
const songOfDay = d => MELODIES.find(m => m.name === SONG_DAYS[d]) || MELODIES[d % MELODIES.length];

let api;
const cal = () => save.cal || (save.cal = {active: null, days: {}});
const day = d => cal().days[d] || (cal().days[d] = {opened: false, done: {}, finished: false});
const SIM = (() => { const m = /tag=(\d+)/.exec(location.hash + location.search); return TEST && m ? Math.min(24, Math.max(0, +m[1])) : null; })();
function today() { const n = new Date(); if (SIM !== null) return {y: n.getFullYear(), m: SIM ? 12 : 11, d: SIM || 28}; return {y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate()}; }
const ALLES = TEST && SIM === null; // reiner Testmodus: alles offen
function unlocked(d) { if (ALLES) return true; const t = today(); return t.m === 12 && t.d >= d; }
function daysUntilAdvent() { const t = new Date(), s = new Date(t.getFullYear(), 11, 1); return Math.max(1, Math.ceil((s - t) / 864e5)); }
const maxOpened = () => { let m = 0; for (let d = 1; d <= 24; d++) if (cal().days[d] && cal().days[d].opened) m = d; return m; };
// Ausgepackt ist alles, was ein Türchen bis zum höchsten geöffneten Türchen bringt (verpasste Türchen blockieren nichts)
function has(id) { if (ALLES) return true; const m = maxOpened(); for (let d = 1; d <= m; d++) if (PLAN[d].neu.ids.includes(id)) return true; return false; }
Feat.has = has;
const ready = g => g === 'kette' || !!gameById(g);
function kerzen() { const t = today(); if (t.m === 12) return t.d >= 20 ? 4 : t.d >= 13 ? 3 : t.d >= 6 ? 2 : 1; return t.m === 11 && t.d >= 29 ? 1 : 0; }
const tasksOf = d => PLAN[d].tasks.filter(([g]) => ready(g));
const specialParts = d => { const sp = PLAN[d].special; return sp.game === 'kette' ? sp.spec.parts.filter(p => ready(p.game)) : (ready(sp.game) ? [sp] : []); };
const specialDone = d => { const st = day(d), n = specialParts(d).length; return !n || (PLAN[d].special.game === 'kette' ? (st.kette || 0) >= n : (st.special || 0) > 0); };
const finished = d => tasksOf(d).every(([g, n]) => (day(d).done[g] || 0) >= n) && specialDone(d);
const cookiesHave = () => { const o = []; for (let d = 1; d <= 24; d++) if (cal().days[d] && cal().days[d].finished) o.push(d); return o; };
const gameById = id => Spiele[id];

function showGrid(a) {
  api = a; cal().active = null; persist();
  const t = today(), m = maxOpened(), n = cookiesHave().length;
  const head = (t.m === 12 || ALLES) ? '' : `<p class="cal-note">Noch ${daysUntilAdvent()} ${daysUntilAdvent() === 1 ? 'Tag' : 'Tage'} – dann öffnet sich das erste Türchen und die Backstube erwacht.</p>`;
  api.screen.innerHTML = `<div class="szene-box">${Art.szene(ALLES ? 24 : m, kerzen(), {dose: n})}</div>${head}<div class="doors">${ORDER.map(d => {
    const st = day(d), open = unlocked(d);
    return `<button class="door${st.opened ? ' opened' : ''}${st.finished ? ' finished' : ''}${open ? '' : ' locked'}" data-d="${d}" aria-label="Türchen ${d}${open ? '' : ' (noch zu)'}">
      ${st.finished ? `<span class="door-cookie">${Art.cookie(PLAN[d].cookie, 40)}</span>` : ''}<span class="num">${d}</span></button>`;
  }).join('')}</div>
  <div class="cal-foot">${anyGame() ? '<button class="btn" id="toBackstube">Übungsküche</button>' : ''}<button class="btn" id="dose">Plätzchendose (${n}/24)</button>${has('rezepte') ? `<button class="btn" id="myRecipes">Meine Rezepte (${unlockedRecipes().length})</button>` : ''}</div>
  <div class="cal-foot small"><button class="btn small" id="backup">Spielstand sichern</button><button class="btn small" id="install">Als App aufs Handy</button><button class="btn small" id="wieGehts">So funktioniert’s</button>${TEST ? '<button class="btn small bad" id="testReset">Teststand zurücksetzen</button>' : ''}</div>`;
  api.screen.querySelector('.doors').onclick = e => {
    const b = e.target.closest('.door'); if (!b) return; const d = +b.dataset.d;
    if (!unlocked(d)) { Snd.nope(); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); api.toast(`Türchen ${d} öffnet sich am ${d}. Dezember.`); return; }
    Snd.tap(); openDay(d);
  };
  if ($('toBackstube')) $('toBackstube').onclick = () => api.hub();
  $('dose').onclick = showDose;
  if ($('myRecipes')) $('myRecipes').onclick = showRecipes;
  $('backup').onclick = showBackup;
  $('install').onclick = showInstall;
  $('wieGehts').onclick = showHowTo;
  if ($('testReset')) $('testReset').onclick = () => { if ($('testReset').dataset.armed) { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); } else { $('testReset').dataset.armed = 1; $('testReset').textContent = 'Wirklich? Nochmal tippen'; } };
  api.setTitle('Dein Adventskalender');
}
const anyGame = () => Object.keys(Spiele).some(id => has('game:' + id));
function showHowTo() {
  api.help('So funktioniert dein Adventskalender', `<div class="howto-k">${Art.kruemel(84)}</div>
    <p><b>Jedes Türchen packt etwas Neues aus:</b> ein neues Spiel oder eine neue Wendung, ein besonderes Tagesrätsel ★ und ein Stück Geschichte mit Krümel.</p>
    <p><b>Schaffst du das Tagesmenü</b>, bekommst du ein Plätzchen für deine Dose, das Lied des Tages – und an manchen Tagen ein Rezept.</p>
    <p><b>In der Übungsküche</b> kannst du alles, was schon ausgepackt ist, so lange spielen, wie du magst. Die Level werden dabei langsam kniffliger.</p>
    <p class="soft">Verpasste Türchen kannst du jederzeit nachholen.</p>`);
}
function showRecipes() {
  const list = unlockedRecipes();
  api.help('Meine Rezepte', list.length
    ? `<p>Diese Rezepte hast du im Adventskalender gesammelt:</p><div class="rz-index">${list.map(id => `<button class="btn" data-recipe="${id}">${RECIPES[id].title}</button>`).join('')}</div>`
    : '<p>Noch keine Rezepte – sie warten hinter einigen Türchen.</p>');
  $('helpBody').onclick = e => { const b = e.target.closest('[data-recipe]'); if (b) showRecipe(b.dataset.recipe); };
}
function showDose() {
  const got = new Set(cookiesHave());
  api.help('Deine Plätzchendose', `<p>${got.size ? `${got.size} von 24 Plätzchen gesammelt.` : 'Noch leer – hinter jedem Türchen wartet ein Plätzchen.'} Tippe ein Plätzchen an.</p>
    <div class="dose">${[...Array(24)].map((_, i) => { const d = i + 1, c = PLAN[d].cookie;
      return got.has(d) ? `<button class="dose-fach voll" data-c="${d}" aria-label="${COOKIES[c].name}">${Art.cookie(c, 52)}</button>` : `<span class="dose-fach"><span>${d}</span></span>`; }).join('')}</div>
    <p class="dose-text" id="doseText"></p>`);
  $('helpBody').onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; const c = COOKIES[PLAN[+b.dataset.c].cookie]; Snd.tap(1.2); $('doseText').innerHTML = `<b>${c.name}</b> (Türchen ${b.dataset.c}) – ${c.text}`; };
}

function openDay(d) {
  const st = day(d), first = !st.opened; st.opened = true; cal().active = d;
  st.finished = finished(d); persist();
  const p = PLAN[d], song = songOfDay(d);
  if (!cal().welcomed) { cal().welcomed = true; persist(); setTimeout(showHowTo, 600); }
  else if (first) { Snd.stop(); playSong(song, true); }
  const rows = tasksOf(d).map(([g, n]) => {
    const k = Math.min(st.done[g] || 0, n), ok = k >= n;
    return `<div class="task${ok ? ' ok' : ''}"><span class="t-name">${GAME_NAMES[g]}${p.neu.ids.includes('game:' + g) ? ' <span class="neu">neu</span>' : ''}</span><span class="t-count">${k}/${n} Level</span>
      ${ok ? '<span class="t-ok">✓</span>' : `<button class="btn small red" data-go="${g}">Los</button>`}</div>`;
  }).join('');
  const parts = specialParts(d), kette = p.special.game === 'kette', sdone = specialDone(d);
  const kdone = kette ? Math.min(st.kette || 0, parts.length) : 0;
  const srow = parts.length ? `<div class="task special${sdone ? ' ok' : ''}"><span class="t-name">★ Tagesrätsel: ${p.special.title}${kette ? `<br><span class="soft">${parts.map((q, i) => `${i < kdone ? '✓' : i + 1 + '.'} ${GAME_NAMES[q.game]}`).join(' · ')}</span>` : `<br><span class="soft">${GAME_NAMES[p.special.game]}</span>`}</span>
      ${sdone ? `<span class="t-ok">${kette ? '✓' : '★'.repeat(st.special || 1)}</span>` : `<button class="btn small red" data-special="${kette ? kdone : 0}">Los</button>`}</div>` : '';
  const neuGame = p.neu.ids.find(x => x.startsWith('game:'));
  const bald = neuGame && !ready(neuGame.slice(5)) ? `<p class="soft">${SPIELE_BALD}</p>` : '';
  api.screen.innerHTML = `<div class="dayview">
      <div class="day-head"><span class="day-num">${d}</span><div><b>${d}. Dezember</b><br><span class="soft">Lied des Tages: „${song.name}“</span></div></div>
      <div class="story">${Art.kruemel(64, first ? 'staunen' : 'froh')}<p>${p.story}</p></div>
      <div class="neu-box"><b>Heute neu: ${p.neu.title}</b><p>${p.neu.text}</p>${bald}</div>
      <h3 class="menu-h">Tagesmenü</h3>
      <div class="tasks">${rows}${srow}</div>
      <div class="reward" id="reward">${st.finished ? rewardHTML(d) : rewardTeaser(d)}</div>
      <div class="cal-foot"><button class="btn" id="toGrid">‹ Alle Türchen</button><button class="btn" id="playSong">♪ Lied anhören</button></div>
    </div>`;
  api.screen.querySelector('.tasks').onclick = e => {
    const b = e.target.closest('[data-go],[data-special]'); if (!b) return; Snd.tap();
    if (b.dataset.go) api.play(b.dataset.go);
    else { const i = +b.dataset.special, q = parts[i], spec = q.spec && q.spec.song === 'day' ? Object.assign({}, q.spec, {song: song.name}) : q.spec;
      api.special({day: d, part: kette ? i : null, game: q.game, spec, title: p.special.title + (kette ? ` (${i + 1}/${parts.length})` : '')}); }
  };
  $('toGrid').onclick = () => showGrid(api);
  $('reward').onclick = e => { const b = e.target.closest('[data-recipe]'); if (b) showRecipe(b.dataset.recipe); if (e.target.closest('[data-dose]')) showDose(); };
  $('playSong').onclick = () => { Snd.stop(); if (!Snd.on) Snd.toggle(); playSong(song); };
  if (st.finished && !st.gefeiert) { st.gefeiert = true; persist(); const r = $('reward'); r.classList.add('feiern'); Snd.stop(); setTimeout(() => playSong(song), 500); }
  api.setTitle(`Türchen ${d}`);
}
function playSong(song, kurz) { const n = kurz ? song.notes.slice(0, 24) : song.notes; if (song.voices && !kurz) Snd.choir(song.voices, .2, song.style); else Snd.phrase(n, song.style || 'bell', .19); }
function rewardTeaser(d) {
  const r = PLAN[d].recipe;
  return `<span class="soft">Schaffst du das ganze Tagesmenü, bekommst du ein <b>Plätzchen für deine Dose</b>${r ? ', ein <b>Rezept</b>' : ''} und das Lied des Tages.</span>`;
}
function rewardHTML(d) {
  const p = PLAN[d], c = COOKIES[p.cookie], rz = p.recipe && RECIPES[p.recipe];
  return `<div class="reward-cookie">${Art.cookie(p.cookie, 96)}</div><b>${c.name}</b><br><span class="soft">${c.text}</span>
    <div class="reward-btns"><button class="btn small" data-dose="1">Zur Plätzchendose</button>${rz && !rz.platzhalter ? `<button class="btn small red" data-recipe="${p.recipe}">Rezept: ${rz.title}</button>` : ''}</div>`;
}
const unlockedRecipes = () => PLAN.map((p, d) => p && p.recipe && day(d).finished ? p.recipe : null).filter(id => id && RECIPES[id] && !RECIPES[id].platzhalter);
function showBackup() {
  api.help('Spielstand sichern', `<p>Dein Fortschritt liegt nur in diesem Browser. Kopiere den Code und heb ihn auf – zum Beispiel als Notiz oder Nachricht an dich selbst. Damit holst du alles zurück, auch auf einem neuen Handy.</p>
    <textarea class="code" id="bkCode" readonly rows="4"></textarea>
    <div class="dlg-btns"><button class="btn red" id="bkCopy">Code kopieren</button></div>
    <h3>Spielstand zurückholen</h3>
    <p class="soft">Code hier einfügen. Achtung: Der jetzige Spielstand auf diesem Gerät wird dabei ersetzt.</p>
    <textarea class="code" id="bkIn" rows="3" placeholder="ABS1-…"></textarea>
    <p class="bk-msg" id="bkMsg" role="status"></p>
    <div class="dlg-btns"><button class="btn" id="bkLoad">Zurückholen</button></div>`);
  const ta = $('bkCode'); ta.value = Backup.code();
  $('bkCopy').onclick = async () => {
    let ok = false;
    try { await navigator.clipboard.writeText(ta.value); ok = true; } catch (e) { try { ta.focus(); ta.select(); ok = document.execCommand('copy'); } catch (e2) {} }
    $('bkCopy').textContent = ok ? 'Kopiert ✓' : 'Bitte von Hand markieren und kopieren';
  };
  let armed = false;
  $('bkIn').oninput = () => { armed = false; $('bkLoad').textContent = 'Zurückholen'; $('bkMsg').textContent = ''; };
  $('bkLoad').onclick = () => {
    const r = Backup.read($('bkIn').value);
    if (!r.ok) { Snd.nope(); $('bkMsg').textContent = r.why; return; }
    const g = r.save, n = Object.values((g.cal && g.cal.days) || {}).filter(x => x.finished).length;
    if (!armed) { armed = true; $('bkLoad').textContent = 'Ja, ersetzen'; $('bkMsg').textContent = `Code in Ordnung: ${n} ${n === 1 ? 'Türchen' : 'Türchen'} geschafft. Nochmal tippen zum Ersetzen.`; return; }
    if (Backup.restore($('bkIn').value).ok) location.reload();
  };
}
function showInstall() {
  const iOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  api.help('Als App aufs Handy', iOS
    ? `<p>So liegt die Backstube wie eine App auf deinem Startbildschirm:</p><ol><li>Diese Seite in <b>Safari</b> öffnen.</li><li>Unten auf <b>Teilen</b> tippen (Kästchen mit Pfeil nach oben).</li><li><b>Zum Home-Bildschirm</b> wählen und „Hinzufügen“ tippen.</li></ol><p class="soft">Wichtig: Die App auf dem Startbildschirm hat einen eigenen Speicher. Wenn du schon im Browser gespielt hast, nimm deinen Spielstand mit „Spielstand sichern“ mit.</p>`
    : `<p>So liegt die Backstube wie eine App auf deinem Startbildschirm:</p><ol><li>Diese Seite in <b>Chrome</b> öffnen.</li><li>Oben rechts auf die <b>drei Punkte</b> tippen.</li><li><b>Zum Startbildschirm hinzufügen</b> (oder „App installieren“) wählen.</li></ol>`);
}

function showRecipe(id) {
  api.help(RECIPES[id].title, recipeHTML(id) + '<p><button class="btn small" id="rzCopy">Rezept kopieren</button> <span class="soft" id="rzMsg"></span></p>');
  $('helpBody').onclick = null;
  $('rzCopy').onclick = () => {
    const r = RECIPES[id], txt = `${r.title} (${r.menge})\n\nZutaten:\n${r.zutaten.map(z => '- ' + z.replace(/<[^>]+>/g, '')).join('\n')}\n\nZubereitung:\n${r.schritte.map((s, i) => (i + 1) + '. ' + s).join('\n')}\n\nTipp: ${r.tipp}\nExperiment: ${r.experiment}`;
    navigator.clipboard?.writeText(txt).then(() => { $('rzMsg').textContent = 'Kopiert!'; }, () => { $('rzMsg').textContent = 'Kopieren hat nicht geklappt.'; });
  };
}
// von app.js nach jedem gewonnenen Level (Übungsküche oder Türchen) aufgerufen
function onWin(game) {
  const d = cal().active; if (!d) return null;
  const st = day(d); const need = tasksOf(d).find(([g]) => g === game); if (!need) return null;
  st.done[game] = (st.done[game] || 0) + 1;
  return progressMsg(d);
}
function onSpecialWin(sp, stars) {
  const st = day(sp.day);
  if (sp.part !== null && sp.part !== undefined) st.kette = Math.max(st.kette || 0, sp.part + 1);
  else st.special = Math.max(st.special || 0, stars);
  st.cur = null;
  return progressMsg(sp.day);
}
function progressMsg(d) {
  const st = day(d), was = st.finished; st.finished = finished(d); persist();
  if (st.finished && !was) return `Türchen ${d} geschafft – dein Plätzchen wartet!`;
  const left = tasksOf(d).filter(([g, n]) => (st.done[g] || 0) < n).length + (specialDone(d) ? 0 : 1);
  return left ? `Noch ${left} ${left === 1 ? 'Aufgabe' : 'Aufgaben'} für Türchen ${d}.` : null;
}
const specialCur = (sp, o) => { const st = day(sp.day); if (o === undefined) return st.cur && st.cur.part === sp.part ? st.cur.s : null; st.cur = o ? {part: sp.part, s: o} : null; persist(); };
return {showGrid, openDay, onWin, onSpecialWin, specialCur, has, get active() { return cal().active; }, PLAN,
  _test: {PLAN, ORDER, songOfDay, SONG_DAYS, finished, has, tasksOf, specialParts}};
})();
