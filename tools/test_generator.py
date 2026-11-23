"""Prüft die Level-Generatoren aller Mechaniken in Node.
Aufruf: python3 tools/test_generator.py
- Gewürzregal: Level 1–60 lösbar, Generierung schnell
- Glasur-Blech: Level 1–40 – Löser findet Lösung, Anwenden der Lösung glasiert alles
- Rezeptbuch: Level 1–30 – Folge hat richtige Länge, alle Schalen gültig
"""
import pathlib, subprocess, tempfile
root = pathlib.Path(__file__).resolve().parent.parent
src = ''.join((root / 'js' / f).read_text() + '\n' for f in ['core.js', 'regal.js', 'blech.js', 'buch.js'])
stub = "const location={hash:'',search:''},localStorage={getItem:()=>null,setItem:()=>{}},window={};\n"
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
  const sol = Blech._test.solve(state); const st = state.slice();
  sol.forEach(i => Blech._test.apply(st, i));
  worst = Math.max(worst, Date.now() - t);
  if (!st.every(v => v) || sol.length !== par) { console.log('Blech FEHLER', L); process.exit(1); }
  if (L % 8 === 0) console.log('  Blech L' + L, Math.sqrt(state.length) + 'x' + Math.sqrt(state.length), 'Bestwert', par);
}
console.log('OK Blech 1-40, langsamstes Level', worst, 'ms');
for (let L = 1; L <= 30; L++) {
  Buch._test.build(L); const c = Buch._test.levelCfg(L), seq = Buch._test.seq, pads = Buch._test.pads;
  if (seq.length !== c.T || seq.some(x => x < 0 || x >= pads.length) || pads.some(p => p.ing === undefined)) { console.log('Buch FEHLER', L); process.exit(1); }
}
console.log('OK Buch 1-30');
"""
f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False)
f.write(stub + src + test); f.close()
subprocess.run(['node', f.name], check=True)
