/* Adventsbackstube – gemeinsame Grundlagen: Spielstand, Zutaten, Klang, Melodien, Hilfsfunktionen.
   Wird von allen Spiel-Modulen (regal.js, blech.js, buch.js) und app.js genutzt. */
const VERSION = 'v15';
const TEST = /(^|[#?&])test/.test(location.hash + location.search);
const $ = id => document.getElementById(id);
const wait = ms => new Promise(r => setTimeout(r, ms));
function rng(seed) { return () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(a, r) { for (let i = a.length - 1; i > 0; i--) { const k = Math.floor(r() * (i + 1)); [a[i], a[k]] = [a[k], a[i]]; } return a; }

const dots = (c, s = 10) => `radial-gradient(circle at 30% 40%, ${c} 1.4px, transparent 2px) 0 0/${s}px ${s}px`;
const ING = [
  {name:'Kakao',     kind:'powder', c:'#5a3420', bg:dots('rgba(255,255,255,.18)', 9)},
  {name:'Kirschen',  kind:'chunk', shape:'round', c:'#c62f3d', bg:'radial-gradient(circle at 70% 30%, rgba(255,255,255,.35) 2px, transparent 3px) 0 0/16px 14px'},
  {name:'Honig',     kind:'liquid', c:'#e8a317', bg:'linear-gradient(100deg, transparent 40%, rgba(255,255,255,.35) 46%, transparent 54%)'},
  {name:'Mandeln',   kind:'chunk', shape:'oval', c:'#d8b48a', bg:'radial-gradient(ellipse 4px 2.5px at 50% 50%, #a9794e 90%, transparent) 0 0/13px 11px'},
  {name:'Pistazien', kind:'chunk', shape:'small', c:'#8fb35a', bg:dots('rgba(40,70,20,.35)', 8)},
  {name:'Zucker',    kind:'grain', c:'#fbf7ef', bg:dots('rgba(180,170,150,.6)', 7)},
  {name:'Zimt',      kind:'powder', c:'#a8582b', bg:'repeating-linear-gradient(135deg, rgba(0,0,0,.12) 0 3px, transparent 3px 8px)'},
  {name:'Mohn',      kind:'grain', c:'#3d4a6b', bg:dots('rgba(255,255,255,.28)', 6)},
  {name:'Orangeat',  kind:'chunk', shape:'cube', c:'#ef7d22', bg:'repeating-linear-gradient(90deg, rgba(255,255,255,.2) 0 4px, transparent 4px 10px)'},
  {name:'Rosinen',   kind:'chunk', shape:'oval', c:'#6a2b52', bg:'radial-gradient(ellipse 3.5px 2.5px at 50% 50%, rgba(0,0,0,.35) 90%, transparent) 0 0/11px 9px'},
  {name:'Marzipan',  kind:'chunk', shape:'cube', c:'#f2b8b0', bg:'repeating-linear-gradient(0deg, rgba(255,255,255,.3) 0 2px, transparent 2px 7px)'},
  {name:'Lavendel',  kind:'grain', c:'#8e78c4', bg:'repeating-linear-gradient(45deg, rgba(255,255,255,.22) 0 2px, transparent 2px 6px)'},
];
const TIPS = [
  'Butter für Mürbeteig kalt verarbeiten – dann wird er schön mürbe.',
  'Plätzchenteig vor dem Ausstechen mindestens 30 Minuten kühlen.',
  'Vanillekipferl noch warm in Vanillezucker wälzen, dann haftet er besser.',
  'Zimtsterne bei niedriger Temperatur backen, damit die Eiweißglasur weiß bleibt.',
  'Hart gewordene Lebkuchen werden mit einem Apfelstück in der Dose wieder weich.',
  'Eiweiß wird nur in einer völlig fettfreien Schüssel richtig steif.',
];
const layerStyle = x => `background:${ING[x].bg},${ING[x].c}`;

/* ---- Spielstand (localStorage) ----
   Vorratsregal (id 'regal') nutzt aus Kompatibilitätsgründen die obersten Felder (level, best, cur),
   weitere Spiele liegen unter save.games[id] = {level, best, cur}. */
const KEY = 'adventsbackstube.v1';
let save = {level:1, best:{}};
try { const st = JSON.parse(localStorage.getItem(KEY)); if (st && st.level) save = Object.assign(save, st); } catch (e) {}
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {} };
function prog(id) {
  if (id === 'regal') return save;
  if (!save.games) save.games = {};
  return save.games[id] || (save.games[id] = {level:1, best:{}});
}
const starsOf = p => Object.values(p.best || {}).reduce((a, b) => a + b, 0);
const totalStars = () => starsOf(save) + Object.values(save.games || {}).reduce((a, g) => a + starsOf(g), 0);

/* ---- Klang: Geräusche synthetisch (Web Audio), keine Dateien ---- */
const Snd = (() => {
  let ctx = null, master = null, on = save.sound !== false, playing = [];
  const ensure = () => {
    if (!on) return null;
    try {
      // iPhone/iPad: Ton auch bei Stummschalter abspielen (Safari 16.4+), sonst bleibt Web Audio stumm
      const iOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      try { if (iOS && navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch (e) {}
      if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = .7; master.connect(ctx.destination); }
      if (ctx.state !== 'running') { const pr = ctx.resume(); if (pr && pr.catch) pr.catch(() => {}); } // WebKit kennt auch 'interrupted'
    } catch (e) { return null; }
    return ctx;
  };
  // Beim ersten Antippen irgendwo: Ton freischalten (stiller Puffer) – hilft Safari/iOS
  let unlocked = false;
  const unlock = () => {
    const c = ensure(); if (!c) return;
    if (!unlocked) { try { const b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); unlocked = true; } catch (e) {} }
  };
  ['touchend', 'pointerup', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, unlock, {capture: true, passive: true}));
  document.addEventListener('visibilitychange', () => { if (!document.hidden && ctx && ctx.state !== 'running') ctx.resume().catch?.(() => {}); });
  const env = (g, t, a, peak, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);
  // Holzklopfen beim Antippen
  function tap(pitch = 1) {
    const c = ensure(); if (!c) return; const t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(520 * pitch, t); o.frequency.exponentialRampToValueAtTime(260 * pitch, t + .08);
    env(g, t, .004, .35, .09); o.connect(g).connect(master); o.start(t); o.stop(t + .12);
  }
  // Rieseln: Körnchen-Geräusch, wie Zucker der ins Glas fällt
  // Umfüll-Geräusche je nach Zutat: grain = rieseln, powder = leises Stäuben, liquid = Gluckern, chunk = Purzeln
  function pour(dur = .45, kind = 'grain', pieces = 4) {
    const c = ensure(); if (!c) return; const t = c.currentTime;
    if (kind === 'liquid') { // Gluckern: weiche Blasen mit fallender Tonhöhe
      for (let k = 0; k < 4; k++) {
        const o = c.createOscillator(), g = c.createGain(), s = t + k * dur / 4.5 + Math.random() * .03;
        o.type = 'sine'; o.frequency.setValueAtTime(420 - k * 40, s); o.frequency.exponentialRampToValueAtTime(180 - k * 15, s + .09);
        env(g, s, .01, .32, .1); o.connect(g).connect(master); o.start(s); o.stop(s + .16);
      }
      return;
    }
    if (kind === 'chunk') { // Purzeln: einzelne kleine Plopps
      for (let k = 0; k < pieces; k++) {
        const s = t + .04 + k * (dur / pieces) + Math.random() * .04;
        const o = c.createOscillator(), g = c.createGain(), f = 260 + Math.random() * 140;
        o.type = 'triangle'; o.frequency.setValueAtTime(f, s); o.frequency.exponentialRampToValueAtTime(f * .45, s + .07);
        env(g, s, .003, .38, .08); o.connect(g).connect(master); o.start(s); o.stop(s + .12);
      }
      return;
    }
    const fine = kind === 'powder';
    const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() < (fine ? .01 : .035) ? (Math.random() * 2 - 1) * (1 - i / len * .6) : (Math.random() * 2 - 1) * (fine ? .12 : .05);
    const src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(), vol = fine ? .35 : .7;
    src.buffer = buf; bp.type = 'bandpass'; bp.Q.value = fine ? .7 : 1.2;
    bp.frequency.setValueAtTime(fine ? 4200 : 2600, t); bp.frequency.linearRampToValueAtTime(fine ? 3000 : 1500, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .05); g.gain.setValueAtTime(vol, t + dur - .12); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp).connect(g).connect(master); src.start(t);
  }
  function nope() {
    const c = ensure(); if (!c) return; const t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain(); o.type = 'triangle';
    o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(90, t + .15);
    env(g, t, .005, .3, .16); o.connect(g).connect(master); o.start(t); o.stop(t + .2);
  }
  // Glockenspiel-Ton (für Glas-voll-Melodie)
  function bell(n, t, len) {
    const f = hz(n);
    [[1, .32], [2.76, .08], [5.4, .03]].forEach(([m, v]) => {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f * m;
      env(g, t, .005, v, Math.max(.5, len * 1.6)); o.connect(g).connect(master); o.start(t); o.stop(t + len * 1.6 + .6); playing.push(o);
    });
  }
  // Posaunenchor-Klang (für die ganze Melodie am Levelende)
  function brass(n, t, len, vol = .16) {
    const f = hz(n - 12), o = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; o2.type = 'sawtooth'; o.frequency.value = f; o2.frequency.value = f * 1.003;
    lp.type = 'lowpass'; lp.Q.value = 2; lp.frequency.setValueAtTime(f * 1.5, t); lp.frequency.linearRampToValueAtTime(f * 5, t + .08); lp.frequency.linearRampToValueAtTime(f * 3, t + len);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .06); g.gain.setValueAtTime(vol, t + Math.max(.07, len - .08)); g.gain.exponentialRampToValueAtTime(0.0001, t + len + .05);
    o.connect(lp); o2.connect(lp); lp.connect(g).connect(master); o.start(t); o2.start(t); o.stop(t + len + .1); o2.stop(t + len + .1); playing.push(o, o2);
  }
  // Mehrstimmig als Bläsersatz: jede Stimme in Originallage, Sopran etwas lauter
  function choir(voices, tempo = .2) {
    const c = ensure(); if (!c) return 0; const t0 = c.currentTime + .05; let end = 0;
    voices.forEach((v, k) => {
      let t = t0;
      for (const [n, d] of v) { if (n) brass(n + 12, t, d * tempo * .94, k === 0 ? .14 : .09); t += d * tempo; }
      end = Math.max(end, t);
    });
    return end - c.currentTime;
  }
  function phrase(notes, voice = 'bell', tempo = .17) {
    const c = ensure(); if (!c) return 0; let t = c.currentTime + .05;
    for (const [n, d] of notes) { if (n) (voice === 'brass' ? brass : bell)(n, t, d * tempo * .92); t += d * tempo; }
    return t - c.currentTime;
  }
  // einzelner Ton (Glockenspiel), z. B. beim Antippen
  function note(n, len = .35) { const c = ensure(); if (!c) return; bell(n, c.currentTime + .01, len); }
  function stop() { playing.forEach(o => { try { o.stop(); } catch (e) {} }); playing = []; }
  function toggle() { on = !on; save.sound = on; persist(); if (!on) stop(); else phrase([[72, 1], [76, 1], [79, 2]], 'bell', .14); return on; } // Einschalten spielt einen kleinen Klang zum Testen
  return {tap, pour, nope, note, phrase, choir, stop, toggle, get state() { return ctx ? ctx.state : 'noch nicht gestartet'; }, ensure, get on() { return on; }};
})();

