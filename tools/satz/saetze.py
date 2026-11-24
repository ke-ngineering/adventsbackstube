"""Akkordpläne für die eigenen vierstimmigen Sätze (D60). Aufruf: python3 tools/satz/saetze.py → gibt JS-Zeilen aus."""
import json, subprocess, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from satz import harmonize, parse, report
H = os.path.dirname(__file__)
def mel(name): return json.loads(subprocess.check_output(['node', H + '/melodie.js', name]))
def bars(spec):  # "D:4 G:4 | ..." → [[sym, dur]]
    out = []
    for tok in spec.replace('|', ' ').split():
        s, d = tok.rsplit(':', 1); out.append([s, float(d) if '.' in d else int(d)])
    return out
PLANS = {
 # O du fröhliche (D-Dur), festlicher Orgelsatz
 'O du fröhliche': '''D:4 G:4 | D:4 D:2 A7:2 | D:4 G:4 | D:4 D:2 A7:2 | D:4 F#m:4 | G:4 A:2 D:2 | A/E:4 E7:4 | A:8 |
   A7:4 D:4 | G:4 A7:4 | D:4 D:2 A7:2 | D:4 D:4 | D:2 A:2 Bm:2 D/F#:2 | G:4 D/A:2 A7:2 | D:4 A7:4 | D:8''',
 # Herbei, o ihr Gläubigen (A-Dur, Auftakt)
 'Herbei, o ihr Gläubigen': '''A:2 | A:4 E/G#:2 A:2 | E:4 E/G#:4 | A:2 E:2 A:2 D:2 | A/E:4 E:2 F#m:2 | D:4 E:2 F#m:2 | E:2 A:2 E/G#:2 A:2 |
   E/B:4 B7:4 | E:8 | A:4 E7/G#:2 A:2 | D:4 A:4 | E:2 A:2 F#m:2 E/G#:2 | B7:4 E:2 A/C#:2 | A:2 E:2 A:2 E:2 | A:4 E/G#:2 A:2 |
   A:2 E:2 A:2 D:2 | A:4 E:2 A:2 | Bm:2 A/C#:2 E:2 F#m:2 | E:4 F#m:2 Bm:2 | A/E:4 E7:4 | A:6''',
 # Hark! The Herald Angels Sing (F-Dur), Satz im Stil Mendelssohns
 'Hark! The Herald Angels Sing': '''F:2 F:2 F/A:4 | F:2 F:2 Dm:2 C/E:2 | F:2 Am:2 F:3 C7:1 | F:2 C:2 F:4 |
   F:2 F:2 F/A:4 | F:2 F:2 Dm:2 C/E:2 | Am:2 C/E:2 C:4 | C:2 G7:2 C:4 |
   F:2 F:2 F:2 Dm:2 | Gm:2 F:2 F/C:2 C:2 | F/A:2 F:2 F:2 Dm:2 | Gm:2 F:2 F/C:2 C:2 |
   Bb:4 Gm:2 F/A:2 | Gm:2 F:2 Bb:4 | C7:2 F:2 F/C:4 | Dm:2 C:2 F:4 |
   Bb:4 Gm:2 F/A:2 | Gm:2 F:2 Bb:4 | C7:2 F:2 F/C:4 | Bb/D:2 C:2 F:4''',
  # Stille Nacht (C-Dur, 6/8) – schlichter Chorsatz für Heiligabend
 'Stille Nacht, heilige Nacht': '''C:6 | C:6 | C:6 | C:6 | G:6 | G7:6 | C:6 | C:6 | F:6 | F:4 F/A:2 | C:6 | C:6 | F:6 | F:4 F/A:2 | C:6 | C:6 |
   G:6 | G7:6 | C/E:6 | C:6 | C:6 | G7:6 | C:12''',
  # Joy to the World (D-Dur, 2/4) – Posaunenchor
 'Joy to the World': '''D:4 | D:4 | D:2 A7:2 | D:3 D/F#:1 | G:4 | A:4 | D:4 | D:2 G:1 D/F#:1 | A7:2 D:2 | D:4 | D:4 | A7:4 | A7:4 |
   D:3 G:1 | D/A:2 D:1 Em:1 | D/A:2 A7:2 | D:4''',
}
for name, plan in PLANS.items():
    m = mel(name); ch = bars(plan)
    v = harmonize(m, ch)
    print(f'// {name}', report(v), file=sys.stderr)
    print(f'// {name}')
    print('voices:[' + ',\n  '.join(json.dumps(x).replace(' ', '') for x in v) + ']')
