// Musikdaten exportieren (D62): node tools/musik_export.js
// Schreibt nach musik/: lieder.json (Rohdaten), abc/*.abc (Notentext), midi/*.mid (mehrspurig, mit Instrumenten).
// Quelle ist immer js/core.js (MELODIES) – nach Änderungen an der Musik einfach neu ausführen.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const location = {hash: '', search: ''}, localStorage = {getItem: () => null, setItem() {}}, window = {}, document = {addEventListener() {}, hidden: false, getElementById: () => null}, navigator = {userAgent: 't'};
eval(fs.readFileSync(path.join(ROOT, 'js/core.js'), 'utf8') + ';global.MELODIES = MELODIES; global.Snd = Snd;');

const OUT = path.join(ROOT, 'musik');
for (const d of ['', 'abc', 'midi']) fs.mkdirSync(path.join(OUT, d), {recursive: true});
const slug = s => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const BASE = .2; // Sekunden pro Achtel im Spiel (× tempo des Liedes)
// General-MIDI-Instrumente je Besetzung (Programmnummer 0–127)
const GM = {bell: 9, blech: 57, brass: 57, streicher: 48, chor: 52, holz: 73, orgel: 19, spieluhr: 10, epiano: 4, bass: 32};
const VOICE = ['Sopran', 'Alt', 'Tenor', 'Bass'];

// ---------- MIDI (Typ 1) ----------
const TPQ = 480, T8 = TPQ / 2;
const vlq = n => { const b = [n & 127]; while ((n >>= 7)) b.unshift((n & 127) | 128); return b; };
const str = s => [...Buffer.from(s, 'utf8')];
function track(events, name, ch, prog) { // events: [{t (Ticks), n, len (Ticks), vel}]
  const raw = [];
  raw.push([0, [0xFF, 0x03, ...vlq(str(name).length), ...str(name)]]);
  if (ch !== 9) raw.push([0, [0xC0 | ch, prog]]);
  for (const e of events) { raw.push([e.t, [0x90 | ch, e.n, e.vel]]); raw.push([e.t + Math.max(1, e.len), [0x80 | ch, e.n, 0]]); }
  raw.sort((a, b) => a[0] - b[0] || (a[1][0] & 0xF0) - (b[1][0] & 0xF0)); // Note-aus vor Note-an zur gleichen Zeit
  const bytes = []; let last = 0;
  for (const [t, d] of raw) { bytes.push(...vlq(Math.round(t - last)), ...d); last = Math.round(t); }
  bytes.push(0, 0xFF, 0x2F, 0);
  return [...str('MTrk'), ...u32(bytes.length), ...bytes];
}
const u32 = n => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
function midiFile(tracks, usPerQuarter, title) {
  const meta = [0, 0xFF, 0x51, 3, (usPerQuarter >> 16) & 255, (usPerQuarter >> 8) & 255, usPerQuarter & 255, 0, 0xFF, 0x03, ...vlq(str(title).length), ...str(title), 0, 0xFF, 0x2F, 0];
  const head = [...str('MThd'), 0, 0, 0, 6, 0, 1, 0, tracks.length + 1, (TPQ >> 8) & 255, TPQ & 255];
  return Buffer.from([...head, ...str('MTrk'), ...u32(meta.length), ...meta, ...tracks.flat()]);
}
const notesToEv = (notes, vel) => { let t = 0; const ev = []; for (const [n, d] of notes) { if (n) ev.push({t: t * T8, n, len: d * T8 * .95, vel}); t += d; } return ev; };

