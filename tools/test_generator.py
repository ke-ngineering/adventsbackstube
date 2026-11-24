"""Prüft die Level-Generatoren aller Mechaniken in Node.
Aufruf: python3 tools/test_generator.py
- Gewürzregal: Level 1–60 lösbar, Generierung schnell
- Glasur-Blech: Level 1–40 – Löser findet Lösung, Anwenden der Lösung glasiert alles
- Lernhilfe: löst Blech 1–40 bis zum Ende
- Spritzbeutel: Level 1–40 – Weg gültig, genug Punkte
- Rezeptbuch: Level 1–30 – Folge hat richtige Länge, alle Schalen gültig
"""
import pathlib, subprocess, tempfile
root = pathlib.Path(__file__).resolve().parent.parent
src = ''.join((root / 'js' / f).read_text() + '\n' for f in ['core.js', 'regal.js', 'blech.js', 'spritz.js', 'licht.js', 'buch.js', 'aus.js', 'streu.js', 'schlitten.js', 'rezepte.js', 'advent.js', 'kekse.js', 'kalender.js'])
stub = "const location={hash:'',search:''},localStorage={getItem:()=>null,setItem:()=>{}},window={},document={addEventListener(){},hidden:false,getElementById:()=>null},navigator={userAgent:'test'};\n"
test = r"""
let worst = 0;
for (let L = 1; L <= 60; L++) {
  const t = Date.now(); const s = Regal._test.generate(L).s; worst = Math.max(worst, Date.now() - t);
  if (s.length > Regal._test.levelCfg(L).colors + 2) console.log('Regal Notfall-Glas', L);
  if (!Regal._test.solvable(s, 1e6)) { console.log('Regal UNLÖSBAR', L); process.exit(1); }
}
console.log('OK Regal 1-60, langsamstes Level', worst, 'ms');
// Wendungen und Tagesrätsel des Regals
for (let L = 6; L <= 40; L += 4) { const pl = Object.assign(Regal._test.planFor(L), {eis: [[L % 3, 1 + L % 2]]}); const g = Regal._test.generate(L, pl);
  if (!Regal._test.solvable(g.s, 1e6, g.eis)) { console.log('Regal Eis UNLÖSBAR', L); process.exit(1); } }
for (let d = 1; d <= 24; d++) for (const q of (ADVENT[d].special.game === 'kette' ? ADVENT[d].special.spec.parts : [ADVENT[d].special])) if (q.game === 'regal') {
  const pl = Regal._test.planFor(1000 + d * 10, q.spec), g = Regal._test.generate(0, pl);
  if (g.s.length > pl.colors + pl.spare || !Regal._test.solvable(g.s, 1e6, g.eis)) { console.log('Regal-Tagesrätsel UNLÖSBAR/Notfall', d); process.exit(1); }
  console.log('OK Regal-Tagesrätsel Türchen', d, '–', ADVENT[d].special.title, pl.colors, 'Zutaten');
}
worst = 0;
for (let L = 1; L <= 40; L++) {
  const t = Date.now(); const {state, par} = Blech._test.generate(L);
  const sol = Blech._test.solve(state); const st = state.slice(); const cfg = Blech._test.levelCfg(L);
  sol.forEach(i => Blech._test.apply(st, i));
  worst = Math.max(worst, Date.now() - t);
  if (!st.every(v => v) || sol.length > par) { console.log('Blech FEHLER', L); process.exit(1); }
  if (L <= 16 || L % 8 === 0) console.log('  Blech L' + L, cfg.R + 'x' + cfg.C, cfg.mode.padEnd(4), 'Ziel', par, '/ Minimum', sol.length, '–', cfg.title);
}
console.log('OK Blech 1-40, langsamstes Level', worst, 'ms');
for (let L = 1; L <= 40; L++) { const n = Blech._test.coachSolve(L); if (n < 0) { console.log('Lernhilfe (Jagd + Rest-Trick) löst Blech nicht in Zielzahl', L, n); process.exit(1); } if (L % 10 === 0) console.log('  Lernhilfe L' + L, n, 'Züge'); }
console.log('OK Lernhilfe (Jagd + Rest-Trick) löst jedes Blech 1-40 genau in der Zielzahl');
for (let L = 1; L <= 40; L++) {
  const {R, C, path} = Spritz._test.generate(L), cfg = Spritz._test.levelCfg(L);
  const ok = new Set(path).size === path.length && path.every((p, k) => !k || (Math.abs(p - path[k-1]) === C) || (Math.abs(p - path[k-1]) === 1 && Math.floor(p / C) === Math.floor(path[k-1] / C)));
  if (!ok || path.length < Math.ceil(R * C * cfg.cover)) { console.log('Spritz FEHLER', L, path.length, R * C); process.exit(1); }
  if (L % 10 === 0) console.log('  Spritz L' + L, R + 'x' + C, path.length, 'Punkte');
}
console.log('OK Spritz 1-40');
for (let L = 1; L <= 60; L++) {
  Buch._test.build(L); const c = Buch._test.levelCfg(L), seq = Buch._test.seq, pads = Buch._test.pads;
  if (seq.length > c.T || seq.length < 5 || seq.some(x => x < 0 || x >= pads.length) || pads.some(p => p.ing === undefined)) { console.log('Buch FEHLER', L); process.exit(1); }
}
console.log('OK Buch 1-60');
for (const m of MELODIES) {
  const t = tones(m); if (t.length < 8 || m.notes.some(([n, d]) => !(d > 0) || (n && (n < 55 || n > 84)))) { console.log('Melodie FEHLER', m.name); process.exit(1); }
  const pads = new Set(t.slice(0, 18).map(x => x[0])).size; if (pads > 8) { console.log('Zu viele Schalen fürs Rezeptbuch', m.name, pads); process.exit(1); }
}
for (const m of MELODIES.filter(m => m.voices)) {
  const len = m.voices.map(v => v.reduce((a, n) => a + n[1], 0));
  if (len.some(l => l !== len[0])) { console.log('Stimmen ungleich lang', m.name, len); process.exit(1); }
  // pro Achtel prüfen: Stimmen kreuzen nicht (S >= A >= T >= B)
  const at = (v, t) => { let s = 0; for (const [n, d] of v) { if (t < s + d) return n; s += d; } return 0; };
  const cross = new Set();
  for (let t = 0; t < len[0]; t += .5) { const p = m.voices.map(v => at(v, t)); for (let k = 1; k < 4; k++) if (p[k] && p[k - 1] && p[k] > p[k - 1]) cross.add('Takt ' + (Math.floor(t / 8) % 16 + 1)); }
  if (cross.size) console.log('  Hinweis Stimmkreuzung (im Notenbild prüfen):', m.name, [...cross].join(', '));
  console.log('OK vierstimmig:', m.name, len[0] / 8, 'Takte');
}
{ const P = Kalender._test.PLAN, O = Kalender._test.ORDER;
  if (P.length !== 25 || new Set(O).size !== 24 || O.some(d => d < 1 || d > 24)) { console.log('Kalender FEHLER'); process.exit(1); }
  for (let d = 1; d <= 24; d++) { const s = Kalender._test.songOfDay(d), want = Kalender._test.SONG_DAYS[d]; if (!s || s.name !== want) { console.log('Lied des Tages nicht gefunden', d, want); process.exit(1); } }
  for (const p of P.slice(1)) if (p.recipe && !RECIPES[p.recipe]) { console.log('Rezept fehlt', p.recipe); process.exit(1); }
  for (const p of P.slice(1)) if (!COOKIES[p.cookie]) { console.log('Plätzchen fehlt', p.cookie); process.exit(1); }
  console.log('OK Kalender: 24 Türchen, Lied des Tages überall gefunden, Rezepte vorhanden'); }
{ const st = {level: 7, best: {1: 3}, sound: false, games: {blech: {level: 4, best: {}, cards: {a: 1}}}, cal: {active: null, days: {1: {opened: true, done: {regal: 2}, finished: true}}}, notiz: 'Grüße – äöü ß ★'};
  const c = Backup.code(st), r = Backup.read(' ' + c.slice(0, 20) + '\n' + c.slice(20) + ' ');
  if (!r.ok || JSON.stringify(r.save) !== JSON.stringify(st)) { console.log('Sicherungscode FEHLER', r); process.exit(1); }
  const bad = c.slice(0, 10) + (c[10] === 'A' ? 'B' : 'A') + c.slice(11);
  if (Backup.read(bad).ok || Backup.read('hallo').ok || Backup.read('').ok) { console.log('Sicherungscode erkennt Fehler nicht'); process.exit(1); }
  console.log('OK Sicherungscode: hin und zurück, Umlaute, Tippfehler erkannt,', c.length, 'Zeichen'); }
// Tagesrätsel aller Spiele: lösbar und angemessen
{ const parts = []; for (let d = 1; d <= 24; d++) { const sp = ADVENT[d].special; (sp.game === 'kette' ? sp.spec.parts : [sp]).forEach(q => parts.push([d, q])); }
  for (const [d, q] of parts) {
    if (q.game === 'blech') { const g = Blech._test.generate(0, q.spec), st = g.state.slice(), sol = Blech._test.solve(st); sol.forEach(i => Blech._test.apply(st, i));
      if (!st.every(v => v) || sol.length !== g.par) { console.log('Blech-Tagesrätsel FEHLER', d); process.exit(1); } console.log('OK Blech-Tagesrätsel Türchen', d, q.spec.shape, 'kürzeste Lösung', g.par); }
    if (q.game === 'spritz') { const g = Spritz._test.generate(0, q.spec), p = g.path, C = g.C;
      const ok = new Set(p).size === p.length && p.every((x, i) => !i || Math.abs(x - p[i - 1]) === C || (Math.abs(x - p[i - 1]) === 1 && Math.floor(x / C) === Math.floor(p[i - 1] / C)));
      const cells = Spritz._test.MOTIFS[q.spec.motif] ? Spritz._test.MOTIFS[q.spec.motif].join('').split('').filter(c => c === 'X').length : g.R * g.C;
      if (!ok || p.length < cells * .8) { console.log('Spritz-Tagesrätsel FEHLER', d, p.length, cells); process.exit(1); }
      if (q.spec.kirschen) { const k = Spritz._test.cherries(p, q.spec.kirschen, q.spec.seed), order = Object.keys(k).map(Number).sort((a, b) => p.indexOf(a) - p.indexOf(b)).map(c => k[c]);
        if (order.join() !== [...Array(order.length)].map((_, i) => i + 1).join() || order.length < 3) { console.log('Kirschen FEHLER', d, order); process.exit(1); } }
      console.log('OK Spritz-Tagesrätsel Türchen', d, q.spec.motif, p.length, 'von', cells, 'Feldern'); }
  }
  for (let L = 4; L <= 40; L += 2) { const p = Spritz._test.generate(L).path, k = Spritz._test.cherries(p, 3 + L % 3, L); if (Object.keys(k).length < 3) { console.log('Kirschen zu wenige', L); process.exit(1); } }
  console.log('OK Kirschen-Level 4–40');
}
// Lichterkette: Lösung (Ausgangsstellung) lässt alle Lämpchen leuchten, verdrehter Start nicht
{ const chk = (g, tag) => { const pw = Licht._test.powered(g.sol, g.R, g.C, g.mask, g.plugs, g.col).on, pw0 = Licht._test.powered(g.state, g.R, g.C, g.mask, g.plugs, g.col).on;
    if (!g.lamps.every(i => pw[i] >= 0) || g.lamps.every(i => pw0[i] >= 0)) { console.log('Lichterkette FEHLER', tag); process.exit(1); } };
  for (let L = 1; L <= 40; L++) chk(Licht._test.generate(L), 'L' + L);
  for (let d = 1; d <= 24; d++) { const sp = ADVENT[d].special; (sp.game === 'kette' ? sp.spec.parts : [sp]).filter(q => q.game === 'licht').forEach(q => { const g = Licht._test.generate(0, q.spec); chk(g, 'Türchen ' + d); console.log('OK Lichterkette-Tagesrätsel Türchen', d, q.spec.motif, g.lamps.length, 'Lämpchen', g.col ? '(bunt)' : ''); }); }
  console.log('OK Lichterkette 1-40'); }
// Ausstecher: Formen ergeben zusammen genau die Teigplatte (Lösung = Heimatplätze)
{ const chk = (g, tag) => { const o = Array(g.R * g.C).fill(0);
    for (const s of g.shapes) { let c = s.cells; let ok = false; for (let k = 0; k < 4; k++) { if (JSON.stringify(c) === JSON.stringify(s.home)) ok = true; c = Aus._test.turn(c); } if (!ok) { console.log('Ausstecher Form nicht drehbar', tag); process.exit(1); }
      s.home.forEach(([r, c2]) => o[(s.at[0] + r) * g.C + s.at[1] + c2]++); if (s.home.length < 3 || s.home.length > 5) { console.log('Ausstecher Formgröße', tag); process.exit(1); } }
    if (!g.mask.every((m, i) => m ? o[i] === 1 : o[i] === 0)) { console.log('Ausstecher FEHLER', tag); process.exit(1); } return g.shapes.length; };
  for (let L = 1; L <= 40; L++) chk(Aus._test.generate(L), 'L' + L);
  for (let d = 1; d <= 24; d++) { const sp = ADVENT[d].special; (sp.game === 'kette' ? sp.spec.parts : [sp]).filter(q => q.game === 'aus').forEach(q => console.log('OK Ausstecher-Tagesrätsel Türchen', d, q.spec.motif, chk(Aus._test.generate(0, q.spec), 'Türchen ' + d), 'Formen')); }
  console.log('OK Ausstecher 1-40'); }
// Zuckerstreusel: jedes Bild ohne Raten eindeutig lösbar
{ for (const id in Streu._test.PICS) { const rows = Streu._test.PICS[id][1].split('|'); if (!rows.every(r => r.length === rows[0].length)) { console.log('Streusel-Bild ungleich breit', id); process.exit(1); } }
  for (let L = 1; L <= 30; L++) { const P = Streu._test.generate(L); if (!Streu._test.unique(P.sol, P.R, P.C)) { console.log('Streusel nicht eindeutig', L, P.name); process.exit(1); } }
  for (const id in Streu._test.PICS) { const P = Streu._test.generate(0, {motif: id}); if (!Streu._test.unique(P.sol, P.R, P.C)) { console.log('Streusel-Bild nicht eindeutig', id); process.exit(1); } }
  for (let d = 1; d <= 24; d++) { const sp = ADVENT[d].special; (sp.game === 'kette' ? sp.spec.parts : [sp]).filter(q => q.game === 'streu').forEach(q => { if (!Streu._test.PICS[q.spec.motif]) { console.log('Streusel-Motiv fehlt', d); process.exit(1); } console.log('OK Streusel-Tagesrätsel Türchen', d, Streu._test.PICS[q.spec.motif][0]); }); }
  console.log('OK Zuckerstreusel: alle Bilder und Level 1-30 eindeutig ohne Raten'); }
// Marktschlitten: kürzester Weg stimmt mit Löser überein, Zeit pro Level
{ let worst = 0; const rep = [];
  const chk = (g, tag) => { const p = Schlitten._test.solveFrom(g.V, g.start); if (!p || p.length !== g.min) { console.log('Marktschlitten FEHLER', tag, g.min, p && p.length); process.exit(1); } };
  for (let L = 1; L <= 30; L++) { const t = Date.now(), g = Schlitten._test.generate(L); worst = Math.max(worst, Date.now() - t); chk(g, 'L' + L); if (L % 5 === 0) rep.push(`L${L}:${g.min}`); }
  for (let d = 1; d <= 24; d++) { const sp = ADVENT[d].special; (sp.game === 'kette' ? sp.spec.parts : [sp]).filter(q => q.game === 'schlitten').forEach(q => { const t = Date.now(), g = Schlitten._test.generate(0, q.spec); chk(g, 'Türchen ' + d); console.log('OK Marktschlitten-Tagesrätsel Türchen', d, g.min, 'Züge (Ziel', q.spec.min + ')', Date.now() - t, 'ms'); }); }
  console.log('OK Marktschlitten 1-30, kürzeste Wege', rep.join(' '), '· langsamstes Level', worst, 'ms'); }
console.log('OK', MELODIES.length, 'Melodien,', MELODIES.filter(m => m.ok !== false).length, 'geprüft (Liederbuch oder MIDI),', MELODIES.filter(m => m.ok === false).length, 'noch zu prüfen');
"""
f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False)
f.write(stub + src + test); f.close()
subprocess.run(['node', f.name], check=True)
