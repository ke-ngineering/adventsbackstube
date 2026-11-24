/* Adventsbackstube – gemeinsame Grundlagen: Spielstand, Zutaten, Klang, Melodien, Hilfsfunktionen.
   Wird von allen Spiel-Modulen (regal.js, blech.js, buch.js) und app.js genutzt. */
const VERSION = 'v19.1';
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
      if (!master) { master = ctx.createGain(); master.gain.value = .7; master.connect(ctx.destination); }
      if (ctx.state !== 'running') { const pr = ctx.resume(); if (pr && pr.catch) pr.catch(() => {}); } // WebKit kennt auch 'interrupted'
    } catch (e) { return ctx; }
    return ctx;
  };
  // Bei jedem Antippen: Ton freischalten (stiller Puffer) – hilft Safari/iOS. Hängt er danach noch, beim nächsten Klick neu anlegen.
  const unlock = () => {
    const c = ensure(); if (!c) return;
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
  function bell(n, t, len) {
    const f = hz(n);
    [[1, .32], [2.76, .08], [5.4, .03]].forEach(([m, v]) => {
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
  // Stil → Instrument je Stimme (Sopran, Alt, Tenor, Bass) und Lautstärke
  const STYLE = {
    bell: {v: ['bell'], name: 'Glockenspiel'}, blech: {v: ['brass'], name: 'Posaunenchor'}, brass: {v: ['brass'], name: 'Posaunenchor'},
    streicher: {v: ['streicher'], name: 'Streichquartett'}, chor: {v: ['chor'], name: 'Chor'}, holz: {v: ['holz'], name: 'Flöten'},
    orgel: {v: ['orgel'], name: 'Orgel'}, epiano: {v: ['epiano'], name: 'E-Piano'}, spieluhr: {v: ['spieluhr'], name: 'Spieluhr'}, jazz: {v: ['epiano', 'epiano', 'epiano', 'bass'], name: 'Jazz-Trio', swing: true},
  };
  const styleOf = s => STYLE[s] || STYLE.bell;
  const swingT = (t8, tempo) => { const beat = Math.floor(t8 / 2), off = t8 - beat * 2; return (beat * 2 + (off >= 1 ? 1.34 + (off - 1) * .66 : off * 1.34)) * tempo; };
  // Mehrstimmig: jede Stimme in Originallage, Sopran etwas lauter
  function choir(voices, tempo = .2, style = 'blech') {
    const c = ensure(); if (!c) return 0; const t0 = c.currentTime + .05, st = styleOf(style); let end = 0;
    voices.forEach((v, k) => {
      const ins = INSTR[st.v[Math.min(k, st.v.length - 1)]], lead = k === 0;
      let p = 0;
      for (const [n, d] of v) {
        const ta = t0 + (st.swing ? swingT(p, tempo) : p * tempo), tb = t0 + (st.swing ? swingT(p + d, tempo) : (p + d) * tempo);
        if (n) { const nn = style === 'blech' || style === 'brass' ? n + 12 : n; ins === INSTR.brass ? ins(nn, ta, (tb - ta) * .94, lead ? .14 : .09) : ins(nn, ta, (tb - ta) * .94, ins === INSTR.bass ? .3 : lead ? undefined : (st.v[0] === 'orgel' ? .045 : .07)); }
        p += d;
      }
      end = Math.max(end, t0 + p * tempo);
    });
    if (st.swing) for (let b = 0; t0 + b * tempo * 2 < end; b++) besen(t0 + b * tempo * 2 + (b % 2 ? .0 : .01));
    return end - c.currentTime;
  }
  function phrase(notes, voice = 'bell', tempo = .17) {
    const c = ensure(); if (!c) return 0; const t0 = c.currentTime + .05, st = styleOf(voice), ins = INSTR[st.v[0]];
    let p = 0;
    for (const [n, d] of notes) {
      const ta = t0 + (st.swing ? swingT(p, tempo) : p * tempo), tb = t0 + (st.swing ? swingT(p + d, tempo) : (p + d) * tempo);
      if (n) ins(n, ta, (tb - ta) * .92);
      p += d;
    }
    if (st.swing) { for (let b = 0; b * 2 < p; b++) besen(t0 + b * tempo * 2); bassLine(notes, t0, tempo); }
    return t0 + p * tempo - c.currentTime;
  }
  /* Jazz-Trio (D60): Melodie auf dem E-Piano, Begleitakkorde (Terz + Septime + None) im Charleston-Rhythmus,
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
  // Arrangement als Ereignisliste (Zeiten in Achteln, geswingt) – fürs Abspielen und für den MIDI-Export
  function jazzEvents(m) {
    const meter = m.meter || 4, pk = m.pickup || 0, ev = [], S = x => swingT(x, 1);
    let p = 0; for (const [n, d] of m.notes) { if (n) ev.push({i: 'epiano', n, t: S(p), len: (S(p + d) - S(p)) * .9, vol: .17, part: 'Melodie'}); p += d; }
    const total = p, segs = []; let q = 0; for (const [sym, d] of m.chords) { segs.push({a: q, b: q + d, c: chordOf(sym)}); q += d; }
    const segAt = x => segs.find(g => x >= g.a && x < g.b) || segs[segs.length - 1];
    // Walking Bass (Viertel = 2 Achtel)
    let last = 43;
    for (let x = 0; x < total; x += 2) {
      const g = segAt(x), nx = segAt(x + 2), first = x === g.a || x === 0, beforeNew = x + 2 < total && nx !== g;
      let n;
      if (first) n = near(g.c.bass, last);
      else if (beforeNew) { const target = near(nx.c.bass, last); n = target + (last >= target ? 1 : -1); }
      else { const opts = [g.c.tones[2], g.c.tones[1], (g.c.root + 9) % 12].map(pc => near(pc, last)); n = opts[(x / 2) % opts.length]; }
      while (n < 36) n += 12; while (n > 52) n -= 12;
      if (meter === 3 && !first && ((x - pk) / 2) % 3 === 1) continue; // Walzer: Bass auf 1 und 3
      ev.push({i: 'bass', n, t: x, len: meter === 3 && first ? 3.4 : 1.8, vol: .28, part: 'Kontrabass'}); last = n;
    }
    // Begleitung: Charleston (1 und 2+) bzw. Walzer (2 und 3); Besen: jede Viertel leise, 2 und 4 betont
    for (let bar = pk ? pk - meter * 2 : 0; bar < total; bar += meter * 2) {
      const hits = meter === 3 ? [[2, 1.6], [4, 1.6]] : [[0, 2.6], [3, 1.2]];
      for (const [off, len] of hits) {
        const x = bar + off; if (x < 0 || x >= total) continue; const g = segAt(x);
        g.c.guide.forEach(pc => ev.push({i: 'epiano', n: near(pc, 60), t: S(x), len, vol: .06, part: 'Begleitung'}));
      }
      for (let b = 0; b < meter; b++) { const x = bar + b * 2; if (x < 0 || x >= total) continue; ev.push({i: 'besen', n: 38, t: x, len: .5, vol: (meter === 4 ? b % 2 === 1 : b > 0) ? .16 : .07, part: 'Besen'}); }
    }
    return {ev, total};
  }
  function jazz(m, tempo) {
    const c = ensure(); if (!c) return 0; const t0 = c.currentTime + .08, {ev, total} = jazzEvents(m);
    for (const e of ev) { const t = t0 + e.t * tempo; if (e.i === 'besen') besen(t, e.vol); else INSTR[e.i](e.n, t, e.len * tempo, e.vol); }
    return t0 + total * tempo - c.currentTime + .5;
  }
  // Ein Lied in seiner Besetzung abspielen (Grundtempo × eigenes Tempo des Liedes)
  function song(m, base = .2, kurz = false) {
    const tempo = base * (m.tempo || 1);
    if (kurz) return phrase(m.notes.slice(0, 24), m.style === 'jazz' ? 'epiano' : m.style, tempo);
    if (m.voices) return choir(m.voices, tempo, m.style);
    if (m.style === 'jazz' && m.chords) return jazz(m, tempo);
    return phrase(m.notes, m.style, tempo);
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
  return {tap, pour, nope, note, phrase, choir, song, jazzEvents, stop, toggle, styleName: s => styleOf(s).name, get state() { return ctx ? ctx.state : 'noch nicht gestartet'; }, ensure, get on() { return on; }};
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
];
MELODIES.forEach(m => { if (m.voices && !m.notes) m.notes = m.voices[0]; }); // Melodie = Sopran
// Besetzung je Lied (D55): passend zum Charakter des Stücks
const BESETZUNG = {'Stille Nacht, heilige Nacht': 'chor', 'Alle Jahre wieder': 'spieluhr', 'O Tannenbaum': 'streicher', 'Kling, Glöckchen, klingelingeling': 'bell',
  'Lasst uns froh und munter sein': 'holz', 'Jingle Bells': 'jazz', 'Ihr Kinderlein kommet': 'holz', 'Leise rieselt der Schnee': 'holz', 'O du fröhliche': 'orgel',
  'Morgen kommt der Weihnachtsmann': 'spieluhr', 'We Wish You a Merry Christmas': 'jazz', 'Süßer die Glocken nie klingen': 'bell', 'Macht hoch die Tür': 'blech',
  'Tochter Zion, freue dich': 'blech', 'Kommet, ihr Hirten': 'holz', 'Herbei, o ihr Gläubigen': 'chor', 'Es ist ein Ros entsprungen': 'chor', 'Zu Bethlehem geboren': 'streicher',
  'Es kommt ein Schiff geladen': 'chor', 'We Three Kings': 'streicher', 'Deck the Halls': 'jazz', 'Good King Wenceslas': 'blech', 'Joy to the World': 'blech',
  'I Saw Three Ships': 'holz', 'Hark! The Herald Angels Sing': 'chor', 'Kommt und lasst uns Christum ehren': 'streicher', 'God Rest Ye Merry, Gentlemen': 'jazz',};
MELODIES.forEach(m => { m.style = m.style || BESETZUNG[m.name] || 'bell'; });
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