/* ---- Melodien (gemeinfrei). [MIDI-Note, Dauer in Achteln], 60 = c', Note 0 = Pause ----
   src: Quelle der Noten. „Singen im Advent“ = gemeinfreies Liederbuch (github.com/musikpirat/singen-im-advent.github.io),
   Noten von Claude aus dem PDF abgelesen. ok:false = aus dem Gedächtnis notiert, auf #lieder prüfen lassen. */
const SIA = 'Liederbuch „Singen im Advent“';
const MELODIES = [
  {name:'Stille Nacht, heilige Nacht', src:SIA, notes:[
    [67,3],[69,1],[67,2],[64,6],[67,3],[69,1],[67,2],[64,6],[74,4],[74,2],[71,6],[72,4],[72,2],[67,6],
    [69,4],[69,2],[72,3],[71,1],[69,2],[67,3],[69,1],[67,2],[64,6],[69,4],[69,2],[72,3],[71,1],[69,2],[67,3],[69,1],[67,2],[64,6],
    [74,4],[74,2],[77,3],[74,1],[71,2],[72,6],[76,6],[72,3],[67,1],[64,2],[67,3],[65,1],[62,2],[60,12]]},
  {name:'Alle Jahre wieder', src:SIA, notes:[
    [69,3],[71,1],[69,2],[67,2],[66,4],[64,4],[62,2],[64,1],[66,1],[67,2],[66,2],[64,6],[0,2],
    [66,2],[69,2],[71,2],[69,2],[74,4],[73,2],[71,2],[69,2],[67,1],[66,1],[67,2],[69,2],[66,6],[0,2]]},
  {name:'O Tannenbaum', src:SIA, notes:[
    [60,2],[65,1.5],[65,.5],[65,3],[67,1],[69,1.5],[69,.5],[69,3],[69,1],[67,1],[69,1],[70,2],[64,2],[67,2],[65,2],[0,1],[72,1],
    [72,1],[69,1],[74,3],[72,1],[72,1],[70,1],[70,3],[70,1],[70,1],[67,1],[72,3],[70,1],[70,1],[69,1],[69,3],[60,1],
    [65,1.5],[65,.5],[65,3],[67,1],[69,1.5],[69,.5],[69,3],[69,1],[67,1],[69,1],[70,2],[64,2],[67,2],[65,4]]},
  {name:'Kling, Glöckchen, klingelingeling', src:SIA, notes:[
    [72,4],[69,2],[70,2],[72,1],[74,1],[72,1],[74,1],[72,4],[70,4],[67,2],[72,2],[69,8],
    [67,2],[67,2],[69,2],[65,2],[69,4],[67,4],[70,2],[70,2],[72,2],[67,2],[70,4],[69,4],
    [67,2],[67,2],[69,2],[71,2],[72,4],[67,4],[69,2],[74,2],[72,2],[71,2],[74,4],[72,4],
    [72,4],[69,2],[70,2],[72,1],[74,1],[72,1],[74,1],[72,4],[70,4],[67,2],[72,2],[69,8]]},
  {name:'Lasst uns froh und munter sein', src:SIA, notes:[
    [69,2],[69,2],[69,1],[71,1],[69,1],[67,1],[66,2],[66,2],[66,2],[0,2],[67,2],[67,2],[67,1],[69,1],[67,1],[66,1],[64,2],[64,2],[64,2],[0,2],
    [62,2],[64,2],[66,2],[67,2],[69,1.5],[71,.5],[69,1],[71,1],[69,4],
    [74,2],[69,2],[69,1],[71,1],[69,1],[67,1],[66,2],[64,2],[69,4],[74,2],[69,2],[69,1],[71,1],[69,1],[67,1],[66,2],[64,2],[62,4]]},
  {name:'Jingle Bells', src:SIA, notes:[
    [64,2],[64,2],[64,4],[64,2],[64,2],[64,4],[64,2],[67,2],[60,3],[62,1],[64,8],
    [65,2],[65,2],[65,3],[65,1],[65,2],[64,2],[64,2],[64,1],[64,1],[64,2],[62,2],[62,2],[64,2],[62,4],[67,4],
    [64,2],[64,2],[64,4],[64,2],[64,2],[64,4],[64,2],[67,2],[60,3],[62,1],[64,8],
    [65,2],[65,2],[65,3],[65,1],[65,2],[64,2],[64,2],[64,1],[64,1],[67,2],[67,2],[65,2],[62,2],[60,8]]},
  {name:'Ihr Kinderlein kommet', src:SIA, notes:[
    [69,1],[69,2],[66,1],[69,1],[69,2],[66,1],[69,1],[67,2],[64,1],[67,1],[66,2],[0,1],[69,1],
    [69,2],[66,1],[69,1],[69,2],[66,1],[69,1],[67,2],[64,1],[67,1],[66,2],[0,1],[66,1],
    [64,2],[64,1],[64,1],[67,2],[67,1],[67,1],[66,2],[66,1],[66,1],[71,2],[0,1],[71,1],
    [69,2],[69,1],[69,1],[74,2],[69,1],[66,1],[69,2],[67,1],[64,1],[62,3]]},
  {name:'Leise rieselt der Schnee', src:SIA, notes:[
    [69,2],[69,1],[67,1],[69,1],[67,1],[65,5],[0,1],[65,2],[62,1],[65,1],[64,1],[62,1],[60,5],[0,1],
    [67,1],[66,1],[67,1],[70,1],[69,1],[67,1],[65,5],[0,1],[67,1.5],[62,.5],[62,1],[64,1],[62,1],[64,1],[65,5],[0,1]]},
  {name:'O du fröhliche', src:SIA, notes:[
    [69,4],[71,4],[69,3],[67,1],[66,2],[67,2],[69,4],[71,4],[69,3],[67,1],[66,2],[67,2],
    [69,4],[69,4],[71,4],[73,2],[74,2],[73,4],[71,4],[69,8],
    [64,3],[66,1],[64,2],[66,2],[67,3],[69,1],[67,4],[66,3],[67,1],[66,2],[67,2],[69,3],[71,1],[69,4],
    [74,2],[73,2],[71,2],[69,2],[74,2],[71,2],[69,2],[67,2],[66,4],[64,4],[62,8]]},
  {name:'Morgen kommt der Weihnachtsmann', src:SIA, notes:[
    [60,2],[60,2],[67,2],[67,2],[69,2],[69,2],[67,4],[65,2],[65,2],[64,2],[64,2],[62,2],[62,2],[60,4],
    [67,2],[67,2],[65,2],[65,2],[64,2],[64,2],[62,4],[67,2],[67,2],[65,2],[65,2],[64,2],[64,2],[62,4],
    [60,2],[60,2],[67,2],[67,2],[69,2],[69,2],[67,4],[65,2],[65,2],[64,2],[64,2],[62,2],[62,2],[60,6]]},
  {name:'We Wish You a Merry Christmas', src:SIA, notes:[
    [69,2],[74,2],[74,1],[76,1],[74,1],[73,1],[71,2],[71,2],[71,2],[76,2],[76,1],[78,1],[76,1],[74,1],[73,2],[69,2],[69,2],
    [78,2],[78,1],[79,1],[78,1],[76,1],[74,2],[71,2],[69,1],[69,1],[71,2],[76,2],[73,2],[74,4],[69,2],
    [74,2],[74,2],[74,2],[73,4],[73,2],[74,2],[73,2],[71,2],[69,4],[76,2],
    [78,2],[76,1],[76,1],[74,1],[74,1],[81,2],[78,2],[69,1],[69,1],[71,2],[76,2],[73,2],[74,6]]},
  {name:'Süßer die Glocken nie klingen', src:SIA, notes:[
    [69,1.5],[69,.5],[69,1],[69,1],[67,1],[69,1],[72,3],[67,3],[67,1.5],[67,.5],[67,1],[67,1],[65,1],[67,1],[69,5],[0,1],
    [72,1.5],[72,.5],[72,1],[72,1],[69,1],[65,1],[77,3],[74,3],[72,1.5],[74,.5],[72,1],[72,1],[70,1],[67,1],[65,5],[0,1],
    [67,1.5],[67,.5],[67,1],[69,1],[69,1],[69,1],[72,1.5],[70,.5],[67,1],[69,3],[67,1.5],[67,.5],[67,1],[69,1],[69,1],[69,1],[72,1.5],[70,.5],[67,1],[69,3],
    [72,1.5],[70,.5],[69,1],[69,1],[67,1],[65,1],[77,3],[74,3],[72,1.5],[74,.5],[72,1],[72,1],[70,1],[67,1],[65,5],[0,1]]},
  {name:'Macht hoch die Tür', src:SIA, notes:[
    [64,2],[67,4],[65,2],[64,4],[62,2],[60,2],[62,2],[64,2],[62,4],[67,2],[65,4],[65,2],[64,4],[64,2],[62,2],[60,2],[62,2],[60,4],[64,2],
    [62,4],[62,2],[64,2],[66,2],[67,2],[67,2],[69,2],[66,2],[67,4],[62,2],[64,4],[62,2],[64,2],[66,2],[67,2],[67,2],[69,2],[66,2],[67,4],[67,2],
    [69,4],[67,2],[69,4],[67,2],[69,2],[67,2],[65,2],[64,4],[67,2],[69,4],[67,2],[69,4],[67,2],[69,2],[67,2],[65,2],[64,4],[67,2],
    [60,4],[60,2],[65,4],[64,2],[62,10],[67,2],[65,4],[64,2],[62,2],[60,2],[62,2],[60,12]]},
  // Vierstimmiger Satz (Sopran, Alt, Tenor, Bass) aus dem Liederbuch, S. 43; Form A–B–A (D.C. al Fine)
  {name:'Tochter Zion, freue dich', src:SIA, voices:[
    [[70,4],[67,3],[68,1],[70,4],[63,4],[65,1],[67,1],[68,1],[70,1],[68,2],[67,2],[65,8],[67,1],[68,1],[70,1],[72,1],[70,2],[70,2],[75,4],[70,4],[68,2],[67,2],[65,3],[63,1],[63,8],
     [67,1],[65,1],[67,1],[68,1],[67,2],[67,2],[65,4],[63,4],[68,2],[67,2],[65,2],[63,2],[62,8],[63,1],[62,1],[63,1],[65,1],[63,2],[63,2],[72,4],[69,4],[70,2],[72,1],[70,1],[69,3],[70,1],[70,8],
     [70,4],[67,3],[68,1],[70,4],[63,4],[65,1],[67,1],[68,1],[70,1],[68,2],[67,2],[65,8],[67,1],[68,1],[70,1],[72,1],[70,2],[70,2],[75,4],[70,4],[68,2],[67,2],[65,3],[63,1],[63,8]],
    [[63,4],[63,3],[62,1],[63,4],[58,4],[62,1],[63,1],[65,1],[67,1],[65,2],[63,2],[62,8],[63,6],[63,2],[63,4],[63,4],[62,2],[63,4],[62,2],[63,8],
     [63,1],[62,1],[63,1],[65,1],[63,2],[63,2],[62,4],[60,4],[65,2],[63,2],[62,2],[60,2],[59,8],[60,1],[59,1],[60,1],[62,1],[60,2],[60,2],[63,6],[63,2],[62,2],[63,1],[62,1],[60,2],[65,2],[65,8],
     [63,4],[63,3],[62,1],[63,4],[58,4],[62,1],[63,1],[65,1],[67,1],[65,2],[63,2],[62,8],[63,6],[63,2],[63,4],[63,4],[62,2],[63,4],[62,2],[63,8]],
    [[55,4],[58,3],[56,1],[55,4],[58,4],[56,2],[53,2],[58,2],[58,2],[58,8],[58,6],[58,2],[58,4],[55,4],[56,2],[56,4],[56,2],[55,8],
     [58,6],[58,2],[56,4],[55,4],[59,2],[60,2],[56,2],[55,2],[55,8],[55,6],[55,2],[53,4],[60,4],[58,2],[55,2],[60,2],[60,2],[62,8],
     [55,4],[58,3],[56,1],[55,4],[58,4],[56,2],[53,2],[58,2],[58,2],[58,8],[58,6],[58,2],[58,4],[55,4],[56,2],[56,4],[56,2],[55,8]],
    [[51,4],[55,3],[53,1],[51,4],[55,4],[53,3],[51,1],[50,2],[51,2],[46,8],[51,1],[53,1],[55,1],[56,1],[55,2],[55,2],[55,4],[51,4],[53,2],[55,1],[56,1],[58,2],[46,2],[51,8],
     [51,6],[51,2],[46,4],[48,4],[50,2],[51,2],[53,2],[48,2],[55,8],[48,6],[46,2],[45,4],[53,4],[55,2],[51,2],[53,2],[53,2],[46,8],
     [51,4],[55,3],[53,1],[51,4],[55,4],[53,3],[51,1],[50,2],[51,2],[46,8],[51,1],[53,1],[55,1],[56,1],[55,2],[55,2],[55,4],[51,4],[53,2],[55,1],[56,1],[58,2],[46,2],[51,8]]]},
  {name:'Kommet, ihr Hirten', src:SIA, notes:[
    [72,2],[72,1],[69,1],[74,1],[70,1],[72,2],[72,1],[69,1],[74,1],[70,1],[72,2],[69,1],[72,1],[67,1],[69,1],[65,6],
    [72,2],[72,1],[69,1],[74,1],[70,1],[72,2],[72,1],[69,1],[74,1],[70,1],[72,2],[69,1],[72,1],[67,1],[69,1],[65,6],
    [65,2],[69,1],[65,1],[69,1],[72,1],[65,2],[69,1],[65,1],[67,1],[60,1],[65,2],[69,1],[65,1],[69,1],[72,1],[65,2],[69,1],[65,1],[67,1],[60,1],
    [72,2],[69,1],[72,1],[67,1],[69,1],[65,6]]},
  {name:'Herbei, o ihr Gläubigen', src:SIA, notes:[
    [69,2],[69,4],[64,2],[69,2],[71,4],[64,4],[73,2],[71,2],[73,2],[74,2],[73,4],[71,2],[69,2],[69,4],[68,2],[66,2],[68,2],[69,2],[71,2],[73,2],[68,4],[66,3],[64,1],[64,8],
    [76,4],[74,2],[73,2],[74,4],[73,4],[71,2],[73,2],[69,2],[71,2],[68,3],[66,1],[64,2],[69,2],[69,2],[68,2],[69,2],[71,2],[69,4],[64,2],[73,2],
    [73,2],[71,2],[73,2],[74,2],[73,4],[71,2],[73,2],[74,2],[73,2],[71,2],[69,2],[68,4],[69,2],[74,2],[73,4],[71,3],[69,1],[69,6]]},
  {name:'Es ist ein Ros entsprungen', src:SIA, notes:[
    [72,4],[72,2],[72,2],[74,2],[72,2],[72,4],[69,4],[70,4],[69,2],[67,4],[65,4],[64,2],[65,4],[72,4],
    [72,2],[72,2],[74,2],[72,2],[72,4],[69,4],[70,4],[69,2],[67,4],[65,4],[64,2],[65,4],[0,2],[69,2],[67,2],[64,2],[65,2],[62,2],[60,4],[0,2],[72,2],
    [72,2],[72,2],[74,2],[72,2],[72,4],[69,4],[70,4],[69,2],[67,4],[65,4],[64,2],[65,8]]},
  {name:'Zu Bethlehem geboren', src:SIA, notes:[
    [60,2],[65,3],[67,1],[69,2],[67,2],[65,4],[64,2],[65,2],[67,2],[65,1],[67,1],[69,2],[67,2],[65,4],[0,2],[72,2],
    [72,2],[69,2],[70,2],[72,2],[74,4],[70,2],[70,2],[69,2],[70,2],[72,2],[70,1],[69,1],[67,6],[0,2],
    [72,4],[67,4],[69,4],[67,2],[69,1],[70,1],[72,2],[65,1],[67,1],[69,2],[67,2],[65,6]]},
  {name:'Es kommt ein Schiff geladen', src:SIA, notes:[
    [62,2],[62,4],[62,2],[64,4],[64,2],[65,2],[67,2],[69,2],[69,4],[69,2],[67,4],[67,2],[62,4],[64,2],
    [65,6],[65,2],[69,2],[72,2],[74,2],[74,2],[72,1],[70,1],[69,1],[67,1],[65,2],[67,2],[69,2],[67,2],[65,2],[64,2],[62,4]]},
  // Melodie gemeinfrei (J. H. Hopkins 1857). Vierstimmiger Satz: eigener Satz (Claude), e-Moll/G-Dur, Choralstil.
  {name:'We Three Kings', src:'Melodie geprüft mit einer MIDI-Datei (nur Melodiestimme); eigener 4-stimmiger Satz', voices:[
    [
    [71,2],[69,1],[67,2],[64,1],[66,1],[67,1],[66,1],[64,3],[71,2],[69,1],[67,2],[64,1],[66,1],[67,1],[66,1],[64,3],
    [67,2],[67,1],[69,2],[69,1],[71,2],[71,1],[74,1],[72,1],[71,1],[69,1],[71,1],[69,1],[67,2],[66,1],[64,3],
    [66,3],[69,3],[67,2],[67,1],[67,2],[62,1],[67,2],[64,1],[67,3],[67,2],[67,1],[67,2],[62,1],[67,2],[64,1],[67,3],
    [67,2],[67,1],[69,2],[71,1],[72,2],[71,1],[69,2],[71,1],[67,2],[67,1],[67,2],[62,1],[67,2],[64,1],[67,6]],
    [[67,3],[64,3],[63,3],[59,3],[67,3],[64,3],[63,3],[59,3],[62,3],[62,3],[62,3],[67,3],[64,3],[64,2],[63,1],[64,3],[62,3],[66,3],[62,3],[62,3],[64,3],[62,3],[62,3],[62,3],[64,3],[62,3],[64,3],[66,3],[64,3],[66,3],[62,3],[62,3],[60,3],[62,6]],
    [[59,3],[59,3],[57,3],[55,3],[59,3],[60,3],[59,3],[55,3],[59,3],[54,3],[55,3],[59,3],[57,3],[59,3],[55,3],[57,3],[60,3],[59,3],[55,3],[60,3],[59,3],[59,3],[55,3],[60,3],[59,3],[59,3],[62,3],[57,3],[60,3],[59,3],[55,3],[55,3],[59,6]],
    [[52,3],[52,3],[47,3],[52,3],[52,3],[48,3],[47,3],[52,3],[43,3],[50,3],[43,3],[55,3],[48,3],[47,3],[40,3],[50,3],[50,3],[43,3],[47,3],[48,3],[43,3],[55,3],[47,3],[48,3],[43,3],[52,3],[50,3],[48,3],[50,3],[43,3],[47,3],[48,3],[43,6]]]},
  {name:'Deck the Halls', ok:false, notes:[
    [67,3],[65,1],[64,2],[62,2],[60,2],[62,2],[64,2],[60,2],[62,1],[64,1],[65,1],[62,1],[64,3],[62,1],[60,2],[59,2],[60,4],
    [67,3],[65,1],[64,2],[62,2],[60,2],[62,2],[64,2],[60,2],[62,1],[64,1],[65,1],[62,1],[64,3],[62,1],[60,2],[59,2],[60,4]]},
  {name:'Good King Wenceslas', ok:false, notes:[
    [67,2],[67,2],[67,2],[69,2],[67,2],[67,2],[62,4],[64,2],[62,2],[64,2],[66,2],[67,4],[67,4],
    [67,2],[67,2],[67,2],[69,2],[67,2],[67,2],[62,4],[64,2],[62,2],[64,2],[66,2],[67,4],[67,4],
    [74,2],[72,2],[71,2],[69,2],[71,2],[69,2],[67,4],[64,2],[62,2],[64,2],[66,2],[67,4],[67,4]]},
  {name:'Joy to the World', ok:false, notes:[
    [72,3],[71,1],[69,2],[67,4],[65,2],[64,2],[62,2],[60,4],[67,1],[69,3],[69,1],[71,3],[71,1],[72,6],
    [72,1],[72,1],[71,1],[69,1],[67,1],[67,2],[65,1],[64,2],[60,4]]},
];
MELODIES.forEach(m => { if (m.voices && !m.notes) m.notes = m.voices[0]; }); // Melodie = Sopran
const tones = m => m.notes.filter(x => x[0] > 0); // ohne Pausen – für Stationen, die Ton für Ton spielen
const melodyFor = L => MELODIES[(L - 1) % MELODIES.length];
function chunks(notes, n) { // in n etwa gleich lange Stücke teilen, Schnitt bevorzugt nach langen Tönen
  const L = notes.length, cuts = [0];
  for (let k = 1; k < n; k++) {
    const ideal = Math.round(k * L / n); let best = ideal;
    for (let d = 0; d <= 2; d++) { if (notes[ideal - 1 + d] && notes[ideal - 1 + d][1] >= 6) { best = ideal + d; break; } if (notes[ideal - 1 - d] && notes[ideal - 1 - d][1] >= 6) { best = ideal - d; break; } }
    cuts.push(Math.min(L - (n - k), Math.max(cuts[k - 1] + 1, best)));
  }
  cuts.push(L);
  return cuts.slice(0, -1).map((c, i) => notes.slice(c, cuts[i + 1]));
}
