"""Weihnachts-Suite, 3. Satz: Gigue über „In dulci jubilo“ (D69) – vierstimmig, G-Dur, 6/8, Flöten und Laute.

Melodie: „In dulci jubilo“ (14. Jh.), Liederbuch „Singen im Advent“ S. 30, von F- nach G-Dur gesetzt. Das Lied steht schon im
Dreiertakt; in Achteln statt Vierteln wird es zur Gigue. Satzweise wie die Gigue über „I Saw Three Ships“ (D65), dazu:
  – Cantus firmus: das ganze Lied im Sopran, die anderen Stimmen tanzen darum herum (wie in Praetorius' Liedsätzen)
  – Kanon: das ganze Lied im Sopran und zwei Takte später eine Oktave tiefer im Tenor – wie J. S. Bach in seinem Orgelchoral
    „In dulci jubilo“ (Orgelbüchlein, BWV 608), der das Lied als Kanon setzt. Rechnerisch geprüft: auf den betonten Zeiten
    entstehen nur drei Quarten zwischen den Oberstimmen.
  – Echo: „Alpha es et O“ erst leise, dann kräftig

Bauplan (Takte zu 6 Achteln, ein Achtel Auftakt):
  1–4   Sopran: Thema (G)          5–8   Alt: Antwort (D)       9–10  Überleitung
  11–14 Tenor: Thema (G)           15–18 Bass: Antwort (D)      19–22 Zwischenspiel (Quintfall-Sequenz mit dem Kopfmotiv)
  23–38 Sopran: ganzes Lied als Cantus firmus
  39–56 Kanon: Sopran ab 39, Tenor ab 41 (Oktave tiefer)
  57–60 „Alpha es et O“ leise (Echo)   61–65 „Alpha es et O“ kräftig, Schluss
"""
import json, sys, os, itertools
sys.path.insert(0, os.path.dirname(__file__))
import kontrapunkt as K
from satz import parse
from werkzeug import laenge, oktav, G_DUR

BAR = 6
RANGE = [(62, 79), (55, 74), (47, 67), (38, 60)]
T = lambda b: 1 + (b - 1) * BAR
LIED = [[67, 1], [67, 2], [67, 1], [71, 2], [72, 1], [74, 2], [76, 1], [74, 2], [74, 1], [67, 2], [67, 1], [71, 2], [72, 1], [74, 2], [76, 1], [74, 3],
        [74, 2], [76, 1], [74, 2], [72, 1], [71, 3], [67, 2], [67, 1], [69, 2], [69, 1], [71, 2], [69, 1], [67, 2], [69, 1], [71, 2], [71, 1],
        [74, 2], [76, 1], [74, 2], [72, 1], [71, 3], [67, 2], [67, 1], [69, 2], [69, 1], [71, 2], [69, 1], [67, 2], [69, 1], [71, 2], [0, 1],
        [64, 2], [64, 1], [66, 2], [66, 1], [67, 3], [74, 3], [71, 2], [71, 1], [69, 2], [69, 1], [67, 3], [67, 2]]
assert laenge(LIED) == 96
THEMA = LIED[:16]  # Auftakt + Takte 1–4 („In dulci jubilo, nun singet und seid froh“)
ALPHA = LIED[46:]  # Takte 13–16 („Alpha es et O …“), ab Takt 13 ohne Auftakt
assert laenge(THEMA) == 25 and laenge(ALPHA) == 23
ANTWORT = [[n - 5, d] for n, d in THEMA]  # reale Antwort in D-Dur (Unterquarte)

AK_THEMA_G = 'G:3 Em:2 Am:1 | G:2 C:1 D:3 | Em:3 G:2 Am:1 | G:2 A:1 D:3'
AK_THEMA_D = 'D:3 Bm:2 Em:1 | D:2 G:1 A:3 | Bm:3 D:2 Em:1 | D:2 E:1 A:3'
# Wenn das Thema in der tiefsten klingenden Stimme liegt: Akkorde so, dass seine Töne Grundton oder Terz sind (keine Quartsextakkorde)
AK_TIEF_G = 'G:3 G:2 C:1 | D:2 C:1 D:3 | Em:3 G:2 Am:1 | D:2 C:1 D:3'
AK_TIEF_D = 'D:3 D:2 Em:1 | A:2 G:1 A:3 | Bm:3 D:2 Em:1 | A:2 G:1 A:3'
AK_LIED = ['G:3 Em:2 Am:1', 'G:2 C:1 D:3', 'Em:3 G:2 Am:1', 'G:2 A:1 D:3', 'G:2 C:1 G:2 Am:1', 'Em:6', 'Am:2 D:1 G:2 D:1', 'Em:2 D:1 G:3',
           'G:2 C:1 D:2 Am:1', 'B:3 Em:3', 'Am:2 D:1 G:2 D:1', 'Em:2 Am:1 B:3', 'C:2 Am:1 D:2 Bm:1', 'Em:3 D:3', 'G:3 Am:2 D:1', 'G:6']

