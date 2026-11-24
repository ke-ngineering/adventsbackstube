/* Adventsbackstube – gemeinsame Grundlagen: Spielstand, Zutaten, Klang, Melodien, Hilfsfunktionen.
   Wird von allen Spiel-Modulen (regal.js, blech.js, buch.js) und app.js genutzt. */
const VERSION = 'v26';
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
/* ---- Abspiel-Knöpfe (D64): erneutes Drücken stoppt; der Knopf zeigt ■ solange das Lied läuft ---- */
const Player = {key: null, btn: null, label: '', timer: 0,
  toggle(key, btn, start) { // start() spielt und liefert die Dauer in Sekunden
    const same = this.key === key; this.reset(); Snd.stop();
    if (same) return false;
    if (!Snd.on) Snd.toggle();
    const d = start() || 0; this.key = key; this.btn = btn; this.label = btn ? btn.textContent : '';
    if (btn) btn.textContent = '■ Stopp';
    this.timer = setTimeout(() => this.reset(), d * 1000 + 300);
    return true;
  },
  reset() { clearTimeout(this.timer); if (this.btn) this.btn.textContent = this.label; this.key = null; this.btn = null; },
};

/* ---- Ausgepackte Inhalte (Kalender 2.0) und Spiele-Verzeichnis ----
   Feat.has(id) wird von kalender.js gesetzt; Spiele[id] von app.js. */
const Feat = {has: () => true};
const Spiele = {};

/* ---- Sicherungscode: Spielstand als kopierbarer Text (D50) ----
   Format: ABS1-<base64url(UTF-8-JSON)>-<Prüfsumme 6 Hex>. Ändert nichts am gespeicherten Format. */
const Backup = (() => {
  const sum = t => { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16).padStart(8, '0').slice(0, 6); };
  const b64 = t => btoa(unescape(encodeURIComponent(t))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64 = t => decodeURIComponent(escape(atob(t.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((t.length + 3) % 4))));
  function code(st = save) { const body = b64(JSON.stringify(st)); return `ABS1-${body}-${sum(body)}`; }
  function read(c) { // liefert {ok, save} oder {ok:false, why}
    c = String(c || '').replace(/\s+/g, '');
    const m = /^ABS1-([A-Za-z0-9_-]+)-([0-9a-f]{6})$/.exec(c);
    if (!m) return {ok: false, why: 'Das sieht nicht wie ein Sicherungscode aus. Er beginnt mit „ABS1-“.'};
    if (sum(m[1]) !== m[2]) return {ok: false, why: 'Der Code ist unvollständig oder verändert – bitte ganz kopieren.'};
    try { const st = JSON.parse(unb64(m[1])); if (st && typeof st === 'object' && st.level) return {ok: true, save: st}; } catch (e) {}
    return {ok: false, why: 'Der Code ließ sich nicht lesen.'};
  }
  function restore(c) { const r = read(c); if (r.ok) { try { localStorage.setItem(KEY, JSON.stringify(r.save)); } catch (e) { return {ok: false, why: 'Speichern im Browser ist nicht möglich.'}; } } return r; }
  return {code, read, restore};
})();
const totalStars = () => starsOf(save) + Object.values(save.games || {}).reduce((a, g) => a + starsOf(g), 0);

