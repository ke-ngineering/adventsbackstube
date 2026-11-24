"""Fuge über „Es kommt ein Schiff geladen“ (D63) – vierstimmig, d-Moll, 3/4-Takt.

Bauplan (Takte zu 6 Achteln):
  1–4   Alt: Thema (d′)                      – Exposition
  5–8   Sopran: Antwort (a′), Alt: Kontrapunkt
  9–12  Bass: Thema (d)
  13–16 Tenor: Antwort (a)
  17–20 Zwischenspiel (Quintfall-Sequenz)
  21–24 Sopran: Thema in F-Dur              – Durchführung
  25–28 Tenor: Thema in g-Moll
  29–39 Sopran: zweite Liedhälfte in doppelten Notenwerten (Cantus firmus), Bass: Thema (d), Schluss in D-Dur

Feste Stimmen = Thema/Antwort/Cantus; freie Stimmen füllt satz-ähnliche Stimmführung (DP) aus Akkordtönen,
danach Durchgangsnoten in Achteln für fließende Bewegung. Ausgabe: JSON {"voices": [S, A, T, B]}.
Aufruf: python3 tools/satz/fuge.py > /tmp/fuge.json
"""
import json, sys, itertools, os
sys.path.insert(0, os.path.dirname(__file__))
from satz import parse, report  # noqa

BAR = 6
RANGE = [(60, 79), (55, 74), (48, 67), (38, 60)]
SCALE = {2, 4, 5, 7, 9, 10, 0}  # d-Moll (äolisch): d e f g a b c

def theme(root):  # Thema-Gestalt: 1 1 | 2 2 | 3 4 5 | 5 4 (Stufen der Tonleiter ab Grundton, Rhythmus h-q | h-q | q q q | h q)
    steps = [0, 0, 1, 1, 2, 3, 4, 4, 3]
    durs = [4, 2, 4, 2, 2, 2, 2, 4, 2]
    sc = scale_from(root)
    return [[sc[s], d] for s, d in zip(steps, durs)]

def scale_from(root):
    # Moll-Tonleiter ab root in der Lage von root; für Antwort/Dur-Einsätze passend gewählt
    mode = {62: [0, 2, 3, 5, 7], 50: [0, 2, 3, 5, 7], 69: [0, 2, 3, 5, 7], 57: [0, 2, 3, 5, 7],
            65: [0, 2, 4, 5, 7], 55: [0, 2, 3, 5, 7]}[root]
    if root in (69, 57): mode = [0, 2, 3, 5, 7]  # Antwort in a-Moll: a h c d e (h = dorisch wie im Lied)
    return [root + m for m in mode]

T = lambda b: (b - 1) * BAR  # Taktanfang in Achteln
CANTUS = [[65, 4], [69, 4], [72, 4], [74, 4], [74, 4], [72, 2], [70, 2], [69, 2], [67, 2], [65, 4], [67, 4], [69, 4], [67, 4], [65, 4], [64, 4], [62, 14]]
TOTAL = T(29) + sum(d for _, d in CANTUS)

# feste Abschnitte: (Stimme, Start, Noten)
FIXED = [
    (1, T(1), theme(62)),          # Alt: Thema
    (0, T(5), theme(69)),          # Sopran: Antwort
    (3, T(9), theme(50)),          # Bass: Thema
    (2, T(13), theme(57)),         # Tenor: Antwort
    (0, T(21), theme(65)),         # Sopran: Thema in F-Dur
    (2, T(25), theme(55)),         # Tenor: Thema in g-Moll
    (0, T(29), CANTUS),            # Sopran: Cantus firmus
    (3, T(29), theme(50)),         # Bass: letzter Themeneinsatz
]
# Pausen vor dem ersten Einsatz
ENTRY = {0: T(5), 1: T(1), 2: T(13), 3: T(9)}

CHORDS = '''Dm:6 | A:6 | Dm:2 Gm:2 Dm:2 | A:4 Gm:2 |
  Dm:4 F:2 | G:4 E7:2 | Am:2 G:2 C:2 | A:4 Gm:2 |
  Dm:4 Bb/D:2 | C/E:4 A7/E:2 | F:2 Gm:2 A:2 | A:4 A7/G:2 |
  F:4 Dm:2 | G:4 E7:2 | Am:2 G:2 C:2 | A:4 Dm:2 |
  Dm:3 Gm:3 | C:3 F:3 | Bb:3 Gm:3 | C:3 C7:3 |
  F:4 Dm:2 | C:4 C/E:2 | F:2 Gm:2 Am:2 | C:4 Gm:2 |
  Eb:4 Cm:2 | F:4 D7:2 | Gm:2 F:2 Bb:2 | D:4 D7:2 |
  Dm:4 Dm:2 A:2 C/E:2 Am/E:2 Dm/F:2 Gm:2 Dm/A:2 Dm/A:2 F/A:2 Gm:2 Dm:2 Gm:2 Bb:2 Dm:2 Gm:2 C:2 F:2 Dm:2 C/E:2 Gm:2
  Dm:2 Dm/F:2 A:2 A7:2 D:14'''
scale_at = lambda t: SCALE
TAIL = 3 * BAR + 14  # Schluss ohne Durchgangsnoten

if __name__ == '__main__':
    import kontrapunkt as K
    v = K.clean(K.compose(sys.modules[__name__]), sys.modules[__name__])
    print('Längen', [sum(d for _, d in x) for x in v], report(v), file=sys.stderr)
    print(json.dumps({'voices': v}))
