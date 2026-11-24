"""Weihnachts-Suite, 1. Satz: Intrada über „Macht hoch die Tür“ (D69) – Posaunenchor mit Pauken, G-Dur, 3/4.

Die Intrada ist das festliche Eröffnungsstück der deutschen Stadtpfeifer um 1600 (Hassler, Franck, Demantius) –
passend zum Text „Macht hoch die Tür, die Tor macht weit“. Melodie: Freylinghausen 1704 (Liederbuch „Singen im Advent“),
hier von C- nach G-Dur gesetzt, damit alle drei Suitensätze in einer Tonart stehen (wie in der barocken Suite).

Bauplan (Takte zu 6 Achteln, Melodie mit Viertel-Auftakt):
  Fanfare   2   Trompetenfanfare mit Pauken (Tonika–Dominante)
  M 1–8     tutti forte, Mittelstimmen in wiederholten Vierteln (Intrada-Puls)
  M 9–12    nur die Trompeten (hoher Chor) – Zwiegesang
  M 13–16   Antwort der Posaunen (tiefer Chor), Melodie im Tenor – Mehrchörigkeit wie bei Gabrieli in Venedig
  M 17–20   tutti forte
  M 21–24   dieselbe Zeile leise als Echo („pian e forte“, Gabrieli 1597)
  M 25–32   tutti, Kadenz mit Hemiole (zwei 3/4-Takte klingen wie ein 3/2-Takt), Schlusston mit Paukenwirbel
"""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import kontrapunkt as K
from werkzeug import laenge, oktav, G_DUR

BAR = 6
RANGE = [(64, 81), (57, 74), (48, 67), (38, 60)]
# Melodie in C (Liederbuch) → +7 Halbtöne nach G
MEL_C = [[64, 2], [67, 4], [65, 2], [64, 4], [62, 2], [60, 2], [62, 2], [64, 2], [62, 4], [67, 2], [65, 4], [65, 2], [64, 4], [64, 2], [62, 2], [60, 2], [62, 2], [60, 4], [64, 2],
         [62, 4], [62, 2], [64, 2], [66, 2], [67, 2], [67, 2], [69, 2], [66, 2], [67, 4], [62, 2], [64, 4], [62, 2], [64, 2], [66, 2], [67, 2], [67, 2], [69, 2], [66, 2], [67, 4], [67, 2],
         [69, 4], [67, 2], [69, 4], [67, 2], [69, 2], [67, 2], [65, 2], [64, 4], [67, 2], [69, 4], [67, 2], [69, 4], [67, 2], [69, 2], [67, 2], [65, 2], [64, 4], [67, 2],
         [60, 4], [60, 2], [65, 4], [64, 2], [62, 10], [67, 2], [65, 4], [64, 2], [62, 2], [60, 2], [62, 2], [60, 12]]
MEL = [[n + 7, d] for n, d in MEL_C]
VOR = 10  # Fanfare: 10 Achtel, dann Auftakt (2 Achtel) → Melodietakt 1 beginnt bei 12
M = lambda b: VOR + 2 + (b - 1) * BAR  # Beginn von Melodietakt b
TOTAL = M(33)
assert VOR + laenge(MEL) == TOTAL, (VOR + laenge(MEL), TOTAL)


def stueck(a, b):  # Melodie von Takt a bis vor Takt b (Auftakt des Taktes a gehört dazu: ab M(a)-2)
    out, t = [], VOR
    for n, d in MEL:
        if M(a) - 2 <= t < M(b) - 2: out.append([n, d])
        t += d
    return out

# Akkorde je Melodietakt (in C gedacht, dann nach G übertragen); Auftakt-Akkord steht am Ende des Vortakts
C2G = {'C': 'G', 'Dm': 'Am', 'G': 'D', 'G7': 'D7', 'Am': 'Em', 'F': 'C', 'Em': 'Bm', 'D': 'A', 'D7': 'A7', 'E': 'B', 'G/B': 'D/F#', 'F/A': 'C/E'}
AK_C = ['C:6 | G:4 C:2',  # Fanfare (10) + Auftakt (2)
        'C:4 Dm:2 | C:4 G:2 | Am:2 G:2 C:2 | G:6 | F/A:4 Dm:2 | C:4 Am:2 | G/B:2 Am:2 G7:2 | C:6',
        'G:6 | Am:2 D:2 G:2 | C:2 D:2 D7:2 | G:6',
        'C:4 G:2 | Am:2 D:2 G:2 | Em:2 Am:2 D:2 | G:4 C:2',
        'F:4 C:2 | Dm:4 Em:2 | F:2 C:2 G7:2 | C:6',
        'F:4 C:2 | Am:4 Em:2 | F:2 C:2 G7:2 | C:6',
        'C:4 Am:2 | Dm:4 C:2 | Dm:2 G:4 | G7:4 C:2 | Dm:4 C:2 | G/B:2 F/A:2 G:2 | C:6 | C:6']