/* ---- Klang: Geräusche synthetisch (Web Audio), keine Dateien ---- */
const Snd = (() => {
  let ctx = null, master = null, on = save.sound !== false, playing = [], stale = false, unlocked = false, rebuilt = 0;
  /* Browser begrenzen die Zahl der Audio-Kontexte (Safari besonders). Darum: einen Kontext behalten und nur fortsetzen.
     Neu angelegt wird höchstens zweimal pro Seitenaufruf – und nur, wenn er nach einem echten Klick bei sichtbarer Seite hängt (D59). */
  const ensure = () => {
    if (!on) return null;
    try {
      // iPhone/iPad: Ton auch bei Stummschalter abspielen (Safari 16.4+), sonst bleibt Web Audio stumm
      const iOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      try { if (iOS && navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch (e) {}
      if (ctx && stale && rebuilt < 2) {
        let neu = null; try { neu = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
        if (neu) { const alt = ctx; try { alt.close(); } catch (e) {} ctx = neu; master = null; unlocked = false; rebuilt++; }
        stale = false;
      }
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (!master) { master = ctx.createGain(); master.gain.value = .7; hallBus(); }
      if (ctx.state !== 'running') { const pr = ctx.resume(); if (pr && pr.catch) pr.catch(() => {}); } // WebKit kennt auch 'interrupted'
    } catch (e) { return ctx; }
    return ctx;
  };
  // Bei jedem Antippen: Ton freischalten (stiller Puffer) – hilft Safari/iOS. Hängt er danach noch, beim nächsten Klick neu anlegen.
  const unlock = () => {
    const c = ensure(); if (!c) return; if (!alleGestartet) setTimeout(ladenAlle, 300);
    if (!unlocked || c.state !== 'running') {
      try { const b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); unlocked = c.state === 'running'; } catch (e) {}
      setTimeout(() => { if (ctx === c && c.state !== 'running' && document.visibilityState === 'visible') stale = true; }, 600);
    }
  };
  ['touchend', 'mousedown', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, unlock, {capture: true, passive: true})); // kein pointerup: zählt in Safari (Maus/Trackpad) nicht als Nutzeraktion
  // Fenster versteckt: Musik anhalten (sonst stauen sich Töne); wieder sichtbar: fortsetzen
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stop(); return; }
    if (ctx && ctx.state !== 'running') { const pr = ctx.resume(); if (pr && pr.catch) pr.catch(() => {}); }
  });
  /* Raumhall (D66): Faltungshall mit berechneter Impulsantwort (abklingendes, nach hinten dunkler werdendes Rauschen, Stereo).
     master → trocken → Ausgang, master → Hall → Ausgang. Wie viel Hall, bestimmt die Besetzung des Liedes (room()). */
  let dry = null, send = null;
  function hallBus() {
    dry = ctx.createGain(); dry.gain.value = 1; master.connect(dry).connect(ctx.destination);
    send = ctx.createGain(); send.gain.value = .15;
    try {
      const sr = ctx.sampleRate, len = Math.floor(sr * 3.2), ir = ctx.createBuffer(2, len, sr), r = rng(4711);
      for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); let lp = 0;
        for (let i = 0; i < len; i++) { const x = i / sr, k = Math.min(.92, .25 + x * .35); lp = lp * k + (r() * 2 - 1) * (1 - k); d[i] = x < .018 ? 0 : lp * Math.exp(-x * 2.3) * 1.6; } }
      const conv = ctx.createConvolver(); conv.buffer = ir; master.connect(send).connect(conv).connect(ctx.destination);
    } catch (e) {}
  }
  const ROOM = {orgel: .5, chor: .45, blech: .38, brass: .38, streicher: .35, holz: .3, tanz: .26, musette: .28, spieluhr: .22, bell: .25, glocken: .3, folk: .16, epiano: .15};
  function room(style, at) { if (!send) return; const v = typeof style === 'number' ? style : ROOM[style] ?? .2, t = Math.max(ctx.currentTime, at || 0); send.gain.setTargetAtTime(v, t, .05); dry.gain.setTargetAtTime(1 - v * .35, t, .05); }
  // Lebendiges Spiel (D66): Betonung nach Taktschwerpunkten, kleine Schwankungen in Lautstärke und Einsatz – wie bei echten Musikern
  const VOLB = {orgelS: .045, chorS: .07, floeteS: .11, violineS: .07, bratscheS: .07, celloS: .08, trompeteS: .09, posauneS: .09, glockenS: .7, mandoline: .15, spieluhrS: .14, spieluhrT: .14, roehrenS: .16, gitarre: .17, bass: .3};
  const VOL = {orgelS: .07, chorS: .12, floeteS: .14, violineS: .11, bratscheS: .1, celloS: .1, trompeteS: .14, posauneS: .12, glockenS: 1, spieluhrS: .2, spieluhrT: .2, roehrenS: .22, bell: 1, brass: .16, streicher: .11, chor: .12, holz: .14, orgel: .07, spieluhr: .2, epiano: .16, bass: .3, mandoline: .2, gitarre: .16, zupf: .22};
  let human = rng(1);
  function feel(p, meter, pickup) { // Faktor für die Lautstärke an Position p (in Achteln)
    const bar = (meter || 4) * 2, x = ((p - (pickup || 0)) % bar + bar) % bar;
    const acc = x === 0 ? 1.12 : x % 2 === 0 ? (meter === 4 && x === 4 ? 1.05 : 1) : .9;
    return acc * (.94 + human() * .12);
  }
  const jitter = () => (human() - .5) * .014; // ±7 ms
  // laufende Klangquellen merken (für stop) – fertige fallen von selbst heraus
  const track = o => { playing.push(o); o.onended = () => { const i = playing.indexOf(o); if (i >= 0) playing.splice(i, 1); }; };
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
  function bell(n, t, len, vol = 1) {
    const f = hz(n);
    [[1, .32 * vol], [2.76, .08 * vol], [5.4, .03 * vol]].forEach(([m, v]) => {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f * m;
      env(g, t, .005, v, Math.max(.5, len * 1.6)); o.connect(g).connect(master); o.start(t); o.stop(t + len * 1.6 + .6); track(o);
    });
  }
  // Posaunenchor-Klang (für die ganze Melodie am Levelende)
  function brass(n, t, len, vol = .16) {
    const f = hz(n - 12), o = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; o2.type = 'sawtooth'; o.frequency.value = f; o2.frequency.value = f * 1.003;
    lp.type = 'lowpass'; lp.Q.value = 2; lp.frequency.setValueAtTime(f * 1.5, t); lp.frequency.linearRampToValueAtTime(f * 5, t + .08); lp.frequency.linearRampToValueAtTime(f * 3, t + len);
    const at = Math.min(.06, len * .4); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + at); g.gain.setValueAtTime(vol, t + Math.max(at + .01, len - .06)); g.gain.exponentialRampToValueAtTime(0.0001, t + len + .08);
    o.connect(lp); o2.connect(lp); lp.connect(g).connect(master); o.start(t); o2.start(t); o.stop(t + len + .12); o2.stop(t + len + .12); track(o); track(o2);
  }
  /* ---- Besetzungen (D55): Jedes Lied hat einen Stil – Instrumente werden im Browser erzeugt ---- */
  function osc(type, f, t, end, dest, det = 0) { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det; o.connect(dest); o.start(t); o.stop(end); track(o); return o; }
  function vibAll(os, t, end, depth, rate) { const l = ctx.createOscillator(), g = ctx.createGain(); l.frequency.value = rate; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(depth, t + .35); l.connect(g); os.forEach(o => g.connect(o.detune)); l.start(t); l.stop(end); track(l); }
  function adsr(t, len, a, peak, rel = .12) { const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.setValueAtTime(peak, t + Math.max(a, len - .02)); g.gain.exponentialRampToValueAtTime(0.0001, t + len + rel); g.connect(master); return g; }
  const INSTR = {
    bell, brass,
    streicher(n, t, len, vol = .11) { // Streichquartett: zwei leicht verstimmte Sägezähne, weich gefiltert, Vibrato
      const f = hz(n), g = adsr(t, len, .09, vol, .18), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = Math.min(5000, f * 4); lp.Q.value = .7; lp.connect(g);
      vibAll([osc('sawtooth', f, t, t + len + .25, lp, -6), osc('sawtooth', f, t, t + len + .25, lp, 6)], t, t + len + .25, 7, 5.5); },
    chor(n, t, len, vol = .12) { // Chor „Aah“: zwei Sägezähne durch drei Formantfilter
      const f = hz(n), g = adsr(t, len, .14, vol, .25), mix = ctx.createGain(); mix.gain.value = 1;
      [[730, 1.8, 1], [1090, 2.5, .5], [2440, 4, .18]].forEach(([fq, q, a]) => { const bp = ctx.createBiquadFilter(), m = ctx.createGain(); bp.type = 'bandpass'; bp.frequency.value = fq; bp.Q.value = q; m.gain.value = a * 3; mix.connect(bp); bp.connect(m).connect(g); });
      vibAll([osc('sawtooth', f, t, t + len + .3, mix, -8), osc('sawtooth', f, t, t + len + .3, mix, 8)], t, t + len + .3, 9, 4.8); },
    holz(n, t, len, vol = .14) { // Flöte: Sinus + Hauch, Vibrato
      const f = hz(n), g = adsr(t, len, .05, vol, .1); vibAll([osc('sine', f, t, t + len + .15, g)], t, t + len + .15, 8, 5);
      const g2 = ctx.createGain(); g2.gain.value = .25; g2.connect(g); osc('triangle', f * 2, t, t + len + .15, g2); },
    orgel(n, t, len, vol = .07) { // Orgel: Zugriegel 16′ 8′ 4′ 2⅔′ 2′
      const f = hz(n), g = adsr(t, len, .02, vol, .08); [[.5, .6], [1, 1], [2, .7], [3, .35], [4, .3]].forEach(([m, a]) => { const gg = ctx.createGain(); gg.gain.value = a; gg.connect(g); osc('sine', f * m, t, t + len + .1, gg); }); },
    spieluhr(n, t, len, vol = .2) { // Spieluhr: hell, kurz, mit Metallobertönen
      const f = hz(n + 12); [[1, vol], [3.98, vol * .25], [8.1, vol * .08]].forEach(([m, v]) => { const g = ctx.createGain(); env(g, t, .003, v, Math.max(.6, len * 2)); g.connect(master); osc('sine', f * m, t, t + len * 2 + .7, g); }); },
    epiano(n, t, len, vol = .16) { // E-Piano (FM) für das Jazz-Trio
      const f = hz(n), g = ctx.createGain(); env(g, t, .004, vol, Math.max(.5, len * 1.4)); g.connect(master);
      const car = osc('sine', f, t, t + len * 1.4 + .6, g), mod = ctx.createOscillator(), mg = ctx.createGain(); mod.frequency.value = f; mg.gain.setValueAtTime(f * 1.8, t); mg.gain.exponentialRampToValueAtTime(f * .15, t + .5);
      mod.connect(mg).connect(car.frequency); mod.start(t); mod.stop(t + len * 1.4 + .6); track(mod); },
    bass(n, t, len, vol = .3) { // gezupfter Kontrabass
      const f = hz(n), g = ctx.createGain(); env(g, t, .006, vol, Math.max(.35, len)); g.connect(master); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(f * 6, t); lp.frequency.exponentialRampToValueAtTime(f * 2, t + .25); lp.connect(g);
      osc('triangle', f, t, t + len + .5, lp); osc('sawtooth', f, t, t + len + .5, lp, 4); },
  };
  function besen(t, vol = .14) { // Besen auf der Snare: gefiltertes Rauschen
    const len = .16, buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
    const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = buf; bp.type = 'bandpass'; bp.frequency.value = 3800; bp.Q.value = .6; g.gain.value = vol;
    s.connect(bp).connect(g).connect(master); s.start(t); track(s);
  }
  function pauke(n, t, len, vol = .5) { // Pauke (Nachbildung): gedämpfter Sinus mit fallender Tonhöhe + Fellanschlag
    const f = hz(n), g = ctx.createGain(); env(g, t, .004, vol, Math.max(.4, Math.min(1.6, len * 3))); g.connect(master);
    const o = osc('sine', f * 1.02, t, t + 1.8, g); o.frequency.setValueAtTime(f * 1.04, t); o.frequency.exponentialRampToValueAtTime(f, t + .08);
    const g2 = ctx.createGain(); env(g2, t, .002, vol * .35, .25); g2.connect(master); osc('triangle', f * 1.5, t, t + .4, g2);
    besen(t, vol * .25);
  }
  function tabor(n, t, len, vol = .3) { // Trommel (Nachbildung): tiefer Schlag = Ton + Rauschen, heller Schlag = nur Rauschen (Schnarrsaite)
    if (n === 45) { const g = ctx.createGain(); env(g, t, .003, vol, .22); g.connect(master); const o = osc('sine', 150, t, t + .3, g); o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(95, t + .2); }
    besen(t, vol * (n === 45 ? .5 : .9));
  }
  // Stil → Instrument je Stimme (Sopran, Alt, Tenor, Bass) und Lautstärke
  const STYLE = {
    bell: {v: ['glockenS'], name: 'Glockenspiel'}, blech: {v: ['trompeteS', 'trompeteS', 'posauneS', 'posauneS'], name: 'Posaunenchor'}, brass: {v: ['trompeteS', 'trompeteS', 'posauneS', 'posauneS'], name: 'Posaunenchor'},
    streicher: {v: ['violineS', 'violineS', 'bratscheS', 'celloS'], name: 'Streichquartett'}, chor: {v: ['chorS'], name: 'Chor'}, holz: {v: ['floeteS'], name: 'Flöten'},
    orgel: {v: ['orgelS'], name: 'Orgel'}, epiano: {v: ['epiano'], name: 'E-Piano'}, spieluhr: {v: ['spieluhrS'], name: 'Spieluhr'},
    folk: {v: ['mandoline'], name: 'Mandoline & Gitarre'}, tanz: {v: ['floeteS', 'floeteS', 'gitarre', 'gitarre'], name: 'Flöten & Laute'}, musette: {v: ['floeteS', 'floeteS', 'gitarre', 'celloS'], name: 'Flöten, Laute & Cello-Bordun'}, mandoline: {v: ['mandoline'], name: 'Mandoline'},
    glocken: {v: ['glockenS', 'spieluhrT', 'spieluhrT', 'roehrenS'], name: 'Glockenspiel, Spieluhren & Röhrenglocken'},
  };
  const styleOf = s => STYLE[s] || STYLE.bell;
  const swingT = (t8, tempo) => { const beat = Math.floor(t8 / 2), off = t8 - beat * 2; return (beat * 2 + (off >= 1 ? 1.34 + (off - 1) * .66 : off * 1.34)) * tempo; };
  // Mehrstimmig: jede Stimme in Originallage, Sopran etwas lauter
  /* opt (D69): off = Startversatz in Sekunden (Sätze einer Suite), dyn = [[von, bis, Faktor]] in Achteln (Echo leise),
     perc = Schlagwerk-Stimme [[Ton, Achtel]], percIns = 'pauke' | 'tabor' */
  function choir(voices, tempo = .2, style = 'blech', meter = 4, pickup = 0, opt = {}) {
    const c = ensure(); if (!c) return 0; const t0 = c.currentTime + .06 + (opt.off || 0), st = styleOf(style); let end = 0;
    const dyn = p => { for (const [a, b, f] of opt.dyn || []) if (p >= a && p < b) return f; return 1; };
    room(opt.room || style, t0); human = rng(voices[0].length * 7 + 3);
    if (opt.perc) { let p = 0; for (const [n, d] of opt.perc) { if (n) INSTR[opt.percIns === 'pauke' ? 'paukeS' : 'trommelS'](n, t0 + p * tempo + jitter(), opt.percIns === 'pauke' ? Math.max(1.4, d * tempo) : .6, (opt.percIns === 'pauke' ? .5 : .32) * dyn(p) * feel(p, meter, pickup)); p += d; } }
    // wechsel (D70): [[ab Achtel, [Instrument S, A, T, B]], …] – Besetzung wechselt im Stück (wie bei Mike Oldfields „In Dulci Jubilo“)
    const instrAt = (k, p) => { let nm = st.v[Math.min(k, st.v.length - 1)]; for (const [a, l] of opt.wechsel || []) if (p >= a) nm = l[k]; return nm; };
    voices.forEach((v, k) => {
      const lead = k === 0;
      let p = 0;
      for (const [n, d] of v) {
        const ta = t0 + p * tempo, tb = t0 + (p + d) * tempo;
        if (n) {
          const name = instrAt(k, p), ins = INSTR[name];
          const nn = style === 'blech' || style === 'brass' || /^(trompete|posaune)S$/.test(name) ? n + 12 : n; // Bläser: Synthese-Konvention eine Oktave tiefer
          const base = ((lead ? VOL[name] : VOLB[name]) || .08) * (opt.mix ? opt.mix[k] : 1);
          ins(nn, Math.max(t0, ta + jitter()), (tb - ta) * .94, base * feel(p, meter, pickup) * dyn(p));
        }
        p += d;
      }
      end = Math.max(end, t0 + p * tempo);
    });
    return end - c.currentTime + .8;
  }
  // Mehrsätziges Stück (Suite, D69): Sätze nacheinander, jeder mit eigener Besetzung, eigenem Tempo und Takt
  function suite(m, base = .2) {
    let off = 0;
    for (const s of m.teile) {
      const d = choir(s.voices, base * (s.tempo || 1), s.style, s.meter, s.pickup, {off, dyn: s.dyn, perc: s.perc, percIns: s.percIns, room: s.room, mix: s.mix, wechsel: s.wechsel});
      off = d - .8 + 1.4 - .06; // kurze Atempause zwischen den Sätzen
    }
    return off + .8;
  }

  function phrase(notes, voice = 'bell', tempo = .17, meter = 4, pickup = 0) {
    const c = ensure(); if (!c) return 0; const t0 = c.currentTime + .06, st = styleOf(voice), name = st.v[0], ins = INSTR[name];
    room(voice); human = rng(notes.length * 13 + 5);
    let p = 0;
    for (const [n, d] of notes) {
      const ta = t0 + p * tempo, tb = t0 + (p + d) * tempo;
      if (n) ins(voice === 'blech' || voice === 'brass' ? n + 12 : n, Math.max(t0, ta + jitter()), (tb - ta) * .92, (VOL[name] || .15) * feel(p, meter, pickup));
      p += d;
    }
    return t0 + p * tempo - c.currentTime + .6;
  }

  /* Akkord-Hilfen (D60, für Folk-Duo D64). Ursprünglich Jazz-Trio: Melodie auf dem E-Piano, Begleitakkorde (Terz + Septime + None) im Charleston-Rhythmus,
     Walking Bass auf jeder Viertel (Grundton → Akkordtöne → chromatischer Anlauf zum nächsten Grundton), Besen mit Akzent auf 2 und 4.
     Braucht m.chords = [[Symbol, Achtel], …] über die ganze Melodie und m.meter (Viertel pro Takt), m.pickup (Achtel Auftakt). */
  const PC = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11};
  const Q = {'': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], 6: [0, 4, 7, 9], m6: [0, 3, 7, 9], dim7: [0, 3, 6, 9], m7b5: [0, 3, 6, 10], 9: [0, 4, 7, 10, 14], '7b9': [0, 4, 7, 10, 13]};
  function chordOf(sym) {
    const [main, sl] = sym.split('/'); let i = 1; while (i < main.length && '#b'.includes(main[i])) i++;
    const pc = x => { let p = PC[x[0]]; for (const ch of x.slice(1)) p += ch === '#' ? 1 : ch === 'b' ? -1 : 0; return (p + 12) % 12; };
    const root = pc(main.slice(0, i)), q = main.slice(i), iv = Q[q] || Q[''];
    const third = iv[1], sev = iv[3] !== undefined ? iv[3] : q === '' ? 9 : 10;
    return {root, bass: sl ? pc(sl) : root, tones: iv.map(x => (root + x) % 12), guide: [third, sev, 14].map(x => (root + x) % 12), fifth: (root + 7) % 12};
  }
  const near = (pc, around) => { let n = around - ((around - pc) % 12 + 12) % 12; if (around - n > 6) n += 12; return n; };
  /* Gezupfte Saiten (D64): Karplus-Strong – jede Tonhöhe wird einmal als Klangpuffer berechnet und dann wiederverwendet.
     hell = Mandoline (Melodie), sonst Gitarre (Begleitung). Feinstimmung über einen Allpass für genaue Tonhöhe. */
  const pluckCache = {};
  function pluckBuffer(n, hell) {
    const key = n + (hell ? 'h' : 'g'); if (pluckCache[key]) return pluckCache[key];
    const sr = ctx.sampleRate, f = hz(n), len = Math.floor(sr * (hell ? 1.6 : 2.4)), buf = ctx.createBuffer(1, len, sr), y = buf.getChannelData(0);
    const P = sr / f - .5, N = Math.floor(P), frac = P - N, c = (1 - frac) / (1 + frac);
    const decay = hell ? .9965 : .9985 - Math.max(0, n - 60) * .00004;
    const r = rng(n * 31 + (hell ? 7 : 3));
    // Anschlag: Rauschen, bei der Gitarre weicher (geglättet)
    let prev = 0; for (let i = 0; i < N && i < len; i++) { const w = r() * 2 - 1; prev = hell ? w : prev * .5 + w * .5; y[i] = prev * .9; }
    let ap = 0, apIn = 0;
    for (let i = N; i < len; i++) {
      const x = (y[i - N] + (i - N - 1 >= 0 ? y[i - N - 1] : 0)) * .5 * decay;
      const out = c * x + apIn - c * ap; apIn = x; ap = out; y[i] = out;
    }
    return (pluckCache[key] = buf);
  }
  INSTR.zupf = (n, t, len, vol = .22, hell = false) => {
    const s = ctx.createBufferSource(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    s.buffer = pluckBuffer(n, hell); lp.type = 'lowpass'; lp.frequency.value = hell ? 6000 : 3200;
    const end = t + Math.max(.15, len), dur = s.buffer.duration; vol *= 1 + Math.max(0, n - 60) * .04; // hohe Saiten klingen leiser – ausgleichen
    g.gain.setValueAtTime(vol, t); g.gain.setValueAtTime(vol, Math.min(end, t + dur - .1)); g.gain.exponentialRampToValueAtTime(0.0001, Math.min(t + dur, end + .12));
    s.connect(lp).connect(g).connect(master); s.start(t); s.stop(Math.min(t + dur, end + .15)); track(s);
  };
  /* Aufnahmen (D66/D67): echte Instrumententöne aus MuseScore General (MIT), je 3 Halbtöne ein Ton, dazwischen umgestimmt.
     Werden nach dem ersten Antippen im Hintergrund geladen. Solange eine Aufnahme fehlt (oder das Laden scheitert),
     spielt automatisch der nachgebaute Klang – das Spiel bleibt also nie stumm. */
  const SETS = {orgel: [36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81], trompete: [54, 57, 60, 63, 66, 69, 72, 75, 78, 81, 84], posaune: [36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72], chor: [40, 43, 46, 49, 52, 55, 58, 61, 64, 67, 70, 73, 76, 79], violine: [55, 58, 61, 64, 67, 70, 73, 76, 79, 82, 85, 88], bratsche: [48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78], cello: [36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69], floete: [60, 63, 66, 69, 72, 75, 78, 81, 84, 87, 90, 93, 96], glocken: [60, 63, 66, 69, 72, 75, 78, 81, 84, 87, 90, 93, 96], spieluhr: [60, 63, 66, 69, 72, 75, 78, 81, 84, 87, 90, 93, 96], roehrenglocken: [45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75], pauke: [38, 43], trommel: [38, 45]}, bufs = {}, ladeStatus = {};
  // Lautstärke-Ausgleich: Aufnahme-Pegel = Synthese-Lautstärke × Faktor
  const FAKTOR = {orgel: 4.5, trompete: 2.1, posaune: 2.3, chor: 2.6, violine: 2.6, bratsche: 2.6, cello: 2.4, floete: 2.2, glocken: .38, spieluhr: 1.6, roehrenglocken: 1.5, pauke: 1.5, trommel: 1.3};
  let aufnahmenAn = save.klang !== 'synth';
  async function laden(set) {
    const c = ensure(); if (!c) return false; if (ladeStatus[set] === 'ok') return true; ladeStatus[set] = 'lädt'; bufs[set] = bufs[set] || {};
    try {
      await Promise.all(SETS[set].filter(n => !bufs[set][n]).map(async n => {
        const r = await fetch(`klang/${set}/o${n}.mp3?v=${VERSION}`); if (!r.ok) throw new Error(r.status);
        const a = await r.arrayBuffer();
        bufs[set][n] = await new Promise((ok, err) => { const p = c.decodeAudioData(a, ok, err); if (p && p.then) p.then(ok, err); });
        anstieg[set + n] = einschwingen(bufs[set][n]);
      }));
      ladeStatus[set] = 'ok'; return true;
    } catch (e) { ladeStatus[set] = 'fehler'; return false; }
  }
  let alleGestartet = false;
  async function ladenAlle() { if (alleGestartet || !aufnahmenAn) return; alleGestartet = true; for (const set in SETS) await laden(set); }
  const geladen = set => aufnahmenAn && ladeStatus[set] === 'ok';
  /* Einschwingzeit einer Aufnahme (D70): Zeit, bis die Hüllkurve 40 % ihres Spitzenwerts erreicht. Gestrichene Saiten brauchen
     dafür 0,1–0,2 s – so lang wie eine schnelle Achtel. Kurze Noten überspringen diesen Anlauf, damit Läufe deutlich klingen. */
  const anstieg = {};
  function einschwingen(b) {
    const d = b.getChannelData(0), blk = 256, n = Math.min(d.length, b.sampleRate * 1.5);
    let pk = 0; const env = [];
    for (let i = 0; i < n; i += blk) { let m = 0; for (let j = i; j < Math.min(n, i + blk); j++) m = Math.max(m, Math.abs(d[j])); env.push(m); pk = Math.max(pk, m); }
    const k = env.findIndex(x => x >= pk * .4); return Math.max(0, k) * blk / b.sampleRate;
  }
  function aufnahme(set, n, t, len, vol) {
    const T = SETS[set], s0 = T.reduce((a, b) => Math.abs(b - n) < Math.abs(a - n) ? b : a), b = bufs[set][s0];
    const src = ctx.createBufferSource(), g = ctx.createGain(), rate = Math.pow(2, (n - s0) / 12); src.buffer = b; src.playbackRate.value = rate;
    const skip = (anstieg[set + s0] || 0) * Math.min(1, Math.max(0, (.6 - len) / .4)) * .85; // kurze Note: Anlauf (fast) überspringen, lange: natürlich einschwingen
    const end = t + Math.max(.05, Math.min(len, (b.duration - skip) / rate - .25)), rel = Math.min(.14, Math.max(.05, len * .35));
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + .012); g.gain.setValueAtTime(vol, end); g.gain.exponentialRampToValueAtTime(0.0001, end + rel);
    src.connect(g).connect(master); src.start(t, skip); src.stop(end + rel + .02); track(src);
  }
  // Instrument mit Aufnahme, sonst Synthese. shift: Tonhöhenausgleich zwischen Synthese-Konvention und echter Tonhöhe
  const mitAufnahme = (set, synth, shift = 0) => (n, t, len, vol) => geladen(set) ? aufnahme(set, n + shift, t, len, vol * FAKTOR[set]) : synth(n, t, len, vol);
  Object.assign(INSTR, {
    orgelS: mitAufnahme('orgel', INSTR.orgel), chorS: mitAufnahme('chor', INSTR.chor), floeteS: mitAufnahme('floete', INSTR.holz),
    violineS: mitAufnahme('violine', INSTR.streicher), bratscheS: mitAufnahme('bratsche', INSTR.streicher), celloS: mitAufnahme('cello', INSTR.streicher),
    trompeteS: mitAufnahme('trompete', brass, -12), posauneS: mitAufnahme('posaune', brass, -12), // Bläser-Synthese klingt eine Oktave tiefer als notiert
    glockenS: mitAufnahme('glocken', bell), spieluhrS: mitAufnahme('spieluhr', INSTR.spieluhr, 12), // Spieluhr klingt eine Oktave höher
    spieluhrT: mitAufnahme('spieluhr', (n, t, len, vol) => INSTR.spieluhr(n - 12, t, len, vol)), // Spieluhr in notierter Lage (Mittelstimmen)
    roehrenS: mitAufnahme('roehrenglocken', bell), // Röhrenglocken für die tiefe Stimme
    paukeS: mitAufnahme('pauke', pauke), trommelS: (n, t, len, vol) => mitAufnahme('trommel', tabor)(n === 2 ? 45 : 38, t, len, vol), // Tabor: 2 = tiefer Schlag, 1 = heller
  });
  INSTR.mandoline = (n, t, len, vol = .2) => INSTR.zupf(n, t, len, vol, true);
  INSTR.gitarre = (n, t, len, vol = .16) => INSTR.zupf(n, t, len, vol, false);
  /* Folk-Duo: Melodie auf der Mandoline (lange Töne als Tremolo), Begleitung als Fingerpicking auf der Gitarre:
     Daumen spielt Wechselbass (Grundton – Quinte), die Finger zupfen Akkordtöne dazwischen. Akkorde werden zu Dreiklängen vereinfacht (Sept bleibt). */
  function folkEvents(m) {
    const meter = m.meter || 4, pk = m.pickup || 0, ev = [];
    let p = 0;
    for (const [n, d] of m.notes) {
      if (n) {
        if (d >= 3) for (let x = 0; x < d - .01; x += .5) ev.push({i: 'mandoline', n, t: p + x, len: .5, vol: x ? .11 : .2, part: 'Mandoline'}); // Tremolo
        else ev.push({i: 'mandoline', n, t: p, len: d, vol: .2, part: 'Mandoline'});
      }
      p += d;
    }
    const total = p, segs = []; let q = 0;
    for (const [sym, d] of m.chords) { segs.push({a: q, b: q + d, c: chordOf(sym.replace(/maj7|m7b5|6|9/g, m => m === 'm7b5' ? 'm' : '').replace(/m7/g, 'm'))}); q += d; }
    const segAt = x => segs.find(g => x >= g.a && x < g.b) || segs[segs.length - 1];
    const pat4 = ['B', 'h', 'A', 'm', 'B', 'h', 'A', 'm'], pat3 = ['B', 'm', 'h', 'm', 'A', 'm'];
    for (let x = 0; x < total; x++) {
      const pos = ((x - pk) % (meter * 2) + meter * 2) % (meter * 2), role = (meter === 3 ? pat3 : pat4)[pos], g = segAt(x).c;
      const bass = near(g.bass, 45), fifth = near(g.fifth, bass + 7);
      let n;
      if (role === 'B') n = bass; else if (role === 'A') n = fifth > 52 ? fifth - 12 : fifth;
      else { const tones = g.tones.map(pc => near(pc, 60)).sort((a, b) => a - b); n = role === 'h' ? tones[tones.length - 1] : tones[Math.floor(tones.length / 2)]; }
      if (x < pk && role !== 'B' && role !== 'A') continue;
      ev.push({i: 'gitarre', n, t: x, len: role === 'B' || role === 'A' ? 2 : 1.6, vol: role === 'B' ? .19 : role === 'A' ? .15 : .1, part: 'Gitarre'});
      if (pos === 0) ev.push({i: 'gitarre', n: near(g.tones[1], 64), t: x + .02, len: 2, vol: .09, part: 'Gitarre'}); // Pinch auf der Eins
    }
    return {ev, total};
  }
  function folk(m, tempo) {
    const c = ensure(); if (!c) return 0; const t0 = c.currentTime + .1, {ev, total} = folkEvents(m); room('folk'); human = rng(5);
    for (const e of ev) INSTR[e.i](e.n, Math.max(t0, t0 + e.t * tempo + jitter()), e.len * tempo, e.vol * (.92 + human() * .16));
    return t0 + total * tempo - c.currentTime + .6;
  }
  // Ein Lied in seiner Besetzung abspielen (Grundtempo × eigenes Tempo des Liedes)
  function song(m, base = .2, kurz = false) {
    const tempo = base * (m.tempo || 1);
    if (kurz) return phrase(m.notes.slice(0, 24), m.style, tempo);
    if (m.teile) return suite(m, base);
    if (m.voices) return choir(m.voices, tempo, m.style, m.meter, m.pickup, {dyn: m.dyn, perc: m.perc, percIns: m.percIns, room: m.room, mix: m.mix, wechsel: m.wechsel});
    if (m.style === 'folk' && m.chords) return folk(m, tempo);
    return phrase(m.notes, m.style, tempo, m.meter, m.pickup);
  }
  function bassLine(notes, t0, tempo) { // Jazz: einfacher Bass auf jedem Viertel – Grundton des Taktes aus der Melodie (Tiefster Ton je Halbtakt)
    let p = 0; const seg = {};
    for (const [n, d] of notes) { if (n) { const k = Math.floor(p / 4); seg[k] = Math.min(seg[k] || 999, n); } p += d; }
    for (const k in seg) { const root = seg[k] % 12 + 36; INSTR.bass(root, t0 + swingT(k * 4, tempo), tempo * 1.8); INSTR.bass(root + 7, t0 + swingT(k * 4 + 2, tempo), tempo * 1.8); }
  }
  // einzelner Ton (Glockenspiel), z. B. beim Antippen
  function note(n, len = .35) { const c = ensure(); if (!c) return; bell(n, c.currentTime + .01, len); }
  function stop() { playing.forEach(o => { try { o.stop(); } catch (e) {} }); playing = []; }
  function toggle() { on = !on; save.sound = on; persist(); if (!on) stop(); else phrase([[72, 1], [76, 1], [79, 2]], 'bell', .14); return on; } // Einschalten spielt einen kleinen Klang zum Testen
  return {tap, pour, nope, note, phrase, choir, suite, song, folkEvents, laden, ladenAlle, geladen, stop, toggle,
    get aufnahmen() { return aufnahmenAn; }, set aufnahmen(v) { aufnahmenAn = v; save.klang = v ? 'auf' : 'synth'; persist(); if (v) ladenAlle(); },
    ladeStand: () => ({fertig: Object.keys(SETS).filter(k => ladeStatus[k] === 'ok').length, fehler: Object.keys(SETS).filter(k => ladeStatus[k] === 'fehler').length, gesamt: Object.keys(SETS).length}), styleName: s => styleOf(s).name, get state() { return ctx ? ctx.state : 'noch nicht gestartet'; }, ensure, get on() { return on; }};
})();

