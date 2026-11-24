"""Weihnachts-Suite, 2. Satz: Branle gay über „Ding Dong! Merrily on High“ als Musette (D69) – G-Dur, 3/4.

Arbeau beschreibt den „Branle gay“ als Branle im Dreiertakt mit hüpfenden Schritten. Die Musette ist ein Tanz über einem
Dudelsack-Bordun: Bass und Tenor halten Grundton und Quinte (G–D) wie die Brummer eines Dudelsacks, die zweite Flöte geht
in Terzen mit der ersten. Die Melodie ist in „Tripla“ umgesetzt (Nachtanz-Verfahren: der gerade Vortanz wird zum Dreiertanz),
an den Kadenzen mit Hemiole.

Bauplan (Takte zu 6 Achteln):
  Bordun    2   Dudelsack setzt ein (nur Brummer und Trommel)
  A         6   Melodie, zweite Flöte in Terzen
  A'        6   Melodie verziert, leiser (Echo)
  B         9   Gloria, zweite Flöte in Terzen
  B'        9   Gloria als Kanon: zweite Flöte einen Takt später (Glockenkaskade)
  A         6   Melodie, kräftig
  Schluss   1   Bordun klingt aus
"""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from werkzeug import stufe, transp, laenge, G_DUR

BAR = 6
A = [[67, 4], [67, 2], [69, 1], [67, 1], [66, 2], [64, 2], [62, 4], [62, 2], [64, 4], [67, 4], [66, 4], [67, 6]]  # Takt 4–5: Hemiole
A_VERZ = [[67, 2], [69, 1], [71, 1], [67, 2], [69, 1], [67, 1], [66, 1], [64, 1], [66, 1], [64, 1], [62, 2], [66, 1], [64, 1], [62, 2],
          [64, 2], [67, 1], [64, 1], [67, 2], [71, 1], [67, 1], [66, 2], [64, 1], [66, 1], [67, 6]]


def tripla_gloria(top, takte=5):
    out, x = [], top
    for _ in range(takte):
        out += [[x, 2], [stufe(x, -1), 1], [stufe(x, -2), 1], [stufe(x, -1), 1], [x, 1]]
        x = stufe(x, -1)
    return out


B = tripla_gloria(74) + [[66, 2], [64, 2], [62, 2], [64, 4], [67, 4], [66, 4], [67, 6]]
assert laenge(A) == 36 and laenge(A_VERZ) == 36 and laenge(B) == 54, (laenge(A), laenge(A_VERZ), laenge(B))


def terzen(mel):  # zweite Flöte eine Terz (diatonisch) darunter
    out = [[stufe(n, -2) if n else 0, d] for n, d in mel]
    if mel[:5] == A[:5]: out[2:4] = [[64, 1], [64, 1]]  # Takt 2 („a′ g′“ über a-Moll): e′ statt fis′ – Akkordton auf der Eins
    return out


ABSCHNITTE = [('Bordun', 12), ('A', 36), ('A2', 36), ('B', 54), ('B2', 54), ('A3', 36), ('Schluss', 6)]
S = [[0, 12]] + A + A_VERZ + B + B + A + [[67, 6]]
KANON = [[0, 6]] + transp(tripla_gloria(74, 4), -3)  # 1 Takt später in der Unterquarte = Terz unter dem Sopran
AL = [[0, 12]] + terzen(A) + terzen(A) + terzen(B) + KANON + terzen(B[25:]) + terzen(A) + [[62, 6]]
TOTAL = laenge(S)
assert laenge(AL) == TOTAL, (laenge(AL), TOTAL)
# Akkorde (für Tenor und Kadenzen); Hemiole: drei Halbe über zwei Takte
from werkzeug import akkorde
CH_A = 'G:6 | Am:2 D:4 | Bm:4 G:2 | C:4 G/B:2 | G/B:2 D:4 | G:6'
CH_B = 'G:6 | Am:6 | Em:6 | D:6 | C:6 | D:6 | C:4 G/B:2 | G/B:2 D:4 | G:6'
CHORDS = ' | '.join(['G:6 | G:6', CH_A, CH_A, CH_B, CH_B, CH_A, 'G:6'])
SEGS = akkorde(CHORDS)
KADENZ = [(12 + 36 * k + 18, 12 + 36 * k + 30) for k in range(2)] + [(12 + 72 + 54 * k + 36, 12 + 72 + 54 * k + 48) for k in range(2)] + [(12 + 180 + 18, 12 + 180 + 30)]


def at(v, t):
    tt = 0
    for n, d in v:
        if tt <= t < tt + d: return n
        tt += d
    return 0


def bass():
    """Orgelpunkt G (Brummer, je Takt neu angestoßen); in den Hemiolen-Kadenzen Grundtöne der Akkorde (C – E – D)."""
    out, t = [], 0
    while t < TOTAL:
        k = next(((a, b) for a, b in KADENZ if a <= t < b), None)
        if k:
            for (a, b, ch) in SEGS:
                if k[0] <= a < k[1]: out.append([43 + (ch['bass'] - 7) % 12, b - a])
            t = k[1]; continue
        out.append([43, 6]); t += 6
    return out


def tenor():
    """Dritte Akkordstimme unter den Flöten: je Akkord ein Ton (bevorzugt der fehlende), kleine Schritte."""
    out, last = [], 55
    for (a, b, ch) in SEGS:
        oben = {at(S, a) % 12, at(AL, a) % 12} - {0}
        cand = [n for n in range(50, 61) if n % 12 in ch['tones'] and n <= (at(AL, a) or 99)]
        cand.sort(key=lambda n: (n % 12 in oben, abs(n - last)))
        def parallel(n):  # Quint-/Oktavparallele zu Sopran, Alt oder Bass gegenüber dem vorigen Akkord?
            if not out: return False
            pa = out[-1][0]
            for v in (S, AL, BASS):
                x0, x1 = at(v, a - 1), at(v, a)
                if x0 and x1 and x0 != x1 and pa != n and (x0 - pa) % 12 == (x1 - n) % 12 and (x1 - n) % 12 in (0, 7): return True
            return False
        n = next((c for c in cand if not parallel(c)), cand[0] if cand else last)
        out.append([n, b - a]); last = n
    return out


BASS = bass()
TEN = tenor()

ab = {}; t = 0
for name, l in ABSCHNITTE: ab[name] = t; t += l
DYN = [[ab['A2'], ab['B'], .72]]


def trommel():
    out = []
    for b in range(TOTAL // 6):
        t = b * 6
        if ab['A2'] <= t < ab['B']: out += [[1, 2], [0, 4]]; continue
        if t == TOTAL - 6: out += [[2, 2], [0, 4]]; continue
        out += [[2, 2], [1, 2], [1, 2]]
    return out


if __name__ == '__main__':
    v = [S, AL, TEN, BASS]
    print('Längen', [laenge(x) for x in v], file=sys.stderr)
    print(json.dumps({'voices': v, 'perc': trommel(), 'dyn': DYN}))