def nach_g(s): return ' '.join(f"{C2G[t.split(':')[0]]}:{t.split(':')[1]}" if ':' in t else t for t in s.split())
CHORDS = ' | '.join(nach_g(s) for s in AK_C)

FANFARE = [  # Trompeten-Fanfare: lang–kurz–kurz (punktiert), Posaunen mit Grundton/Quinte
    (0, 0, [[74, 3], [74, 1], [74, 2], [74, 3], [74, 1]]), (1, 0, [[71, 3], [71, 1], [71, 2], [69, 3], [69, 1]]),
    (2, 0, [[67, 3], [67, 1], [67, 2], [66, 3], [66, 1]]), (3, 0, [[43, 6], [50, 4]]),
]
FIXED = FANFARE + [
    (0, 10, stueck(1, 13)),                      # Sopran: Melodie bis Takt 12
    (2, M(9) - 2, [[0, M(13) - M(9)]]), (3, M(9) - 2, [[0, M(13) - M(9)]]),  # M 9–12: Posaunen schweigen
    (2, M(13) - 2, oktav(stueck(13, 17), -1)),   # M 13–16: Melodie im Tenor (Posaune)
    (0, M(13) - 2, [[0, M(17) - M(13)]]), (1, M(13) - 2, [[0, M(17) - M(13)]]),  # Trompeten schweigen
    (0, M(17) - 2, stueck(17, 33)),
]
ENTRY = {0: 0, 1: 0, 2: 0, 3: 0}
def scale_at(t): return set(G_DUR) | ({1} if M(9) <= t < M(13) else set())  # M 9–12 in D-Dur (cis)
TAIL = 2 * BAR
HEMIOLE = (M(29), M(31))
DYN = [[M(21) - 2, M(25) - 2, .68]]


def figur(v, idx):
    """Intrada-Puls: freie Mittelstimmen spielen lange Töne als wiederholte Viertel; Bass bleibt ruhig.
    In der Hemiole (M 29–30) gehen alle Begleitstimmen in Halben (drei Halbe auf zwei Takte)."""
    if idx == 0: return v
    # In der Hemiole gleiche Töne zu Halben verbinden (Am | G | C D → drei Halbe gegen zwei 3/4-Takte)
    m, t = [], 0
    for n, d, *f in v:
        if m and HEMIOLE[0] <= t < HEMIOLE[1] and not f and not m[-1][2:] and m[-1][0] == n and m[-1][1] < 4: m[-1][1] += d
        else: m.append([n, d, *f])
        t += d
    v = m
    out, t = [], 0
    for n, d, *f in v:
        if HEMIOLE[0] <= t < HEMIOLE[1] and not f and n:
            out.append([n, d]); t += d; continue
        if f or not n or idx == 3 or d < 4 or t % 2 or t >= TOTAL - TAIL:
            out.append([n, d, *f]); t += d; continue
        out += [[n, 2]] * (d // 2) + ([[n, d % 2]] if d % 2 else []); t += d
    return out


def pauken():
    """Pauken auf G (43) und D (38): Fanfare, Phrasenanfänge, Kadenzen; im Echo und im Zwiegesang still; Schlusswirbel."""
    out = [[43, 3], [43, 1], [43, 2], [38, 3], [38, 1], [0, 2]]  # Fanfare (10) + Auftakt
    for b in range(1, 33):
        t = M(b)
        if M(9) <= t < M(17) or M(21) <= t < M(25): out.append([0, 6]); continue
        if b in (4, 8, 12, 16, 20, 24, 28): out += [[38 if b in (4, 12, 16, 28) else 43, 2], [0, 4]]; continue
        if b == 31: out += [[43, .5]] * 12; continue  # Wirbel
        if b == 32: out += [[43, 2], [0, 4]]; continue
        out += [[43, 2], [0, 2], [38, 2]] if b % 2 else [[43, 2], [0, 4]]
    return out


if __name__ == '__main__':
    me = sys.modules[__name__]
    v = K.compose(me)
    v = K.glaetten(K.akkordtreue(K.clean(K.akkordtreue(K.clean(v, me), me), me), me), me)
    print('Längen', [laenge(x) for x in v], file=sys.stderr)
    print(json.dumps({'voices': v, 'perc': pauken(), 'dyn': DYN}))