/* ---- Melodien (gemeinfrei). [MIDI-Note, Dauer in Achteln], 60 = c', Note 0 = Pause ----
   src: Quelle der Noten. „Singen im Advent“ = gemeinfreies Liederbuch (github.com/musikpirat/singen-im-advent.github.io),
   Noten von Claude aus dem PDF abgelesen. ok:false = aus dem Gedächtnis notiert, auf #lieder prüfen lassen. */
const SIA = 'Liederbuch „Singen im Advent“';
const MELODIES = [
  {name:'Stille Nacht, heilige Nacht', meter:3, mlabel:'6/8', tempo:1.25, src:SIA, satz:'eigener Satz (D60)', voices:[[[67,3],[69,1],[67,2],[64,6],[67,3],[69,1],[67,2],[64,6],[74,4],[74,2],[71,6],[72,4],[72,2],[67,6],[69,4],[69,2],[72,3],[71,1],[69,2],[67,3],[69,1],[67,2],[64,6],[69,4],[69,2],[72,3],[71,1],[69,2],[67,3],[69,1],[67,2],[64,6],[74,4],[74,2],[77,3],[74,1],[71,2],[72,6],[76,6],[72,3],[67,1],[64,2],[67,3],[65,1],[62,2],[60,12]],   [[64,6],[64,6],[64,6],[60,6],[62,6],[65,6],[64,6],[64,6],[60,6],[60,4],[60,2],[60,6],[60,6],[60,6],[60,4],[60,2],[64,6],[64,6],[67,6],[67,6],[67,6],[67,6],[64,6],[59,6],[55,12]],   [[55,6],[55,6],[55,6],[55,6],[59,6],[55,6],[55,6],[55,6],[53,6],[57,4],[53,2],[52,6],[55,6],[53,6],[57,4],[53,2],[55,6],[55,6],[59,6],[59,6],[55,6],[55,6],[55,6],[53,6],[52,12]],   [[48,6],[48,6],[48,6],[48,6],[43,6],[43,6],[48,6],[48,6],[41,6],[41,4],[45,2],[48,6],[48,6],[41,6],[41,4],[45,2],[48,6],[48,6],[43,6],[43,6],[40,6],[48,6],[48,6],[43,6],[48,12]]]},
  {name:'Alle Jahre wieder', src:SIA, notes:[
    [69,3],[71,1],[69,2],[67,2],[66,4],[64,4],[62,2],[64,1],[66,1],[67,2],[66,2],[64,6],[0,2],
    [66,2],[69,2],[71,2],[69,2],[74,4],[73,2],[71,2],[69,2],[67,1],[66,1],[67,2],[69,2],[66,6],[0,2]]},
  {name:'O Tannenbaum', tempo:1.43, src:SIA, notes:[
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
  {name:'Jingle Bells', src:SIA, meter:4, pickup:0, chords:[["C6", 8], ["Am7", 8], ["C6", 8], ["C6", 4], ["C7", 4], ["F6", 8], ["C6", 8], ["D7", 8], ["Dm7", 4], ["G7", 4], ["C6", 8], ["A7", 8], ["C6", 8], ["C6", 4], ["C7", 4], ["F6", 8], ["C6", 4], ["A7", 4], ["Dm7", 4], ["G7", 4], ["C6", 8]], notes:[
    [64,2],[64,2],[64,4],[64,2],[64,2],[64,4],[64,2],[67,2],[60,3],[62,1],[64,8],
    [65,2],[65,2],[65,3],[65,1],[65,2],[64,2],[64,2],[64,1],[64,1],[64,2],[62,2],[62,2],[64,2],[62,4],[67,4],
    [64,2],[64,2],[64,4],[64,2],[64,2],[64,4],[64,2],[67,2],[60,3],[62,1],[64,8],
    [65,2],[65,2],[65,3],[65,1],[65,2],[64,2],[64,2],[64,1],[64,1],[67,2],[67,2],[65,2],[62,2],[60,8]]},
  {name:'Ihr Kinderlein kommet', tempo:1.3, src:SIA, notes:[
    [69,1],[69,2],[66,1],[69,1],[69,2],[66,1],[69,1],[67,2],[64,1],[67,1],[66,2],[0,1],[69,1],
    [69,2],[66,1],[69,1],[69,2],[66,1],[69,1],[67,2],[64,1],[67,1],[66,2],[0,1],[66,1],
    [64,2],[64,1],[64,1],[67,2],[67,1],[67,1],[66,2],[66,1],[66,1],[71,2],[0,1],[71,1],
    [69,2],[69,1],[69,1],[74,2],[69,1],[66,1],[69,2],[67,1],[64,1],[62,3]]},
  {name:'Leise rieselt der Schnee', tempo:1.3, src:SIA, notes:[
    [69,2],[69,1],[67,1],[69,1],[67,1],[65,5],[0,1],[65,2],[62,1],[65,1],[64,1],[62,1],[60,5],[0,1],
    [67,1],[66,1],[67,1],[70,1],[69,1],[67,1],[65,5],[0,1],[67,1.5],[62,.5],[62,1],[64,1],[62,1],[64,1],[65,5],[0,1]]},
  {name:'O du fröhliche', meter:4,  tempo:1.1, src:SIA, satz:'eigener Satz (D60)', voices:[[[69,4],[71,4],[69,3],[67,1],[66,2],[67,2],[69,4],[71,4],[69,3],[67,1],[66,2],[67,2],[69,4],[69,4],[71,4],[73,2],[74,2],[73,4],[71,4],[69,8],[64,3],[66,1],[64,2],[66,2],[67,3],[69,1],[67,4],[66,3],[67,1],[66,2],[67,2],[69,3],[71,1],[69,4],[74,2],[73,2],[71,2],[69,2],[74,2],[71,2],[69,2],[67,2],[66,4],[64,4],[62,8]],   [[62,4],[62,4],[62,4],[62,2],[61,2],[62,4],[62,4],[62,4],[62,2],[64,2],[66,4],[69,4],[67,4],[64,2],[66,2],[64,4],[62,4],[61,8],[61,4],[62,4],[62,4],[61,4],[62,4],[62,2],[61,2],[66,4],[66,4],[66,2],[64,2],[62,2],[62,2],[62,4],[62,2],[61,2],[62,4],[61,4],[57,8]],   [[54,4],[55,4],[54,4],[57,2],[57,2],[54,4],[55,4],[54,4],[57,2],[61,2],[62,4],[61,4],[59,4],[57,2],[57,2],[57,4],[56,4],[52,8],[55,4],[54,4],[59,4],[57,4],[57,4],[57,2],[57,2],[57,4],[57,4],[57,2],[57,2],[54,2],[57,2],[59,4],[54,2],[57,2],[57,4],[55,4],[54,8]],   [[38,4],[43,4],[50,4],[50,2],[45,2],[50,4],[43,4],[50,4],[50,2],[45,2],[50,4],[54,4],[55,4],[57,2],[50,2],[52,4],[52,4],[45,8],[45,4],[50,4],[43,4],[45,4],[50,4],[50,2],[45,2],[50,4],[50,4],[50,2],[45,2],[47,2],[42,2],[43,4],[45,2],[45,2],[50,4],[45,4],[50,8]]]},
  {name:'Morgen kommt der Weihnachtsmann', src:SIA, notes:[
    [60,2],[60,2],[67,2],[67,2],[69,2],[69,2],[67,4],[65,2],[65,2],[64,2],[64,2],[62,2],[62,2],[60,4],
    [67,2],[67,2],[65,2],[65,2],[64,2],[64,2],[62,4],[67,2],[67,2],[65,2],[65,2],[64,2],[64,2],[62,4],
    [60,2],[60,2],[67,2],[67,2],[69,2],[69,2],[67,4],[65,2],[65,2],[64,2],[64,2],[62,2],[62,2],[60,6]]},
  {name:'We Wish You a Merry Christmas', src:SIA, meter:3, pickup:2, chords:[["A7", 2], ["D", 6], ["G", 6], ["E7", 6], ["A7", 6], ["F#7", 6], ["Bm", 6], ["Em7", 4], ["A7", 2], ["D", 4], ["A7", 2], ["G", 6], ["A7", 6], ["G", 2], ["A7", 2], ["Bm", 2], ["F#m7", 4], ["A7", 2], ["D", 6], ["Bm7", 6], ["Em7", 4], ["A7", 2], ["D6", 6]], notes:[
    [69,2],[74,2],[74,1],[76,1],[74,1],[73,1],[71,2],[71,2],[71,2],[76,2],[76,1],[78,1],[76,1],[74,1],[73,2],[69,2],[69,2],
    [78,2],[78,1],[79,1],[78,1],[76,1],[74,2],[71,2],[69,1],[69,1],[71,2],[76,2],[73,2],[74,4],[69,2],
    [74,2],[74,2],[74,2],[73,4],[73,2],[74,2],[73,2],[71,2],[69,4],[76,2],
    [78,2],[76,1],[76,1],[74,1],[74,1],[81,2],[78,2],[69,1],[69,1],[71,2],[76,2],[73,2],[74,6]]},
  {name:'Süßer die Glocken nie klingen', tempo:1.43, src:SIA, notes:[
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
  {name:'Herbei, o ihr Gläubigen', meter:4, pickup:2, src:SIA, satz:'eigener Satz (D60)', voices:[[[69,2],[69,4],[64,2],[69,2],[71,4],[64,4],[73,2],[71,2],[73,2],[74,2],[73,4],[71,2],[69,2],[69,4],[68,2],[66,2],[68,2],[69,2],[71,2],[73,2],[68,4],[66,3],[64,1],[64,8],[76,4],[74,2],[73,2],[74,4],[73,4],[71,2],[73,2],[69,2],[71,2],[68,3],[66,1],[64,2],[69,2],[69,2],[68,2],[69,2],[71,2],[69,4],[64,2],[73,2],[73,2],[71,2],[73,2],[74,2],[73,4],[71,2],[73,2],[74,2],[73,2],[71,2],[69,2],[68,4],[69,2],[74,2],[73,4],[71,3],[69,1],[69,6]],   [[64,2],[64,4],[64,2],[64,2],[68,4],[64,4],[64,2],[64,2],[64,2],[66,2],[64,4],[64,2],[61,2],[62,4],[59,2],[57,2],[59,2],[61,2],[64,2],[64,2],[64,4],[63,4],[59,8],[69,4],[64,2],[64,2],[66,4],[64,4],[64,2],[64,2],[66,2],[64,2],[63,4],[59,2],[61,2],[61,2],[59,2],[61,2],[64,2],[64,4],[64,2],[64,2],[64,2],[64,2],[64,2],[66,2],[64,4],[64,2],[64,2],[62,2],[64,2],[64,2],[61,2],[64,4],[61,2],[62,2],[64,4],[62,4],[61,6]],   [[61,2],[61,4],[59,2],[61,2],[59,4],[59,4],[57,2],[56,2],[57,2],[57,2],[57,4],[56,2],[54,2],[54,4],[52,2],[49,2],[52,2],[52,2],[52,2],[52,2],[52,4],[57,4],[56,8],[61,4],[59,2],[57,2],[57,4],[57,4],[56,2],[57,2],[61,2],[59,2],[57,4],[56,2],[52,2],[52,2],[52,2],[52,2],[56,2],[61,4],[59,2],[57,2],[57,2],[56,2],[57,2],[57,2],[57,4],[56,2],[57,2],[54,2],[57,2],[56,2],[57,2],[59,4],[54,2],[54,2],[57,4],[56,4],[52,6]],   [[45,2],[45,4],[44,2],[45,2],[40,4],[44,4],[45,2],[40,2],[45,2],[38,2],[40,4],[40,2],[42,2],[38,4],[40,2],[42,2],[40,2],[45,2],[44,2],[45,2],[47,4],[47,4],[52,8],[45,4],[44,2],[45,2],[50,4],[45,4],[40,2],[45,2],[42,2],[44,2],[47,4],[52,2],[49,2],[45,2],[40,2],[45,2],[40,2],[45,4],[44,2],[45,2],[45,2],[40,2],[45,2],[50,2],[45,4],[40,2],[45,2],[47,2],[49,2],[52,2],[54,2],[52,4],[54,2],[47,2],[40,4],[40,4],[45,6]]]},
  {name:'Es ist ein Ros entsprungen', tempo:1.2, src:SIA, notes:[
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
  {name:'We Three Kings', tempo:1.18, src:'Melodie geprüft mit einer MIDI-Datei (nur Melodiestimme); eigener 4-stimmiger Satz', voices:[
    [
    [71,2],[69,1],[67,2],[64,1],[66,1],[67,1],[66,1],[64,3],[71,2],[69,1],[67,2],[64,1],[66,1],[67,1],[66,1],[64,3],
    [67,2],[67,1],[69,2],[69,1],[71,2],[71,1],[74,1],[72,1],[71,1],[69,1],[71,1],[69,1],[67,2],[66,1],[64,3],
    [66,3],[69,3],[67,2],[67,1],[67,2],[62,1],[67,2],[64,1],[67,3],[67,2],[67,1],[67,2],[62,1],[67,2],[64,1],[67,3],
    [67,2],[67,1],[69,2],[71,1],[72,2],[71,1],[69,2],[71,1],[67,2],[67,1],[67,2],[62,1],[67,2],[64,1],[67,6]],
    [[67,3],[64,3],[63,3],[59,3],[67,3],[64,3],[63,3],[59,3],[62,3],[62,3],[62,3],[67,3],[64,3],[64,2],[63,1],[64,3],[62,3],[66,3],[62,3],[62,3],[64,3],[62,3],[62,3],[62,3],[64,3],[62,3],[64,3],[66,3],[64,3],[66,3],[62,3],[62,3],[60,3],[62,6]],
    [[59,3],[59,3],[57,3],[55,3],[59,3],[60,3],[59,3],[55,3],[59,3],[54,3],[55,3],[59,3],[57,3],[59,3],[55,3],[57,3],[60,3],[59,3],[55,3],[60,3],[59,3],[59,3],[55,3],[60,3],[59,3],[59,3],[62,3],[57,3],[60,3],[59,3],[55,3],[55,3],[59,6]],
    [[52,3],[52,3],[47,3],[52,3],[52,3],[48,3],[47,3],[52,3],[43,3],[50,3],[43,3],[55,3],[48,3],[47,3],[40,3],[50,3],[50,3],[43,3],[47,3],[48,3],[43,3],[55,3],[47,3],[48,3],[43,3],[52,3],[50,3],[48,3],[50,3],[43,3],[47,3],[48,3],[43,6]]]},
  // Melodie gemeinfrei (walisisch); geprüft mit einer MIDI-Datei des Auftraggebers (nur Melodiestimme), hier nach C-Dur gesetzt
  {name:'Deck the Halls', src:'Melodie geprüft mit MIDI-Datei', meter:4, pickup:0, chords:[["Cmaj7", 4], ["Am7", 4], ["Dm7", 4], ["G7", 4], ["Dm7", 4], ["Em7", 4], ["Dm7", 2], ["G7", 2], ["C6", 4], ["Cmaj7", 4], ["Am7", 4], ["Dm7", 4], ["G7", 4], ["Dm7", 4], ["Em7", 4], ["Dm7", 2], ["G7", 2], ["C6", 4], ["Dm7", 4], ["G7", 4], ["Cmaj7", 4], ["Am7", 4], ["Am7", 4], ["D7", 4], ["D7", 4], ["G7", 4], ["Cmaj7", 4], ["Am7", 4], ["Dm7", 4], ["G7", 4], ["F6", 4], ["G7", 4], ["Dm7", 2], ["G7", 2], ["C6", 4]], notes:[
    [67,3],[65,1],[64,2],[62,2],[60,2],[62,2],[64,2],[60,2],[62,1],[64,1],[65,1],[62,1],[64,3],[62,1],[60,2],[59,2],[60,4],
    [67,3],[65,1],[64,2],[62,2],[60,2],[62,2],[64,2],[60,2],[62,1],[64,1],[65,1],[62,1],[64,3],[62,1],[60,2],[59,2],[60,4],
    [62,3],[64,1],[65,2],[62,2],[64,3],[65,1],[67,2],[62,2],[64,1],[66,1],[67,2],[69,1],[71,1],[72,2],[71,2],[69,2],[67,4],
    [67,3],[65,1],[64,2],[62,2],[60,2],[62,2],[64,2],[60,2],[69,1],[69,1],[69,1],[69,1],[67,3],[65,1],[64,2],[62,2],[60,4]]},
  {name:'Good King Wenceslas', meter:4,  src:'Satz: Thomas Helmore 1853 (gemeinfrei, IMSLP), abgelesen', voices:[[[68,2],[68,2],[68,2],[70,2],[68,2],[68,2],[63,4],[65,2],[63,2],[65,2],[67,2],[68,4],[68,4],[68,2],[68,2],[68,2],[70,2],[68,2],[68,2],[63,4],[65,2],[63,2],[65,2],[67,2],[68,4],[68,4],[75,2],[73,2],[72,2],[70,2],[72,2],[70,2],[68,4],[65,2],[63,2],[65,2],[67,2],[68,4],[68,4],[63,2],[63,2],[65,2],[67,2],[68,2],[68,2],[70,4],[75,2],[73,2],[72,2],[70,2],[68,4],[73,4],[68,8]],[[63,2],[63,2],[65,2],[63,2],[63,2],[63,2],[58,2],[60,2],[61,2],[63,2],[61,2],[61,2],[63,2],[61,2],[60,4],[63,2],[63,2],[65,2],[63,2],[63,2],[63,2],[58,2],[60,2],[61,2],[63,2],[63,2],[61,2],[60,2],[61,2],[63,4],[63,2],[65,2],[67,2],[67,2],[67,2],[64,2],[63,4],[61,2],[63,2],[61,2],[61,2],[60,4],[61,2],[60,2],[58,2],[63,2],[63,2],[61,2],[60,2],[62,2],[63,4],[63,2],[65,2],[63,2],[61,2],[60,4],[65,4],[63,8]],[[60,2],[60,2],[60,2],[58,2],[60,2],[56,2],[55,4],[56,2],[56,2],[56,2],[58,2],[60,2],[58,2],[56,4],[60,2],[60,2],[61,2],[61,2],[60,2],[56,2],[55,4],[56,2],[56,2],[60,2],[58,2],[56,2],[58,2],[60,4],[56,2],[56,2],[63,2],[61,2],[60,2],[55,2],[56,4],[56,2],[56,2],[56,2],[58,2],[56,2],[55,2],[53,4],[55,2],[56,2],[60,2],[58,2],[56,2],[56,2],[55,4],[56,2],[56,2],[55,2],[55,2],[56,4],[56,4],[60,8]],[[56,2],[55,2],[53,2],[55,2],[56,2],[48,2],[51,4],[49,2],[48,2],[49,2],[46,2],[44,4],[44,4],[56,2],[55,2],[53,2],[55,2],[56,2],[48,2],[51,4],[49,2],[48,2],[49,2],[51,2],[44,4],[56,4],[48,2],[49,2],[51,2],[51,2],[52,2],[48,2],[53,2],[51,2],[49,2],[48,2],[46,2],[51,2],[53,2],[51,2],[49,4],[49,2],[48,2],[49,2],[51,2],[53,2],[53,2],[51,4],[48,2],[49,2],[51,2],[51,2],[53,2],[51,2],[49,2],[53,2],[44,8]]]},
  {name:'Joy to the World', meter:2,  tempo:1.15, src:'Lowell Mason 1839/1848 „Antioch“ (gemeinfrei)', satz:'eigener Satz (D60)', voices:[[[74,2],[73,1.5],[71,0.5],[69,3],[67,1],[66,2],[64,2],[62,3],[69,1],[71,3],[71,1],[73,3],[73,1],[74,3],[74,1],[74,1],[73,1],[71,1],[69,1],[69,1.5],[67,0.5],[66,1],[66,1],[66,1],[66,1],[66,1],[66,0.5],[67,0.5],[69,3],[67,0.5],[66,0.5],[64,1],[64,1],[64,1],[64,0.5],[66,0.5],[67,3],[66,0.5],[64,0.5],[62,1],[74,2],[71,1],[69,1.5],[67,0.5],[66,1],[67,1],[66,2],[64,2],[62,4]],   [[66,4],[66,4],[62,2],[61,2],[57,3],[62,1],[67,4],[64,4],[66,4],[66,2],[62,1],[62,1],[61,2],[62,2],[62,4],[62,4],[61,4],[61,4],[62,3],[62,1],[62,2],[62,1],[59,1],[62,2],[61,2],[57,4]],   [[57,4],[57,4],[57,2],[55,2],[54,3],[57,1],[62,4],[57,4],[57,4],[57,2],[55,1],[57,1],[55,2],[57,2],[57,4],[54,4],[55,4],[57,4],[54,3],[55,1],[54,2],[57,1],[55,1],[57,2],[55,2],[54,4]],   [[50,4],[50,4],[50,2],[45,2],[38,3],[42,1],[43,4],[45,4],[50,4],[50,2],[43,1],[42,1],[45,2],[38,2],[38,4],[38,4],[45,4],[45,4],[50,3],[43,1],[45,2],[50,1],[52,1],[45,2],[45,2],[50,4]]]},
  // Neu aus den MIDI-Dateien des Auftraggebers (D55): nur die gemeinfreien Melodien, je eine Strophe
  {name:'I Saw Three Ships', src:'Melodie aus MIDI-Datei (gemeinfrei, englisch)', notes:[
    [62,1],[67,2],[67,1],[69,2],[71,1],[74,2],[71,1],[69,2],[72,1],[71,2],[67,1],[67,2],[71,1],[69,2],[66,1],[62,2],
    [62,1],[67,2],[67,1],[69,2],[71,1],[74,2],[71,1],[69,2],[72,1],[71,2],[67,1],[67,1],[69,1],[71,1],[69,3],[67,3]]},
  {name:'Hark! The Herald Angels Sing', meter:4,  src:'Melodie aus MIDI-Datei (gemeinfrei, F. Mendelssohn Bartholdy)', satz:'eigener Satz (D60)', voices:[[[60,2],[65,2],[65,3],[64,1],[65,2],[69,2],[69,2],[67,2],[72,2],[72,2],[72,3],[70,1],[69,2],[67,2],[69,4],[60,2],[65,2],[65,3],[64,1],[65,2],[69,2],[69,2],[67,2],[72,2],[67,2],[67,3],[64,1],[64,2],[62,2],[60,4],[72,2],[72,2],[72,2],[65,2],[70,2],[69,2],[69,2],[67,2],[72,2],[72,2],[72,2],[65,2],[70,2],[69,2],[69,2],[67,2],[74,3],[74,1],[74,2],[72,2],[70,2],[69,2],[70,4],[67,2],[69,1],[70,1],[72,3],[65,1],[65,2],[67,2],[69,4],[74,3],[74,1],[74,2],[72,2],[70,2],[69,2],[70,4],[67,2],[69,1],[70,1],[72,3],[77,1],[77,2],[76,2],[77,4]],   [[60,2],[60,2],[60,4],[60,2],[60,2],[65,2],[67,2],[65,2],[64,2],[65,3],[64,1],[65,2],[64,2],[60,4],[60,2],[60,2],[60,4],[60,2],[60,2],[65,2],[64,2],[64,2],[60,2],[60,4],[60,2],[59,2],[55,4],[65,2],[65,2],[65,2],[65,2],[62,2],[65,2],[65,2],[64,2],[65,2],[65,2],[65,2],[65,2],[62,2],[65,2],[65,2],[64,2],[62,4],[62,2],[65,2],[62,2],[65,2],[65,4],[64,2],[65,2],[65,4],[62,2],[64,2],[65,4],[65,4],[70,2],[65,2],[62,2],[65,2],[65,4],[64,2],[65,2],[65,4],[65,2],[67,2],[65,4]],   [[57,2],[57,2],[57,4],[57,2],[57,2],[57,2],[60,2],[57,2],[57,2],[57,3],[60,1],[60,2],[60,2],[60,4],[57,2],[57,2],[57,4],[57,2],[57,2],[57,2],[60,2],[57,2],[55,2],[52,4],[55,2],[53,2],[52,4],[57,2],[57,2],[57,2],[57,2],[58,2],[60,2],[60,2],[60,2],[60,2],[57,2],[57,2],[57,2],[58,2],[60,2],[60,2],[60,2],[62,4],[58,2],[57,2],[58,2],[60,2],[62,4],[58,2],[60,2],[57,4],[57,2],[60,2],[60,4],[58,4],[58,2],[57,2],[58,2],[60,2],[62,4],[58,2],[60,2],[57,4],[58,2],[55,2],[57,4]],   [[53,2],[53,2],[57,4],[53,2],[53,2],[50,2],[52,2],[53,2],[57,2],[53,3],[48,1],[53,2],[48,2],[53,4],[53,2],[53,2],[57,4],[53,2],[53,2],[50,2],[52,2],[45,2],[52,2],[48,4],[48,2],[43,2],[48,4],[41,2],[41,2],[41,2],[38,2],[43,2],[41,2],[48,2],[48,2],[45,2],[41,2],[41,2],[38,2],[43,2],[41,2],[48,2],[48,2],[46,4],[43,2],[45,2],[43,2],[41,2],[46,4],[48,2],[53,2],[48,4],[50,2],[48,2],[41,4],[46,4],[43,2],[45,2],[43,2],[41,2],[46,4],[48,2],[53,2],[48,4],[50,2],[48,2],[53,4]]]},
  {name:'Kommt und lasst uns Christum ehren', src:'Melodie aus MIDI-Datei (gemeinfrei, „Quem pastores“)', notes:[
    [65,4],[69,2],[72,4],[69,2],[70,2],[72,2],[74,2],[72,4],[67,2],[69,2],[70,2],[72,2],[70,2],[69,2],[67,2],[65,4],[62,2],[64,4],[60,2],
    [69,4],[70,2],[72,4],[74,2],[72,4],[67,2],[69,4],[65,2],[70,4],[70,2],[69,2],[67,2],[65,2],[65,2],[62,2],[64,2],[65,6]]},
  {name:'God Rest Ye Merry, Gentlemen', src:'Melodie aus MIDI-Datei (gemeinfrei, englisch)', meter:4, pickup:2, chords:[["Em", 2], ["Em", 4], ["Am7", 4], ["Em", 4], ["D7", 4], ["Cmaj7", 4], ["D7", 4], ["B7", 6], ["Em", 2], ["Em", 4], ["Am7", 4], ["Em", 4], ["D7", 4], ["Cmaj7", 4], ["D7", 4], ["B7", 6], ["Em", 2], ["Am7", 4], ["D7", 4], ["Gmaj7", 4], ["Cmaj7", 4], ["Em7", 4], ["A7", 4], ["Am7", 4], ["D7", 4], ["Gmaj7", 4], ["Cmaj7", 4], ["Am7", 4], ["B7", 4], ["Em", 8], ["Am7", 4], ["D7", 4], ["Gmaj7", 4], ["Cmaj7", 4], ["Am7", 4], ["B7", 4], ["Em", 6]], notes:[
    [64,2],[64,2],[71,2],[71,2],[69,2],[67,2],[66,2],[64,2],[62,2],[64,2],[66,2],[67,2],[69,2],[71,6],
    [64,2],[64,2],[71,2],[71,2],[69,2],[67,2],[66,2],[64,2],[62,2],[64,2],[66,2],[67,2],[69,2],[71,6],
    [71,2],[72,2],[69,2],[71,2],[72,2],[74,2],[76,2],[71,2],[69,2],[67,2],[64,2],[66,2],[67,2],[69,4],[67,2],[69,2],[71,4],[72,2],[71,2],[71,2],[69,2],[67,2],[66,2],[64,4],
    [67,1],[66,1],[64,2],[69,4],[67,2],[69,2],[71,2],[72,2],[74,2],[76,2],[71,2],[69,2],[67,2],[66,2],[64,6]]},
  // Schtschedryk (Carol of the Bells), Satz M. Leontowytsch (gemeinfrei, IMSLP), abgelesen aus der PDF des Auftraggebers; ein Durchgang: T. 1–32 + 2. Klammer
  {name:'Carol of the Bells', meter:3,  src:'Satz: M. Leontowytsch „Schtschedryk“ (gemeinfrei, IMSLP), abgelesen', style:'streicher', voices:[[[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[74,2],[72,1],[74,1],[70,2],[74,2],[72,1],[74,1],[70,2],[74,2],[72,1],[74,1],[70,2],[74,2],[72,1],[74,1],[70,2],[79,2],[79,1],[79,1],[77,1],[75,1],[74,2],[74,1],[74,1],[72,1],[70,1],[72,2],[72,1],[72,1],[74,1],[72,1],[67,2],[67,1],[67,1],[67,2],[62,1],[64,1],[66,1],[67,1],[69,1],[70,1],[72,1],[74,1],[72,2],[70,2],[62,1],[64,1],[66,1],[67,1],[69,1],[70,1],[72,1],[74,1],[72,2],[70,2],[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[67,18],[74,2],[72,1],[74,1],[70,1],[0,1]],[[0,6],[0,6],[0,6],[0,6],[67,6],[65,6],[63,6],[62,6],[67,6],[65,6],[63,6],[62,6],[67,2],[67,1],[67,1],[67,2],[67,2],[67,1],[67,1],[67,2],[67,2],[67,1],[67,1],[67,2],[67,2],[67,1],[67,1],[67,2],[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[70,2],[69,1],[70,1],[67,2],[67,2],[67,1],[67,1],[67,2],[67,2],[67,1],[67,1],[67,2],[67,2],[67,1],[67,1],[67,2],[67,2],[67,1],[67,1],[67,2],[62,6],[64,2],[66,2],[67,2],[62,6],[64,2],[66,2],[67,2],[62,6],[60,6],[65,6],[63,6],[62,18],[70,2],[69,1],[70,1],[67,1],[0,1]],[[0,6],[0,6],[0,6],[0,6],[0,6],[0,6],[0,6],[0,6],[63,6],[62,6],[60,6],[55,6],[60,2],[60,1],[60,1],[60,2],[62,2],[62,1],[62,1],[62,2],[63,2],[63,1],[63,1],[63,2],[62,2],[62,1],[62,1],[62,2],[62,6],[64,6],[65,2],[63,2],[62,2],[67,1],[65,1],[63,2],[62,2],[62,2],[63,1],[63,1],[62,1],[60,1],[62,2],[62,1],[62,1],[62,2],[63,2],[63,1],[63,1],[65,1],[63,1],[62,2],[62,1],[62,1],[62,2],[58,2],[57,1],[58,1],[55,2],[58,2],[57,1],[58,1],[55,2],[58,2],[57,1],[58,1],[55,2],[58,2],[57,1],[58,1],[55,2],[55,24],[58,2],[57,1],[58,1],[55,2],[58,2],[57,1],[58,1],[55,2],[58,2],[57,1],[58,1],[55,2],[0,6]],[[0,6],[0,6],[0,6],[0,6],[0,6],[0,6],[0,6],[0,6],[0,6],[0,6],[0,6],[0,6],[51,2],[51,1],[51,1],[51,2],[55,2],[55,1],[55,1],[55,2],[60,2],[60,1],[60,1],[60,2],[55,2],[55,1],[55,1],[55,2],[55,2],[55,1],[55,1],[55,2],[55,2],[55,1],[55,1],[55,2],[55,2],[55,1],[55,1],[55,2],[55,2],[55,1],[55,1],[55,2],[58,2],[57,1],[58,1],[55,2],[58,2],[57,1],[58,1],[55,2],[58,2],[57,1],[58,1],[55,2],[58,2],[57,1],[58,1],[55,2],[50,6],[50,6],[50,6],[50,4],[51,2],[55,24],[55,18],[0,6]]]},
  // Eigene Komposition (D63): vierstimmige Fuge über „Es kommt ein Schiff geladen“ – Bauplan in tools/satz/fuge.py
  {name:'Fuge über „Es kommt ein Schiff geladen“', meter:3, tempo:1.1, src:'eigene Komposition über die Liedmelodie (gemeinfrei)', satz:'Fuge mit Cantus firmus (D63)', style:'orgel', voices:[[[0,24],[69,4],[69,2],[71,4],[71,2],[72,2],[74,2],[76,2],[76,4],[74,2],[77,4],[77,2],[72,4],[73,2],[69,2],[70,2],[69,2],[69,4],[69,2],[69,4],[65,2],[67,4],[68,2],[69,2],[71,2],[72,2],[73,4],[69,2],[69,3],[70,3],[67,3],[69,3],[70,3],[70,3],[67,3],[67,3],[65,4],[65,2],[67,4],[67,2],[69,2],[70,2],[72,2],[72,4],[70,2],[70,4],[72,2],[72,4],[72,2],[70,2],[69,2],[70,2],[69,4],[69,2],[65,4],[69,4],[72,4],[74,4],[74,4],[72,2],[70,2],[69,2],[67,2],[65,4],[67,4],[69,4],[67,4],[65,4],[64,4],[62,14]],[[62,4],[62,2],[64,4],[64,2],[65,2],[67,2],[69,2],[69,4],[67,2],[62,3],[64,1],[65,2],[67,3],[65,1],[64,2],[69,2],[67,2],[72,1],[70,1],[69,4],[70,2],[69,4],[70,1],[69,1],[67,4],[69,1],[67,1],[65,1],[64,1],[62,2],[61,2],[61,4],[61,2],[60,4],[62,2],[62,4],[64,2],[64,1],[65,1],[67,2],[67,2],[69,3],[67,1],[65,2],[65,2],[64,1],[62,3],[64,3],[65,3],[65,3],[67,2],[65,1],[64,3],[64,2],[62,1],[60,4],[62,2],[64,4],[64,2],[69,2],[67,2],[64,2],[64,4],[62,2],[63,4],[63,2],[65,4],[66,2],[62,1],[64,1],[65,2],[65,2],[66,4],[66,2],[65,4],[65,2],[61,2],[64,2],[64,2],[62,2],[62,1],[64,1],[65,2],[65,2],[65,2],[67,2],[65,1],[64,1],[62,2],[62,2],[62,2],[62,2],[64,2],[65,2],[65,2],[64,2],[62,2],[62,2],[62,2],[61,2],[61,2],[57,14]],[[0,72],[57,4],[57,2],[59,4],[59,2],[60,2],[62,2],[64,2],[64,4],[62,2],[62,3],[62,3],[60,3],[60,3],[62,3],[62,3],[60,3],[58,3],[57,4],[57,2],[60,4],[60,2],[60,2],[58,2],[57,2],[55,4],[55,2],[55,4],[55,2],[57,4],[57,2],[58,2],[60,2],[62,2],[62,4],[60,2],[57,4],[57,2],[57,2],[55,2],[57,2],[57,2],[58,2],[57,2],[57,1],[58,1],[60,2],[62,2],[62,1],[60,1],[58,2],[58,2],[57,2],[58,2],[60,2],[57,2],[57,2],[60,2],[58,2],[57,2],[57,2],[57,2],[57,2],[54,14]],[[0,48],[50,4],[50,2],[52,4],[52,2],[53,2],[55,2],[57,2],[57,4],[55,2],[53,3],[52,1],[50,2],[55,3],[53,1],[52,2],[45,2],[43,2],[48,1],[46,1],[45,4],[50,2],[50,3],[43,3],[48,3],[53,3],[46,2],[45,1],[43,3],[48,3],[48,3],[53,3],[52,1],[50,2],[48,4],[40,2],[41,2],[43,2],[45,1],[46,1],[48,4],[55,2],[51,4],[48,2],[53,3],[52,1],[50,2],[55,2],[53,2],[46,1],[48,1],[50,4],[50,2],[50,4],[50,2],[52,4],[52,2],[53,2],[55,2],[57,2],[57,4],[55,2],[50,2],[43,1],[45,1],[46,1],[48,1],[50,2],[43,2],[48,2],[53,2],[50,2],[52,2],[55,2],[50,2],[53,2],[57,2],[57,2],[50,14]]]},
  // Eigene Komposition (D65): Gigue (alter Tanz, fugiert) über „I Saw Three Ships“ – Bauplan in tools/satz/gigue.py
  {name:'Gigue über „I Saw Three Ships“', meter:3, mlabel:'6/8', tempo:.85, src:'eigene Komposition über die Liedmelodie (gemeinfrei)', satz:'Gigue, fugiert (D65)', style:'tanz', voices:[[[62,1],[67,2],[67,1],[69,2],[71,1],[74,2],[71,1],[69,2],[72,1],[71,2],[67,1],[67,3],[74,2],[76,1],[74,2],[73,1],[74,2],[74,1],[69,2],[69,1],[74,2],[73,1],[74,2],[73,1],[71,2],[72,1],[71,2],[69,1],[71,2],[72,1],[74,2],[76,1],[74,2],[72,1],[74,2],[76,1],[74,2],[76,1],[74,2],[73,1],[74,2],[74,1],[73,2],[73,1],[74,3],[74,2],[73,1],[71,2],[71,1],[72,2],[72,1],[72,2],[72,1],[74,2],[74,1],[74,2],[74,1],[76,2],[74,1],[76,5],[67,1],[72,2],[72,1],[74,2],[76,1],[79,2],[76,1],[74,2],[77,1],[76,2],[72,1],[72,3],[79,2],[72,1],[74,3],[74,2],[76,1],[74,8],[62,1],[67,2],[67,1],[69,2],[71,1],[74,2],[71,1],[69,2],[72,1],[71,2],[67,1],[67,1],[69,1],[71,1],[69,3],[67,9]],[[0,18],[57,1],[62,2],[62,1],[64,2],[66,1],[69,2],[66,1],[64,2],[67,1],[66,2],[62,1],[62,3],[71,2],[69,1],[67,2],[66,1],[67,2],[67,1],[66,2],[66,1],[67,2],[66,1],[67,2],[67,1],[66,2],[67,1],[66,2],[64,1],[66,3],[61,2],[64,1],[62,3],[62,3],[62,2],[62,1],[64,3],[64,2],[64,1],[66,3],[66,2],[66,1],[67,2],[66,1],[64,2],[64,1],[66,2],[66,1],[67,3],[67,2],[67,1],[67,3],[67,2],[65,1],[67,2],[69,1],[67,3],[67,2],[66,1],[67,3],[67,2],[67,1],[66,3],[62,2],[60,1],[62,2],[62,1],[62,2],[64,1],[62,2],[60,1],[62,2],[64,1],[66,3],[67,3],[67,3],[66,3],[62,3],[62,6]],[[0,36],[50,1],[55,2],[55,1],[57,2],[59,1],[62,2],[59,1],[57,2],[60,1],[59,2],[55,1],[55,3],[57,2],[55,1],[57,2],[59,1],[57,3],[57,2],[55,1],[57,2],[59,1],[57,3],[55,2],[54,1],[55,3],[57,2],[55,1],[57,3],[59,2],[57,1],[59,2],[59,1],[60,2],[59,1],[60,2],[62,1],[64,2],[65,1],[64,2],[62,1],[64,2],[64,1],[59,2],[59,1],[60,2],[59,1],[60,2],[60,1],[59,2],[60,1],[59,2],[57,1],[59,3],[54,3],[55,5],[55,1],[59,2],[57,1],[59,2],[60,1],[59,2],[59,1],[60,3],[55,3],[59,3],[60,3],[59,3],[59,6]],[[0,54],[45,1],[50,2],[50,1],[52,2],[54,1],[57,2],[54,1],[52,2],[55,1],[54,2],[50,1],[50,3],[55,2],[55,1],[48,2],[48,1],[45,2],[45,1],[50,2],[50,1],[47,2],[47,1],[52,2],[52,1],[45,2],[45,1],[50,2],[50,1],[48,2],[50,1],[48,2],[47,1],[48,2],[48,1],[43,8],[38,1],[43,2],[43,1],[45,2],[47,1],[50,2],[47,1],[45,2],[48,1],[47,2],[43,1],[43,3],[43,2],[42,1],[43,2],[45,1],[43,2],[43,1],[50,3],[52,3],[55,3],[50,3],[55,3],[55,6]]]},
];
MELODIES.forEach(m => { if (m.voices && !m.notes) m.notes = m.voices[0]; }); // Melodie = Sopran
// Besetzung je Lied (D55): passend zum Charakter des Stücks
const BESETZUNG = {'Stille Nacht, heilige Nacht': 'chor', 'Alle Jahre wieder': 'spieluhr', 'O Tannenbaum': 'streicher', 'Kling, Glöckchen, klingelingeling': 'bell',
  'Lasst uns froh und munter sein': 'holz', 'Jingle Bells': 'folk', 'Ihr Kinderlein kommet': 'holz', 'Leise rieselt der Schnee': 'holz', 'O du fröhliche': 'orgel',
  'Morgen kommt der Weihnachtsmann': 'spieluhr', 'We Wish You a Merry Christmas': 'folk', 'Süßer die Glocken nie klingen': 'bell', 'Macht hoch die Tür': 'blech',
  'Tochter Zion, freue dich': 'blech', 'Kommet, ihr Hirten': 'holz', 'Herbei, o ihr Gläubigen': 'chor', 'Es ist ein Ros entsprungen': 'chor', 'Zu Bethlehem geboren': 'streicher',
  'Es kommt ein Schiff geladen': 'chor', 'We Three Kings': 'streicher', 'Deck the Halls': 'folk', 'Good King Wenceslas': 'blech', 'Joy to the World': 'blech',
  'I Saw Three Ships': 'holz', 'Hark! The Herald Angels Sing': 'chor', 'Kommt und lasst uns Christum ehren': 'streicher', 'God Rest Ye Merry, Gentlemen': 'folk',};
MELODIES.forEach(m => { m.style = m.style || BESETZUNG[m.name] || 'bell'; });
const tones = m => m.notes.filter(x => x[0] > 0); // ohne Pausen – für Stationen, die Ton für Ton spielen
// Zusätzliche Fassungen nur fürs Lied-Tool (#lieder) und den Export – nicht in MELODIES, damit sich die Lied-Zuordnung der Level nicht verschiebt (D68)
const LIED_VARIANTEN = [Object.assign({}, MELODIES.find(m => m.name === 'Carol of the Bells'), {name: 'Carol of the Bells (Glockenfassung)', style: 'glocken', variante: true})];
// STUECKE-ANFANG (erzeugt von tools/satz/stuecke.py – nicht von Hand ändern)
const STUECKE = [
  {name:'Branle über „Ding Dong! Merrily on High“', meter:4, mlabel:'2/2', tempo:.95, style:'streicher', room:.16, mix:[1.4,1.05,1.05,1.1], src:'eigene Komposition (D69) über Arbeaus „Branle de l\'Official“ (Orchésographie 1589, gemeinfrei)', satz:'Branle mit Glockenkaskade, Diminutionen, Echo und Tenorlied', voices:[[[0,16],[67,2],[67,2],[69,1],[67,1],[66,1],[64,1],[62,6],[62,2],[64,2],[67,2],[67,2],[66,2],[67,4],[67,4],[67,1],[69,1],[71,1],[67,1],[69,1],[67,1],[66,1],[64,1],[62,2],[64,1],[66,1],[67,1],[66,1],[64,1],[62,1],[64,1],[66,1],[67,1],[64,1],[67,1],[66,1],[67,1],[66,1],[67,2],[71,1],[69,1],[67,4],[74,3],[72,1],[71,1],[72,1],[74,1],[71,1],[72,3],[71,1],[69,1],[71,1],[72,1],[69,1],[71,3],[69,1],[67,1],[69,1],[71,1],[67,1],[69,3],[67,1],[66,1],[67,1],[69,1],[66,1],[67,3],[66,1],[64,1],[66,1],[67,1],[64,1],[66,3],[64,1],[62,2],[62,2],[64,2],[67,2],[67,2],[66,2],[67,4],[67,4],[78,2],[74,2],[71,2],[67,2],[64,2],[67,2],[69,2],[72,2],[74,2],[79,2],[76,2],[71,2],[69,2],[64,2],[66,2],[69,2],[71,2],[76,2],[79,2],[76,2],[74,2],[69,2],[66,2],[71,2],[72,2],[76,2],[79,2],[74,2],[74,2],[71,2],[67,2],[71,2],[64,2],[67,2],[67,2],[66,2],[67,4],[67,4],[74,1],[71,1],[67,1],[71,1],[72,1],[76,1],[78,1],[74,1],[71,1],[74,1],[78,1],[74,1],[71,1],[67,1],[71,1],[74,1],[72,1],[72,1],[71,1],[67,1],[72,1],[76,1],[78,1],[74,1],[71,1],[67,1],[71,1],[74,1],[79,1],[74,1],[71,1],[67,1],[74,1],[71,1],[67,1],[71,1],[72,1],[76,1],[78,1],[74,1],[71,1],[74,1],[78,1],[74,1],[71,1],[67,1],[71,1],[74,1],[72,1],[72,1],[71,1],[67,1],[72,1],[76,1],[78,1],[74,1],[71,1],[67,1],[71,1],[74,1],[79,1],[74,1],[71,1],[67,1],[74,3],[72,1],[71,1],[72,1],[74,1],[71,1],[72,3],[71,1],[69,1],[71,1],[72,1],[69,1],[71,3],[69,1],[67,1],[69,1],[71,1],[67,1],[69,3],[67,1],[66,1],[67,1],[69,1],[66,1],[67,3],[66,1],[64,1],[66,1],[67,1],[64,1],[66,3],[64,1],[62,2],[62,2],[64,2],[67,2],[67,2],[66,2],[67,4],[67,4],[76,4],[74,4],[74,8]],[[0,16],[62,2],[62,2],[60,2],[66,2],[62,2],[62,2],[62,2],[62,2],[60,1],[62,1],[64,2],[64,2],[62,2],[62,8],[64,2],[64,2],[64,2],[62,2],[62,2],[62,2],[62,2],[62,2],[60,1],[62,1],[64,2],[64,2],[66,1],[64,1],[62,8],[0,8],[69,3],[67,1],[66,1],[67,1],[69,1],[66,1],[67,3],[66,1],[64,1],[66,1],[67,1],[64,1],[66,3],[64,1],[62,1],[64,1],[66,1],[62,1],[64,3],[62,1],[60,1],[62,1],[64,1],[60,1],[57,2],[57,2],[59,2],[59,2],[60,1],[62,1],[64,2],[64,2],[62,2],[62,7],[64,1],[66,2],[66,2],[67,3],[66,1],[64,2],[64,2],[64,3],[66,1],[67,3],[66,1],[64,2],[64,2],[64,2],[64,2],[62,2],[62,2],[67,4],[67,2],[67,2],[66,2],[66,2],[66,2],[66,2],[67,2],[67,1],[69,1],[71,2],[69,2],[67,7],[66,1],[64,2],[64,2],[64,2],[62,2],[62,8],[67,3],[66,1],[64,2],[69,2],[71,3],[71,1],[71,2],[71,2],[64,2],[64,2],[64,2],[62,1],[64,1],[62,8],[67,3],[66,1],[64,2],[69,2],[71,3],[71,1],[71,2],[71,2],[64,2],[64,2],[64,2],[62,1],[64,1],[62,8],[0,8],[69,3],[67,1],[66,1],[67,1],[69,1],[66,1],[67,3],[66,1],[64,1],[66,1],[67,1],[64,1],[66,3],[64,1],[62,1],[64,1],[66,1],[62,1],[64,3],[62,1],[60,1],[62,1],[64,1],[60,1],[57,2],[57,2],[59,2],[59,2],[60,1],[62,1],[64,2],[64,2],[62,2],[62,8],[64,4],[67,4],[67,8]],[[55,2],[50,2],[55,2],[50,2],[55,2],[50,2],[55,2],[50,2],[50,2],[50,2],[57,2],[57,2],[59,2],[59,2],[59,2],[59,2],[60,2],[59,2],[60,1],[59,1],[57,2],[59,8],[59,2],[59,2],[60,1],[59,1],[57,2],[59,2],[59,2],[59,2],[59,2],[60,2],[59,2],[55,1],[59,1],[57,2],[59,8],[0,16],[62,3],[60,1],[59,1],[60,1],[62,1],[59,1],[60,3],[59,1],[57,1],[59,1],[60,1],[57,1],[59,3],[57,1],[55,1],[57,1],[59,1],[55,1],[54,2],[54,2],[55,2],[55,2],[60,2],[59,2],[60,1],[59,1],[57,2],[59,8],[59,3],[60,1],[62,2],[62,2],[60,2],[60,2],[60,2],[60,2],[59,2],[59,2],[59,2],[59,2],[60,3],[59,1],[57,2],[57,2],[55,2],[59,2],[60,3],[59,1],[57,2],[57,2],[59,3],[57,1],[55,1],[57,1],[59,1],[60,1],[62,2],[62,1],[60,1],[59,8],[60,2],[59,2],[60,1],[59,1],[57,2],[59,7],[57,1],[55,2],[55,2],[57,1],[55,1],[54,1],[52,1],[50,6],[50,2],[52,2],[55,2],[55,2],[54,2],[55,4],[55,4],[55,2],[55,2],[57,1],[55,1],[54,1],[52,1],[50,6],[50,2],[52,2],[55,2],[55,2],[54,2],[55,4],[55,4],[59,8],[64,2],[64,2],[60,2],[60,2],[62,3],[60,1],[59,2],[59,2],[57,2],[57,2],[57,2],[57,2],[55,2],[55,2],[55,2],[55,2],[54,2],[54,2],[55,2],[55,2],[60,2],[59,2],[60,1],[59,1],[57,2],[59,7],[57,1],[55,4],[59,4],[59,8]],[[43,16],[43,4],[48,2],[50,1],[48,1],[47,3],[45,1],[43,4],[48,2],[52,1],[50,1],[48,2],[50,2],[55,7],[54,1],[52,4],[45,2],[50,1],[48,1],[47,3],[45,1],[43,4],[48,2],[52,1],[50,1],[48,2],[50,2],[43,8],[43,8],[45,4],[50,4],[55,4],[52,4],[50,4],[50,4],[55,4],[48,4],[50,4],[55,4],[52,2],[52,1],[50,1],[48,2],[50,2],[55,8],[50,3],[48,1],[47,1],[48,1],[50,1],[47,1],[48,3],[47,1],[45,1],[47,1],[48,1],[45,1],[47,3],[45,1],[43,1],[45,1],[47,1],[43,1],[45,3],[43,1],[42,1],[43,1],[45,1],[42,1],[43,3],[42,1],[40,1],[42,1],[43,1],[40,1],[42,3],[40,1],[38,2],[38,2],[40,2],[43,2],[43,2],[42,2],[43,4],[43,4],[45,2],[52,1],[50,1],[48,2],[50,2],[43,8],[43,4],[48,2],[50,1],[48,1],[47,3],[45,1],[43,4],[48,2],[52,1],[50,1],[48,2],[50,2],[43,8],[43,4],[48,2],[50,1],[48,1],[47,3],[45,1],[43,4],[48,2],[52,1],[50,1],[48,2],[50,2],[55,8],[43,3],[45,1],[47,1],[45,1],[43,1],[47,1],[45,3],[47,1],[48,1],[47,1],[45,1],[48,1],[43,4],[43,4],[50,4],[50,4],[55,4],[48,4],[50,4],[55,4],[52,2],[52,1],[50,1],[48,2],[50,2],[43,8],[48,4],[43,4],[43,8]]], dyn:[[208,224,0.7],[256,288,0.74]]},
  {name:'Weihnachts-Suite: Intrada – Branle gay – Gigue', style:'blech', src:'eigene Komposition (D69) über „Macht hoch die Tür“, „Ding Dong! Merrily on High“ und „In dulci jubilo“ (gemeinfrei)', satz:'Suite in drei Sätzen', teile:[
    {titel:'Intrada über „Macht hoch die Tür“', style:'blech', meter:3, mlabel:'3/4', tempo:1.4, percIns:'pauke', voices:[[[74,3],[74,1],[74,2],[74,3],[74,1],[71,2],[74,4],[72,2],[71,4],[69,2],[67,2],[69,2],[71,2],[69,4],[74,2],[72,4],[72,2],[71,4],[71,2],[69,2],[67,2],[69,2],[67,4],[71,2],[69,4],[69,2],[71,2],[73,2],[74,2],[74,2],[76,2],[73,2],[74,4],[0,24],[74,2],[76,4],[74,2],[76,4],[74,2],[76,2],[74,2],[72,2],[71,4],[74,2],[76,4],[74,2],[76,4],[74,2],[76,2],[74,2],[72,2],[71,4],[74,2],[67,4],[67,2],[72,4],[71,2],[69,10],[74,2],[72,4],[71,2],[69,2],[67,2],[69,2],[67,12]],[[71,3],[71,1],[71,2],[69,3],[69,1],[67,2],[67,3],[66,1],[64,1],[66,1],[67,2],[67,2],[66,2],[67,2],[66,2],[67,2],[66,2],[66,2],[66,2],[67,3],[66,1],[64,1],[66,1],[67,2],[67,2],[67,2],[66,2],[67,2],[66,2],[67,2],[67,2],[67,2],[66,2],[66,2],[66,2],[64,2],[69,2],[69,2],[71,2],[69,2],[69,2],[69,2],[69,2],[0,24],[67,2],[67,3],[69,1],[71,2],[69,4],[66,2],[64,1],[66,1],[67,2],[66,2],[67,2],[67,2],[67,2],[67,2],[67,2],[67,2],[67,2],[67,2],[66,2],[64,1],[66,1],[67,2],[66,1],[64,1],[62,2],[62,2],[62,2],[62,2],[62,2],[64,2],[64,3],[66,1],[67,1],[66,1],[64,2],[66,2],[66,2],[66,2],[66,2],[67,2],[64,3],[66,1],[67,2],[62,2],[64,2],[66,1],[64,1],[62,6],[62,6]],[[67,3],[67,1],[67,2],[66,3],[66,1],[62,1],[60,1],[59,2],[59,2],[60,2],[62,2],[62,2],[62,1],[60,1],[59,2],[62,2],[62,2],[62,2],[62,2],[62,2],[55,2],[60,2],[60,2],[62,2],[62,2],[67,2],[62,1],[60,1],[59,2],[60,2],[59,2],[59,2],[0,24],[57,2],[59,4],[57,2],[59,2],[61,2],[62,2],[62,2],[64,2],[61,2],[62,4],[59,2],[60,2],[60,2],[59,2],[60,2],[60,2],[62,1],[57,1],[55,1],[57,1],[59,2],[60,2],[62,2],[62,2],[62,2],[60,2],[60,2],[59,2],[59,2],[59,2],[59,1],[57,1],[55,1],[57,1],[59,2],[57,2],[59,2],[59,2],[59,2],[59,2],[59,2],[59,2],[60,2],[60,2],[62,2],[60,1],[59,1],[57,2],[57,2],[57,2],[57,2],[59,2],[60,4],[62,2],[57,1],[59,1],[60,2],[57,2],[59,6],[59,6]],[[43,6],[50,4],[55,2],[55,4],[57,2],[55,4],[50,2],[52,2],[50,2],[55,2],[50,6],[52,4],[57,2],[55,3],[54,1],[52,2],[54,2],[52,2],[50,2],[55,4],[0,26],[55,4],[50,2],[55,2],[57,2],[50,1],[48,1],[47,2],[52,2],[45,2],[50,4],[43,2],[48,4],[43,2],[48,4],[47,2],[48,2],[43,2],[38,2],[43,6],[48,4],[55,1],[54,1],[52,4],[47,2],[48,2],[43,2],[38,2],[43,6],[43,3],[42,1],[40,2],[45,4],[43,2],[45,2],[50,4],[50,4],[59,2],[57,4],[55,2],[54,2],[52,2],[50,2],[55,6],[55,6]]], perc:[[43,3],[43,1],[43,2],[38,3],[38,1],[0,2],[43,2],[0,2],[38,2],[43,2],[0,4],[43,2],[0,2],[38,2],[38,2],[0,4],[43,2],[0,2],[38,2],[43,2],[0,4],[43,2],[0,2],[38,2],[43,2],[0,4],[0,6],[0,6],[0,6],[0,6],[0,6],[0,6],[0,6],[0,6],[43,2],[0,2],[38,2],[43,2],[0,4],[43,2],[0,2],[38,2],[43,2],[0,4],[0,6],[0,6],[0,6],[0,6],[43,2],[0,2],[38,2],[43,2],[0,4],[43,2],[0,2],[38,2],[38,2],[0,4],[43,2],[0,2],[38,2],[43,2],[0,4],[43,0.5],[43,0.5],[43,0.5],[43,0.5],[43,0.5],[43,0.5],[43,0.5],[43,0.5],[43,0.5],[43,0.5],[43,0.5],[43,0.5],[43,2],[0,4]], dyn:[[130,154,0.68]]},
    {titel:'Branle gay (Musette) über „Ding Dong! Merrily on High“', style:'musette', meter:3, mlabel:'3/4', tempo:.75, room:.14, mix:[1.1,.75,.85,.5], voices:[[[0,12],[67,4],[67,2],[69,1],[67,1],[66,2],[64,2],[62,4],[62,2],[64,4],[67,4],[66,4],[67,6],[67,2],[69,1],[71,1],[67,2],[69,1],[67,1],[66,1],[64,1],[66,1],[64,1],[62,2],[66,1],[64,1],[62,2],[64,2],[67,1],[64,1],[67,2],[71,1],[67,1],[66,2],[64,1],[66,1],[67,6],[74,2],[72,1],[71,1],[72,1],[74,1],[72,2],[71,1],[69,1],[71,1],[72,1],[71,2],[69,1],[67,1],[69,1],[71,1],[69,2],[67,1],[66,1],[67,1],[69,1],[67,2],[66,1],[64,1],[66,1],[67,1],[66,2],[64,2],[62,2],[64,4],[67,4],[66,4],[67,6],[74,2],[72,1],[71,1],[72,1],[74,1],[72,2],[71,1],[69,1],[71,1],[72,1],[71,2],[69,1],[67,1],[69,1],[71,1],[69,2],[67,1],[66,1],[67,1],[69,1],[67,2],[66,1],[64,1],[66,1],[67,1],[66,2],[64,2],[62,2],[64,4],[67,4],[66,4],[67,6],[67,4],[67,2],[69,1],[67,1],[66,2],[64,2],[62,4],[62,2],[64,4],[67,4],[66,4],[67,6],[67,6]],[[0,12],[64,4],[64,2],[64,1],[64,1],[62,2],[60,2],[59,4],[59,2],[60,4],[64,4],[62,4],[64,6],[64,4],[64,2],[64,1],[64,1],[62,2],[60,2],[59,4],[59,2],[60,4],[64,4],[62,4],[64,6],[71,2],[69,1],[67,1],[69,1],[71,1],[69,2],[67,1],[66,1],[67,1],[69,1],[67,2],[66,1],[64,1],[66,1],[67,1],[66,2],[64,1],[62,1],[64,1],[66,1],[64,2],[62,1],[60,1],[62,1],[64,1],[62,2],[60,2],[59,2],[60,4],[64,4],[62,4],[64,6],[0,6],[69,2],[67,1],[66,1],[67,1],[69,1],[67,2],[66,1],[64,1],[66,1],[67,1],[66,2],[64,1],[62,1],[64,1],[66,1],[64,2],[62,1],[60,1],[62,1],[64,1],[62,2],[60,2],[59,2],[60,4],[64,4],[62,4],[64,6],[64,4],[64,2],[64,1],[64,1],[62,2],[60,2],[59,4],[59,2],[60,4],[64,4],[62,4],[64,6],[62,6]],[[55,6],[55,6],[59,6],[60,2],[57,4],[54,4],[55,2],[55,4],[59,2],[59,2],[57,4],[59,6],[59,6],[60,2],[57,4],[54,4],[55,2],[55,4],[59,2],[55,2],[57,4],[59,6],[55,6],[52,6],[52,6],[54,6],[60,6],[57,6],[55,4],[59,2],[59,2],[57,4],[59,6],[59,6],[60,6],[52,6],[54,6],[60,6],[57,6],[55,4],[59,2],[59,2],[57,4],[59,6],[59,6],[60,2],[57,4],[54,4],[55,2],[55,4],[59,2],[59,2],[57,4],[59,6],[59,6]],[[43,6],[43,6],[43,6],[43,6],[43,6],[48,4],[47,2],[47,2],[50,4],[43,6],[43,6],[43,6],[43,6],[48,4],[47,2],[47,2],[50,4],[43,6],[43,6],[43,6],[43,6],[43,6],[43,6],[43,6],[48,4],[47,2],[47,2],[50,4],[43,6],[43,6],[43,6],[43,6],[43,6],[43,6],[43,6],[48,4],[47,2],[47,2],[50,4],[43,6],[43,6],[43,6],[43,6],[48,4],[47,2],[47,2],[50,4],[43,6],[43,6]]], dyn:[[48,84,0.72]]},
    {titel:'Gigue über „In dulci jubilo“', style:'tanz', meter:3, mlabel:'6/8', pickup:1, tempo:.85, voices:[[[67,1],[67,2],[67,1],[71,2],[72,1],[74,2],[76,1],[74,2],[74,1],[67,2],[67,1],[71,2],[72,1],[74,2],[76,1],[74,3],[74,2],[76,1],[74,2],[76,1],[76,2],[79,1],[76,2],[76,1],[71,2],[73,1],[74,2],[76,1],[76,2],[79,1],[76,2],[76,1],[74,2],[72,1],[71,2],[71,1],[69,3],[69,2],[71,1],[71,2],[72,1],[74,2],[76,1],[74,2],[72,1],[69,2],[69,1],[71,2],[69,1],[67,2],[69,1],[69,2],[72,1],[69,2],[71,1],[69,2],[67,1],[69,2],[71,1],[69,2],[67,1],[69,2],[69,1],[71,2],[73,1],[74,2],[76,1],[76,2],[74,1],[73,2],[73,1],[71,2],[71,1],[74,2],[76,1],[69,2],[69,1],[72,2],[74,1],[67,2],[67,1],[71,2],[72,1],[66,2],[66,1],[69,2],[67,1],[67,2],[67,1],[71,2],[72,1],[74,2],[76,1],[74,2],[74,1],[67,2],[67,1],[71,2],[72,1],[74,2],[76,1],[74,3],[74,2],[76,1],[74,2],[72,1],[71,3],[67,2],[67,1],[69,2],[69,1],[71,2],[69,1],[67,2],[69,1],[71,2],[71,1],[74,2],[76,1],[74,2],[72,1],[71,3],[67,2],[67,1],[69,2],[69,1],[71,2],[69,1],[67,2],[69,1],[71,2],[0,1],[64,2],[64,1],[66,2],[66,1],[67,3],[74,3],[71,2],[71,1],[69,2],[69,1],[67,3],[67,2],[67,1],[67,2],[67,1],[71,2],[72,1],[74,2],[76,1],[74,2],[74,1],[67,2],[67,1],[71,2],[72,1],[74,2],[76,1],[74,3],[74,2],[76,1],[74,2],[72,1],[71,3],[67,2],[67,1],[69,2],[69,1],[71,2],[69,1],[67,2],[69,1],[71,2],[71,1],[74,2],[76,1],[74,2],[72,1],[71,3],[67,2],[67,1],[69,2],[69,1],[71,2],[69,1],[67,2],[69,1],[71,2],[0,1],[64,2],[64,1],[66,2],[66,1],[67,3],[74,3],[71,2],[71,1],[69,2],[69,1],[69,3],[67,2],[67,1],[71,2],[69,1],[71,2],[71,1],[72,2],[72,1],[71,2],[71,1],[64,2],[64,1],[66,2],[66,1],[67,3],[74,3],[71,2],[71,1],[69,2],[69,1],[67,3],[67,2],[0,1],[64,2],[64,1],[66,2],[66,1],[67,3],[74,3],[71,2],[71,1],[69,2],[69,1],[67,3],[67,9]],[[0,24],[62,1],[62,2],[62,1],[66,2],[67,1],[69,2],[71,1],[69,2],[69,1],[62,2],[62,1],[66,2],[67,1],[69,2],[71,1],[69,3],[66,2],[66,1],[66,2],[66,1],[64,3],[62,2],[62,1],[62,2],[62,1],[67,2],[67,1],[66,2],[67,1],[66,2],[66,1],[64,2],[64,1],[62,2],[64,1],[66,2],[67,1],[66,2],[66,1],[66,2],[66,1],[66,2],[64,1],[64,2],[62,1],[64,2],[64,1],[66,2],[66,1],[66,2],[64,1],[64,1],[66,1],[67,1],[69,2],[69,1],[66,2],[66,1],[67,2],[67,1],[64,2],[64,1],[66,2],[62,1],[62,2],[62,1],[64,2],[64,1],[66,2],[62,1],[66,1],[64,1],[62,1],[62,2],[62,1],[64,2],[64,1],[67,2],[67,1],[66,2],[66,1],[67,3],[67,1],[66,1],[64,1],[67,1],[66,1],[64,1],[66,2],[66,1],[67,2],[67,1],[67,2],[64,1],[67,5],[67,1],[64,2],[66,1],[67,2],[66,1],[67,2],[66,1],[67,2],[67,1],[67,2],[67,1],[66,2],[64,1],[63,2],[59,1],[59,2],[59,1],[60,2],[62,1],[62,2],[62,1],[59,2],[60,1],[63,2],[63,1],[60,2],[60,1],[62,2],[62,1],[64,2],[64,1],[66,2],[66,1],[67,2],[67,1],[64,2],[66,1],[62,5],[62,1],[62,2],[62,1],[67,3],[67,2],[67,1],[66,2],[66,1],[64,2],[64,1],[62,3],[62,2],[62,1],[66,2],[66,1],[71,3],[67,2],[67,1],[67,2],[67,1],[67,2],[67,1],[66,2],[66,1],[62,3],[62,2],[62,1],[62,2],[62,1],[62,2],[62,1],[66,3],[66,2],[66,1],[64,2],[64,1],[63,2],[63,1],[62,2],[59,1],[62,2],[64,1],[62,2],[62,1],[64,2],[64,1],[62,2],[62,1],[67,3],[67,2],[67,1],[62,2],[62,1],[60,2],[60,1],[62,2],[62,1],[59,2],[59,1],[62,3],[62,2],[62,1],[60,2],[60,1],[62,2],[62,1],[60,2],[60,1],[62,2],[62,1],[64,2],[64,1],[66,2],[66,1],[67,2],[67,1],[64,2],[66,1],[62,2],[62,1],[62,2],[62,1],[60,2],[60,1],[62,2],[62,1],[64,2],[64,1],[66,3],[67,3],[64,2],[66,1],[62,6],[62,6]],[[0,60],[55,1],[55,2],[55,1],[59,2],[60,1],[62,2],[64,1],[62,2],[62,1],[55,2],[55,1],[59,2],[60,1],[62,2],[64,1],[62,3],[62,2],[62,1],[62,1],[61,1],[59,1],[61,2],[62,1],[61,2],[61,1],[59,2],[59,1],[57,2],[59,1],[61,2],[62,1],[64,2],[64,1],[62,2],[59,1],[59,2],[59,1],[60,2],[60,1],[57,2],[57,1],[59,2],[55,1],[55,2],[55,1],[57,3],[57,2],[59,1],[59,2],[55,1],[55,2],[57,1],[59,2],[60,1],[57,2],[57,1],[55,3],[55,2],[60,1],[59,2],[61,1],[57,2],[57,1],[59,2],[60,1],[59,2],[57,1],[59,2],[55,1],[59,2],[59,1],[60,2],[62,1],[62,2],[62,1],[59,2],[62,1],[62,2],[59,1],[59,2],[60,1],[57,2],[57,1],[54,2],[54,1],[52,2],[55,1],[52,2],[54,1],[55,2],[54,1],[52,2],[52,1],[51,2],[51,1],[55,2],[57,1],[57,2],[59,1],[59,2],[59,1],[62,2],[62,1],[62,2],[62,1],[60,1],[59,1],[57,1],[59,5],[59,1],[59,2],[59,1],[59,2],[59,1],[59,2],[59,1],[57,3],[55,2],[55,1],[55,2],[55,1],[59,2],[60,1],[62,2],[64,1],[62,2],[62,1],[55,2],[55,1],[59,2],[60,1],[62,2],[64,1],[62,3],[62,2],[64,1],[62,2],[60,1],[59,3],[55,2],[55,1],[57,2],[57,1],[59,2],[57,1],[55,2],[57,1],[59,2],[59,1],[62,2],[64,1],[62,2],[60,1],[59,3],[55,2],[55,1],[57,2],[57,1],[59,2],[57,1],[55,2],[57,1],[59,2],[0,1],[52,2],[52,1],[54,2],[54,1],[55,3],[62,3],[59,2],[59,1],[57,2],[57,1],[55,3],[55,2],[57,1],[57,2],[59,1],[59,2],[59,1],[62,2],[62,1],[62,2],[62,1],[60,1],[59,1],[57,1],[59,5],[55,1],[55,2],[57,1],[57,2],[59,1],[59,2],[59,1],[62,3],[62,3],[60,2],[57,1],[59,6],[59,6]],[[0,84],[50,1],[50,2],[50,1],[54,2],[55,1],[57,2],[59,1],[57,2],[57,1],[50,2],[50,1],[54,2],[55,1],[57,2],[59,1],[57,3],[59,2],[59,1],[52,3],[48,2],[45,1],[50,3],[59,2],[59,1],[52,2],[52,1],[50,3],[50,2],[55,1],[55,2],[55,1],[52,2],[45,1],[43,2],[48,1],[50,2],[50,1],[52,3],[55,2],[57,1],[55,2],[49,1],[50,2],[50,1],[43,2],[48,1],[43,2],[45,1],[40,2],[40,1],[40,2],[40,1],[45,2],[50,1],[55,2],[50,1],[52,2],[50,1],[43,2],[43,1],[43,2],[48,1],[50,2],[45,1],[47,2],[47,1],[52,2],[52,1],[45,2],[50,1],[55,2],[50,1],[52,2],[48,1],[47,2],[47,1],[48,1],[47,1],[45,1],[50,1],[48,1],[47,1],[52,2],[52,1],[50,2],[50,1],[43,2],[43,1],[45,2],[50,1],[55,5],[55,1],[55,2],[55,1],[52,3],[55,2],[55,1],[50,2],[50,1],[52,2],[52,1],[55,2],[55,1],[55,2],[55,1],[50,2],[50,1],[55,2],[55,1],[55,2],[55,1],[52,2],[52,1],[52,3],[54,2],[50,1],[55,2],[55,1],[52,2],[52,1],[55,2],[55,1],[55,2],[55,1],[50,3],[47,2],[47,1],[52,2],[52,1],[47,2],[45,1],[43,2],[43,1],[40,2],[40,1],[43,2],[43,1],[48,3],[54,3],[52,2],[52,1],[55,2],[55,1],[55,2],[55,1],[45,2],[45,1],[50,2],[50,1],[43,2],[43,1],[43,3],[43,2],[43,1],[45,3],[47,2],[43,1],[48,1],[47,1],[45,1],[50,1],[48,1],[47,1],[52,2],[52,1],[50,2],[50,1],[43,2],[43,1],[45,2],[50,1],[43,2],[43,1],[43,2],[43,1],[48,1],[47,1],[45,1],[50,1],[48,1],[47,1],[52,2],[52,1],[50,3],[43,3],[45,2],[50,1],[55,6],[55,6]]], dyn:[[337,361,0.7]], wechsel:[[0,["floeteS","floeteS","gitarre","gitarre"]],[109,["mandoline","floeteS","gitarre","celloS"]],[132,["glockenS","floeteS","mandoline","celloS"]],[228,["floeteS","violineS","trompeteS","gitarre"]],[337,["spieluhrT","spieluhrT","gitarre","gitarre"]],[361,["trompeteS","violineS","bratscheS","celloS"]]]}]}];
// STUECKE-ENDE
STUECKE.forEach(m => { m.notes = m.notes || (m.teile ? m.teile[0].voices[0] : m.voices[0]); m.eigen = true; });
const ALLE_LIEDER = MELODIES.concat(LIED_VARIANTEN, STUECKE);
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
