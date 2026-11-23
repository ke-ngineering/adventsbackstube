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

// Beim Öffnen dort weitermachen, wo sie aufgehört hat
if (save.last && GAMES.some(g => g.id === save.last)) open(save.last); else showHub();
}