// ---------- ABC ----------
const SHARP = ['C', '^C', 'D', '^D', 'E', 'F', '^F', 'G', '^G', 'A', '^A', 'B'], FLAT = ['C', '_D', 'D', '_E', 'E', 'F', '_G', 'G', '_A', 'A', '_B', 'B'];
let NAMES = FLAT;
// Schreibweise je Lied: Kreuz- oder B-Tonart (nach Häufigkeit von fis/cis gegenüber b/es)
function spelling(m) { const all = (m.voices || [m.notes]).flat().map(x => x[0] % 12), c = pc => all.filter(x => x === pc).length; NAMES = c(6) + c(1) > c(10) + c(3) ? SHARP : FLAT; }
function abcPitch(n, acc) { // acc: Vorzeichen-Zustand (gilt bis Taktstrich)
  const nm = NAMES[n % 12], letter = nm.replace(/[\^_]/, ''), want = nm.length > 1 ? nm[0] : '=';
  const cur = acc[letter + Math.floor(n / 12)] || '=';
  let s = want !== cur ? want : ''; acc[letter + Math.floor(n / 12)] = want; if (s === '=' && cur === '=') s = '';
  const oct = Math.floor(n / 12) - 1; // MIDI 60 = C4 = ABC „C“
  let L = oct >= 5 ? letter.toLowerCase() : letter;
  if (oct >= 6) L += "'".repeat(oct - 5); if (oct <= 3) L += ','.repeat(4 - oct);
  return s + L;
}
function abcDur(d) { if (d === 1) return ''; if (Number.isInteger(d)) return String(d); const f = d * 2; return Number.isInteger(f) ? `${f}/2` : `${Math.round(d * 4)}/4`; }
function abcVoice(notes, meter, pickup) {
  const bar = meter ? meter * 2 : 0; let t = 0, acc = {}, out = '', cnt = 0;
  const atBar = x => bar && x > 0 && Math.abs(((x - (pickup || 0)) % bar + bar) % bar) < 1e-9;
  for (const [n, d] of notes) {
    // Noten über den Taktstrich werden geteilt und gebunden
    let rest = d;
    while (rest > 1e-9) {
      let seg = rest;
      if (bar) { const toBar = bar - (((t - (pickup || 0)) % bar + bar) % bar || 0); const nb = t < (pickup || 0) ? (pickup - t) : toBar; if (nb > 1e-9 && seg > nb + 1e-9) seg = nb; }
      out += (n ? abcPitch(n, acc) : 'z') + abcDur(seg);
      rest -= seg; t += seg;
      if (rest > 1e-9 && n) out += '-';
      if (atBar(t)) { out += ' | '; acc = {}; if (++cnt % 4 === 0) out += '\n'; } else out += ' ';
    }
  }
  return out.trim().replace(/\|$/, '').trim() + ' |]';
}
function abcFile(m, k) {
  spelling(m);
  const meter = m.meter || null, tempoQ = Math.round(60 / (BASE * (m.tempo || 1) * 2));
  let h = `X:${k}\nT:${m.name}\n` + (m.src ? `N:${m.src}\n` : '') + (m.satz ? `N:Satz: ${m.satz}\n` : '') +
    `N:Besetzung im Spiel: ${Snd.styleName(m.style)}\nM:${m.mlabel || (meter ? meter + '/4' : 'none')}\nL:1/8\nQ:1/4=${tempoQ}\n`;
  if (m.chords) h += `N:Akkorde: ${m.chords.map(([c, d]) => `${c}(${d / 2})`).join(' ')}\n`;
  if (m.voices) {
    h += `%%score (S A) (T B)\n` + VOICE.map((v, i) => `V:${'SATB'[i]} name="${v}" clef=${i < 2 ? 'treble' : i === 2 ? 'treble-8' : 'bass'}`).join('\n') + '\nK:C\n';
    return h + m.voices.map((v, i) => `[V:${'SATB'[i]}]\n${abcVoice(v, meter, m.pickup)}`).join('\n') + '\n';
  }
  return h + 'K:C\n' + abcVoice(m.notes, meter, m.pickup) + '\n';
}

// ---------- Ausgabe ----------
const list = [];
MELODIES.forEach((m, k) => {
  const id = slug(m.name), usq = Math.round(BASE * (m.tempo || 1) * 2 * 1e6);
  let tracks;
  if (m.voices) tracks = m.voices.map((v, i) => track(notesToEv(v, i ? 80 : 96), VOICE[i], i, GM[m.style] ?? 0));
  else if (m.style === 'jazz' && m.chords) {
    const {ev} = Snd.jazzEvents(m), parts = {};
    for (const e of ev) (parts[e.part] = parts[e.part] || []).push({t: e.t * T8, n: e.n, len: e.len * T8, vel: Math.min(127, Math.round(e.vol * 520))});
    tracks = Object.entries(parts).map(([name, evs], i) => name === 'Besen' ? track(evs, name, 9, 0) : track(evs, name, i, name === 'Kontrabass' ? GM.bass : GM.epiano));
  } else tracks = [track(notesToEv(m.notes, 96), 'Melodie', 0, GM[m.style] ?? 0)];
  fs.writeFileSync(path.join(OUT, 'midi', id + '.mid'), midiFile(tracks, usq, m.name));
  fs.writeFileSync(path.join(OUT, 'abc', id + '.abc'), abcFile(m, k + 1));
  list.push({datei: id, name: m.name, quelle: m.src || null, satz: m.satz || null, besetzung: m.style, tempo: m.tempo || 1, takt: m.meter || null, auftakt: m.pickup || 0,
    akkorde: m.chords || null, melodie: m.notes, stimmen: m.voices || null});
});
fs.writeFileSync(path.join(OUT, 'lieder.json'), JSON.stringify({format: 'Noten als [MIDI-Tonhöhe, Dauer in Achteln]; 60 = c′ (C4); 0 = Pause. Grundtempo 0,2 s je Achtel × tempo.', lieder: list}, null, 1));
console.log(`OK ${list.length} Lieder → musik/abc, musik/midi, musik/lieder.json`);
