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
src = ''.join((root / 'js' / f).read_text() + '\n' for f in ['core.js', 'regal.js', 'blech.js', 'spritz.js', 'buch.js', 'kalender.js'])
stub = "const location={hash:'',search:''},localStorage={getItem:()=>null,setItem:()=>{}},window={},document={addEventListener(){},hidden:false,getElementById:()=>null},navigator={userAgent:'test'};\n"
test = r"""
let worst = 0;
for (let L = 1; L <= 60; L++) {
  const t = Date.now(); const s = Regal._test.generate(L); worst = Math.max(worst, Date.now() - t);
  if (s.length > Regal._test.levelCfg(L).colors + 2) console.log('Regal Notfall-Glas', L);
  if (!Regal._test.solvable(s, 1e6)) { console.log('Regal UNLÖSBAR', L); process.exit(1); }
}
console.log('OK Regal 1-60, langsamstes Level', worst, 'ms');
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
  console.log('OK Kalender: 24 Türchen, Lied des Tages überall gefunden'); }
console.log('OK', MELODIES.length, 'Melodien,', MELODIES.filter(m => m.ok !== false).length, 'aus dem Liederbuch');
"""
f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False)
f.write(stub + src + test); f.close()
subprocess.run(['node', f.name], check=True)
