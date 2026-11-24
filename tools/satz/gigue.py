"""Gigue über „I Saw Three Ships“ (D65) – vierstimmiger alter Tanz, G-Dur, 6/8-Takt, munter.

Die Gigue ist der schnelle Schlusstanz der barocken Suite und wird oft fugiert gebaut: Die Stimmen setzen
nacheinander mit dem Thema ein. Thema = erste Liedzeile mit Auftakt („I saw three ships come sailing in, on Christmas day“).

Bauplan (Takte zu 6 Achteln, ein Achtel Auftakt vorne):
  1–3   Sopran: Thema (G-Dur)
  4–6   Alt: Antwort (D-Dur)
  7–9   Tenor: Thema
  10–12 Bass: Antwort
  13–16 Zwischenspiel (Sequenz)
  17–19 Sopran: Thema in C-Dur
  20–22 Bass: Thema in G-Dur (tief)
  23–27 Sopran: zweite Liedhälfte („on Christmas day in the morning“) – heiterer Schluss
Aufruf: python3 tools/satz/gigue.py > /tmp/gigue.json
"""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import kontrapunkt as K

BAR = 6
RANGE = [(60, 79), (55, 74), (48, 67), (38, 60)]
T = lambda b: 1 + (b - 1) * BAR  # Taktanfang (nach dem Auftakt)
TOTAL = T(28)

def thema(d):  # Thema ab Auftakt-Ton d (Quinte unter dem Grundton); Rhythmus des Liedes
    g = d + 5; sc = {0: g, 1: g + 2, 2: g + 4, 3: g + 5, 4: g + 7}  # Grundton, 2, 3, 4, 5 (Dur)
    return [[d, 1], [sc[0], 2], [sc[0], 1], [sc[1], 2], [sc[2], 1], [sc[4], 2], [sc[2], 1], [sc[1], 2], [sc[3], 1], [sc[2], 2], [sc[0], 1], [sc[0], 3]]

SCHLUSS = [[62, 1], [67, 2], [67, 1], [69, 2], [71, 1], [74, 2], [71, 1], [69, 2], [72, 1], [71, 2], [67, 1], [67, 1], [69, 1], [71, 1], [69, 3], [67, 9]]

FIXED = [
    (0, T(1) - 1, thema(62)),    # Sopran: Thema G-Dur (Auftakt d′)
    (1, T(4) - 1, thema(57)),    # Alt: Antwort D-Dur (Auftakt a)
    (2, T(7) - 1, thema(50)),    # Tenor: Thema (Auftakt d)
    (3, T(10) - 1, thema(45)),   # Bass: Antwort (Auftakt A)
    (0, T(17) - 1, thema(67)),   # Sopran: Thema C-Dur (Auftakt g′)
    (3, T(20) - 1, thema(38)),   # Bass: Thema G-Dur tief (Auftakt D)
    (0, T(23) - 1, SCHLUSS),     # Sopran: zweite Liedhälfte
]
ENTRY = {0: 0, 1: T(4) - 1, 2: T(7) - 1, 3: T(10) - 1}

CHORDS = '''G:1 | G:6 | G:3 D7:3 | G:6 | D:6 | D:3 A7:3 | D:6 | G:6 | G:3 D7:3 | G:6 | D:6 | D:3 A7:3 | D:6 |
  G:3 C:3 | Am:3 D:3 | Bm:3 Em:3 | Am:3 D7:3 | C:6 | C:3 G7:3 | C:6 | G:6 | G:3 D7:3 | G:6 |
  G:6 | G:3 D7:3 | Em:3 G:3 | D7:3 G:3 | G:6'''

G_DUR, D_DUR, C_DUR = {7, 9, 11, 0, 2, 4, 6}, {2, 4, 6, 7, 9, 11, 1}, {0, 2, 4, 5, 7, 9, 11}
def scale_at(t):
    if T(4) <= t < T(7) or T(10) <= t < T(13): return D_DUR
    if T(17) <= t < T(20): return C_DUR
    return G_DUR
TAIL = 2 * BAR + 9
TANZ, AUFTAKT = True, 1

if __name__ == '__main__':
    v = K.clean(K.compose(sys.modules[__name__]), sys.modules[__name__])
    print('Längen', [sum(d for _, d in x) for x in v], K.report(v), file=sys.stderr)
    print(json.dumps({'voices': v}))