VERSATZ = 15  # Tenor folgt 2½ Takte später (setzt auf der zweiten Taktzeit ein)
LIED_KANON = LIED[:-2] + [[69, 3], [67, 2]]  # Sopran endet im Kanon über dem Tenor mit a′–g′ statt g′–g′

FIXED = [
    (0, 0, THEMA), (1, T(5) - 1, ANTWORT), (2, T(11) - 1, oktav(THEMA, -1)), (3, T(15) - 1, oktav(ANTWORT, -1)),
    (0, T(19), [[71, 2], [71, 1], [74, 2], [76, 1], [69, 2], [69, 1], [72, 2], [74, 1], [67, 2], [67, 1], [71, 2], [72, 1], [66, 2], [66, 1], [69, 2]]),  # Kopfmotiv in Sequenz
    (0, T(23) - 1, LIED),                       # Cantus firmus
    (0, T(39) - 1, LIED_KANON), (2, T(39) - 1 + VERSATZ, oktav(LIED, -1)),  # Kanon
    (0, T(57), ALPHA + [[0, 1]]), (0, T(61), ALPHA[:-1] + [[67, 9]]),  # Echo, dann kräftig mit langem Schlusston
]
ENTRY = {0: 0, 1: T(5) - 1, 2: T(11) - 1, 3: T(15) - 1}




def kanon_akkorde():
    """Akkorde für den Kanon je halbem Takt aus Sopran und Tenor bestimmen: Töne auf der betonten Zeit zählen dreifach,
    Fremdtöne auf der betonten Zeit kosten viel. Bei ähnlicher Eignung gewinnt der Akkord des Cantus-firmus-Satzes,
    und ein Akkordwechsel wird leicht bevorzugt (Abwechslung)."""
    kand = ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'D7', 'A7', 'B7', 'E7', 'Am7', 'Em7']
    def noten(start, notes, a, b):
        t, out = start, []
        for n, d in notes:
            for x in range(int(t), int(t + d)):
                if a <= x < b and n: out.append((n, 3 if x == a else 1))
            t += d
        return out
    cf = []  # Cantus-Akkord je halbem Takt (Tonart-Satz der Takte 23–38)
    for txt in AK_LIED:
        pos = 0
        for tok in txt.split():
            c, d = tok.split(':'); cf += [c] * int(d)
    plan, prev = [], None
    for b in range(39, 57):
        for h in (0, 3):
            a = T(b) + h
            ns = noten(T(39) - 1, LIED_KANON, a, a + 3) + noten(T(39) - 1 + VERSATZ, oktav(LIED, -1), a, a + 3)
            ref = cf[(a - T(39)) % 96] if 0 <= a - T(39) < 96 else 'G'
            def score(c):
                tones = parse(c)['tones']
                return (sum(w for n, w in ns if n % 12 in tones) - 5 * sum(1 for n, w in ns if w == 3 and n % 12 not in tones)
                        + (1.5 if c == ref else 0) - (1.2 if c == prev else 0) - (.8 if '7' in c else 0))
            best = max(kand, key=score); plan.append(f'{best}:3'); prev = best
    return plan


KANON = kanon_akkorde()
CHORDS = ' | '.join(['G:1', AK_THEMA_G, AK_TIEF_D, 'D:3 Bm:3 | Am:3 D7:2 G:1', AK_TIEF_G, AK_TIEF_D,
                     'Bm:3 Em:3 | Am:3 D:3 | G:3 Em:3 | D:3 D7:2 G:1'] + AK_LIED[:15] + ['G:5 G:1'] + KANON
                    + AK_LIED[12:15] + ['G:6'] + AK_LIED[12:15] + ['G:6', 'G:6'])
TOTAL = T(66)


def scale_at(t):
    if T(5) <= t < T(9) or T(15) <= t < T(19): return {2, 4, 6, 7, 9, 11, 1}  # D-Dur
    return set(G_DUR)
TAIL = 2 * BAR + 9
TANZ, AUFTAKT = True, 1
DYN = [[T(57), T(61), .42]]


if __name__ == '__main__':
    me = sys.modules[__name__]
    v = K.compose(me)
    v = K.glaetten(K.akkordtreue(K.clean(K.akkordtreue(K.clean(v, me), me, 3), me), me, 3), me)
    print('Längen', [laenge(x) for x in v], 'Kanon-Akkorde', ' '.join(KANON), file=sys.stderr)
    print(json.dumps({'voices': v, 'dyn': DYN}))
