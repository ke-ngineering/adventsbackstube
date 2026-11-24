/* Adventskalender: 24 Türchen, jedes ab dem jeweiligen Dezembertag (lokales Datum) zu öffnen.
   Hinter jedem Türchen: Tagesmenü (Aufgaben aus den Stationen), Lied des Tages, Belohnung (Rezept / Lied / Nachricht).
   Verpasste Tage können nachgeholt werden. Im Testmodus (#test) sind alle Türchen offen.
   Spielstand: save.cal = {active: Tag|null, days: {Tag: {opened, done: {station: Anzahl}, finished}}} */
const Kalender = (() => {
// Tagesplan: je Tag Aufgaben [Station, Anzahl Level] und Belohnung.
// Stationen: regal = Vorratsregal, blech = Glasur-Blech, spritz = Spritzbeutel, buch = Omas Rezeptbuch
const PLAN = [null,
  {tasks: [['regal', 2], ['blech', 1]], reward: {type: 'welcome'}},
  {tasks: [['spritz', 1], ['regal', 2]]},
  {tasks: [['buch', 1], ['regal', 2], ['blech', 1]], reward: {type: 'recipe', id: 'vanillekipferl'}},
  {tasks: [['blech', 2], ['spritz', 1]]},
  {tasks: [['regal', 2], ['buch', 1], ['spritz', 1]]},
  {tasks: [['regal', 2], ['blech', 1], ['spritz', 1]], reward: {type: 'recipe', id: 'braune-kuchen'}, special: 'Nikolaus'},
  {tasks: [['blech', 2], ['buch', 1]]},
  {tasks: [['spritz', 2], ['regal', 2]]},
  {tasks: [['regal', 3], ['blech', 1]]},
  {tasks: [['buch', 2], ['spritz', 1], ['regal', 1]], reward: {type: 'recipe', id: 'elisenlebkuchen'}},
  {tasks: [['blech', 2], ['regal', 2]]},
  {tasks: [['spritz', 2], ['buch', 1]]},
  {tasks: [['regal', 2], ['blech', 2]], reward: {type: 'recipe', id: 'franzbroetchen'}},
  {tasks: [['spritz', 1], ['buch', 1], ['regal', 2]]},
  {tasks: [['blech', 2], ['spritz', 2]]},
  {tasks: [['regal', 3], ['buch', 1]]},
  {tasks: [['blech', 2], ['regal', 2]], reward: {type: 'recipe', id: 'auszogne'}},
  {tasks: [['spritz', 2], ['blech', 1]]},
  {tasks: [['buch', 2], ['regal', 2]]},
  {tasks: [['regal', 2], ['blech', 2], ['spritz', 1]], reward: {type: 'recipe', id: 'rote-gruetze'}},
  {tasks: [['blech', 2], ['buch', 1]]},
  {tasks: [['spritz', 2], ['regal', 2]]},
  {tasks: [['regal', 2], ['blech', 2], ['buch', 1]]},
  {tasks: [['regal', 1], ['blech', 1], ['spritz', 1], ['buch', 1]], reward: {type: 'recipe', id: 'heiligabend'}, special: 'Heiligabend'},
];
const STATIONS = {regal: 'Vorratsregal', blech: 'Glasur-Blech', spritz: 'Spritzbeutel', buch: 'Omas Rezeptbuch'};
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
function today() { const n = new Date(); return {y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate()}; }
function unlocked(d) { if (TEST) return true; const t = today(); return t.m === 12 && t.d >= d; }
function daysUntilAdvent() { const t = new Date(), s = new Date(t.getFullYear(), 11, 1); return Math.ceil((s - t) / 864e5); }
const finished = d => PLAN[d].tasks.every(([st, n]) => (day(d).done[st] || 0) >= n);

function showGrid(a) {
  api = a; cal().active = null; persist();
  const t = today();
  const head = (t.m === 12 || TEST) ? '' : `<p class="cal-note">Noch ${daysUntilAdvent()} ${daysUntilAdvent() === 1 ? 'Tag' : 'Tage'} bis zum ersten Türchen – bis dahin kannst du in der Backstube schon üben.</p>`;
  api.screen.innerHTML = `${head}<div class="doors">${ORDER.map(d => {
    const st = day(d), open = unlocked(d);
    return `<button class="door${st.opened ? ' opened' : ''}${st.finished ? ' finished' : ''}${open ? '' : ' locked'}" data-d="${d}" aria-label="Türchen ${d}${open ? '' : ' (noch zu)'}">
      <span class="num">${d}</span>${st.finished ? '<span class="tick">★</span>' : ''}</button>`;
  }).join('')}</div>
  <div class="cal-foot"><button class="btn" id="toBackstube">Zur Backstube (frei spielen)</button><button class="btn" id="myRecipes">Meine Rezepte (${unlockedRecipes().length})</button></div>
  <div class="cal-foot small"><button class="btn small" id="backup">Spielstand sichern</button><button class="btn small" id="install">Als App aufs Handy</button></div>`;
  api.screen.querySelector('.doors').onclick = e => {
    const b = e.target.closest('.door'); if (!b) return; const d = +b.dataset.d;
    if (!unlocked(d)) { Snd.nope(); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); api.toast(`Türchen ${d} öffnet sich am ${d}. Dezember.`); return; }
    Snd.tap(); openDay(d);
  };
  $('toBackstube').onclick = () => api.hub();
  $('myRecipes').onclick = () => {
    const list = unlockedRecipes();
    api.help('Meine Rezepte', list.length
      ? `<p>Diese Rezepte hast du im Adventskalender freigeschaltet:</p><div class="rz-index">${list.map(id => `<button class="btn" data-recipe="${id}">${RECIPES[id].title}</button>`).join('')}</div>`
      : '<p>Noch keine Rezepte – das erste wartet hinter Türchen 3.</p>');
    $('helpBody').onclick = e => { const b = e.target.closest('[data-recipe]'); if (b) showRecipe(b.dataset.recipe); };
  };
  $('backup').onclick = showBackup;
  $('install').onclick = showInstall;
  api.setTitle('Dein Adventskalender');
}
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
function openDay(d) {
  const st = day(d), first = !st.opened; st.opened = true; cal().active = d; persist();
  const p = PLAN[d], song = songOfDay(d);
  if (first) { Snd.stop(); Snd.phrase(song.notes.slice(0, 24), 'bell', .19); }
  const rows = p.tasks.map(([s, n]) => {
    const k = Math.min(st.done[s] || 0, n), ok = k >= n;
    return `<div class="task${ok ? ' ok' : ''}"><span class="t-name">${STATIONS[s]}</span><span class="t-count">${k}/${n} ${n === 1 ? 'Level' : 'Level'}</span>
      ${ok ? '<span class="t-ok">✓</span>' : `<button class="btn small red" data-go="${s}">Los</button>`}</div>`;
  }).join('');
  api.screen.innerHTML = `<div class="dayview">
      <div class="day-head"><span class="day-num">${d}</span><div><b>${p.special ? p.special : d + '. Dezember'}</b><br><span class="soft">Lied des Tages: „${song.name}“</span></div></div>
      <div class="tasks">${rows}</div>
      <div class="reward" id="reward">${st.finished ? rewardHTML(d) : rewardTeaser(d)}</div>
      <div class="cal-foot"><button class="btn" id="toGrid">‹ Alle Türchen</button><button class="btn" id="playSong">♪ Lied anhören</button></div>
    </div>`;
  api.screen.querySelector('.tasks').onclick = e => { const b = e.target.closest('[data-go]'); if (b) { Snd.tap(); api.play(b.dataset.go); } };
  $('toGrid').onclick = () => showGrid(api);
  $('reward').onclick = e => { const b = e.target.closest('[data-recipe]'); if (b) showRecipe(b.dataset.recipe); };
  $('playSong').onclick = () => { Snd.stop(); if (!Snd.on) Snd.toggle(); song.voices ? Snd.choir(song.voices, .2) : Snd.phrase(song.notes, 'brass', .2); };
  api.setTitle(`Türchen ${d}`);
}
function rewardTeaser(d) {
  const r = PLAN[d].reward;
  return `<span class="soft">${r ? (r.type === 'recipe' ? 'Wenn alle Aufgaben geschafft sind, wartet heute ein <b>Rezept</b> auf dich.' : 'Heute wartet eine kleine Überraschung.') : 'Schaffe alle Aufgaben, dann leuchtet dein Stern im Kalender.'}</span>`;
}
function rewardHTML(d) {
  const r = PLAN[d].reward;
  if (!r) return '<b>★ Türchen geschafft!</b> Dein Stern leuchtet im Kalender.';
  if (r.type === 'welcome') return '<b>★ Willkommen in deiner Adventsbackstube!</b> Ab jetzt öffnet sich jeden Tag ein neues Türchen.';
  if (r.type === 'recipe') { const rz = RECIPES[r.id];
    return rz && !rz.platzhalter ? `<b>★ Rezept freigeschaltet: ${rz.title}</b><br><button class="btn small red" data-recipe="${r.id}">Rezept ansehen</button>` : '<b>★ Geschafft!</b> Das Rezept für heute folgt in Kürze.'; }
  return '<b>★ Geschafft!</b>';
}
const unlockedRecipes = () => PLAN.map((p, d) => p && p.reward && p.reward.type === 'recipe' && day(d).finished ? p.reward.id : null).filter(id => id && RECIPES[id] && !RECIPES[id].platzhalter);
function showRecipe(id) {
  api.help(RECIPES[id].title, recipeHTML(id) + '<p><button class="btn small" id="rzCopy">Rezept kopieren</button> <span class="soft" id="rzMsg"></span></p>');
  $('helpBody').onclick = null;
  $('rzCopy').onclick = () => {
    const r = RECIPES[id], txt = `${r.title} (${r.menge})\n\nZutaten:\n${r.zutaten.map(z => '- ' + z.replace(/<[^>]+>/g, '')).join('\n')}\n\nZubereitung:\n${r.schritte.map((s, i) => (i + 1) + '. ' + s).join('\n')}\n\nTipp: ${r.tipp}\nExperiment: ${r.experiment}`;
    navigator.clipboard?.writeText(txt).then(() => { $('rzMsg').textContent = 'Kopiert!'; }, () => { $('rzMsg').textContent = 'Kopieren hat nicht geklappt.'; });
  };
}
// von app.js nach jedem gewonnenen Level aufgerufen
function onWin(station) {
  const d = cal().active; if (!d) return null;
  const st = day(d); const need = PLAN[d].tasks.find(([s]) => s === station); if (!need) return null;
  st.done[station] = (st.done[station] || 0) + 1;
  const was = st.finished; st.finished = finished(d); persist();
  if (st.finished && !was) return `Türchen ${d} geschafft!`;
  const left = PLAN[d].tasks.filter(([s, n]) => (st.done[s] || 0) < n).length;
  return left ? `Noch ${left} ${left === 1 ? 'Aufgabe' : 'Aufgaben'} für Türchen ${d}.` : null;
}
return {showGrid, openDay, onWin, get active() { return cal().active; }, PLAN, _test: {PLAN, ORDER, songOfDay, SONG_DAYS}};
})();
