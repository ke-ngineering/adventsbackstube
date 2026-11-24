"""Branle über „Ding Dong! Merrily on High“ (D69) – vierstimmiger Renaissance-Tanz, G-Dur, alla breve, mit Trommel.

Die Melodie ist Thoinot Arbeaus „Branle de l'Official“ aus der Orchésographie (Langres 1589), hier von C- nach G-Dur
gesetzt (Tonart des Weihnachtslieds). A-Teil = „Ding dong! merrily on high …“ (4 Takte), B-Teil = „Gloria“ (8 Takte).
Satzweise nach Praetorius' Terpsichore (1612, Violinen-Consort): Diskant mit der Melodie, Mittelstimmen in Vierteln, Trommel (Tabor).

Bauplan (Takte zu 8 Achteln):
  Vorspiel  2   Glockenmotiv „ding-dong“ (g–d) in der Bratsche über dem Grundton, Trommel
  A1        4   Melodie im Diskant, schlicht
  A2        4   Wiederholung mit Diminutionen (Verzierung in Achteln, wie in den Divisions-Lehrbüchern von Ortiz)
  B1        8   Gloria als „Glockenkaskade“: Alt setzt einen Takt später eine Terz tiefer ein, Tenor zwei Takte später
                eine Oktave tiefer – die Stimmen läuten nacheinander los wie Glocken (Kanon in der Unterquarte/Unteroktave)
  B2        8   Gloria im Bass, darüber läuten die Oberstimmen Akkordtöne abwärts („Runden“ der Glöckner)
  Echo      2   Schluss „in excelsis“ leise wiederholt (Echo, wie bei Banchieri und Gabrieli um 1600)
  A3        4   Tenorlied: Melodie in der Bratsche, Glocken-Diskant in Achteln darüber
  A4        4   dasselbe leise als Echo-Strophe
  B3        8   Schluss-Gloria: Bass in Umkehrung (steigt, während der Diskant fällt), Alt wieder im Kanon
  Schluss   2   plagaler Amen-Schluss (C → G)
Aufruf: python3 tools/satz/branle.py > /tmp/branle.json
"""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import kontrapunkt as K
from werkzeug import stufe, transp, oktav, glocken, laenge, G_DUR

BAR = 8
RANGE = [(62, 79), (55, 74), (48, 67), (38, 60)]
T = lambda b: (b - 1) * BAR  # Taktanfang (Takt 1 = Vorspiel)

A = [[67, 2], [67, 2], [69, 1], [67, 1], [66, 1], [64, 1], [62, 6], [62, 2], [64, 2], [67, 2], [67, 2], [66, 2], [67, 4], [67, 4]]
A_DIM = [[67, 1], [69, 1], [71, 1], [67, 1], [69, 1], [67, 1], [66, 1], [64, 1],  # Diminutionen (Achtel), Gerüsttöne bleiben
         [62, 2], [64, 1], [66, 1], [67, 1], [66, 1], [64, 1], [62, 1],
         [64, 1], [66, 1], [67, 1], [64, 1], [67, 1], [66, 1], [67, 1], [66, 1],
         [67, 2], [71, 1], [69, 1], [67, 4]]


def gloria_seq(top, takte=5):  # „Glo-o-o-ria“: je Takt x(3) x-1 x-2 x-1 x x-2, jeder Takt eine Stufe tiefer
    out, x = [], top
    for _ in range(takte):
        out += [[x, 3], [stufe(x, -1), 1], [stufe(x, -2), 1], [stufe(x, -1), 1], [x, 1], [stufe(x, -2), 1]]
        x = stufe(x, -1)
    return out


SCHLUSS = [[66, 3], [64, 1], [62, 2], [62, 2], [64, 2], [67, 2], [67, 2], [66, 2], [67, 4], [67, 4]]  # „Hosanna in excelsis“
B = gloria_seq(74) + SCHLUSS
assert laenge(A) == 32 and laenge(A_DIM) == 32 and laenge(B) == 64

CH_A1 = 'G:4 Am:2 D:2 | Bm:4 G:4 | Am:2 Em:2 C:2 D:2 | G:8'
CH_A2 = 'Em:4 Am:2 D:2 | Bm:4 G:4 | Am:2 Em:2 C:2 D:2 | G:8'
CH_B = 'G:8 | Am:4 D:4 | G:4 Em:4 | D7:4 D:4 | Em:4 C:4 | D:4 G:4 | Am:2 Em:2 C:2 D:2 | G:8'
CH_B3 = 'G:8 | Am:4 D7:4 | G:4 G:4 | D7:4 D:4 | Em:4 C:4 | D:4 G:4 | Am:2 Em:2 C:2 D:2 | G:8'
CH_B2 = 'Bm:4 G:4 | C:4 Am:4 | G:4 Em:4 | Am:4 D:4 | Em:4 C:4 | D:4 Bm:4 | C:2 Em:2 G:2 D:2 | G:8'  # Bass trägt die Melodie: Akkorde in Grundstellung/Sextakkord
CH_ECHO = 'Am:2 Em:2 C:2 D:2 | G:8'
CH_CODA = 'C:4 G:4 | G:8'

# Abschnitte: (Name, Starttakt, Takte, Akkorde)
TEILE = [('Vorspiel', 1, 2, 'G:8 | G:8'), ('A1', 3, 4, CH_A1), ('A2', 7, 4, CH_A2), ('B1', 11, 8, CH_B), ('B2', 19, 8, CH_B2),
         ('Echo', 27, 2, CH_ECHO), ('A3', 29, 4, CH_A1), ('A4', 33, 4, CH_A1), ('B3', 37, 8, CH_B3), ('Schluss', 45, 2, CH_CODA)]
TOTAL = T(47)
CHORDS = ' | '.join(c for *_, c in TEILE)
ab = {n: T(b) for n, b, *_ in TEILE}

# Bass in Umkehrung (B3, Takte 1–3): x(3) x+1 x+2 x+1 x x+2, jeder Takt eine Stufe höher
def umkehrung(x, takte):
    out = []
    for _ in range(takte):
        out += [[x, 3], [stufe(x, 1), 1], [stufe(x, 2), 1], [stufe(x, 1), 1], [x, 1], [stufe(x, 2), 1]]
        x = stufe(x, 1)
    return out

DING = [[55, 2], [50, 2]] * 4  # Glockenmotiv g–d in Vierteln
DISKANT_A3 = glocken(CH_A1, 67, 79, einheit=1, muster='welle', start=79)
DISKANT_B2 = glocken(CH_B2, 64, 79, einheit=2, muster='welle', start=79)

DISKANT_ZEIT = [(ab['B2'], ab['Echo']), (ab['A3'], ab['B3'])]

FIXED = [
    (2, ab['Vorspiel'], DING), (3, ab['Vorspiel'], [[43, 16]]),
    (0, ab['A1'], A), (0, ab['A2'], A_DIM),
    # B1: Glockenkaskade
    (0, ab['B1'], B),
    (1, ab['B1'], [[0, 8]] + transp(gloria_seq(74, 4), -3)),        # Alt: 1 Takt später in der Unterquarte = Terz unter dem Diskant
    (2, ab['B1'], [[0, 16]] + oktav(gloria_seq(74, 3), -1)),        # Tenor: 2 Takte später, Oktave tiefer
    # B2: Gloria im Bass, Diskant läutet
    (3, ab['B2'], oktav(B, -2)), (0, ab['B2'], DISKANT_B2),
    (0, ab['Echo'], SCHLUSS[4:]),
    # A3/A4: Tenorlied
    (2, ab['A3'], oktav(A, -1)), (0, ab['A3'], DISKANT_A3),
    (2, ab['A4'], oktav(A, -1)), (0, ab['A4'], DISKANT_A3),
    # B3: Schluss-Gloria
    (0, ab['B3'], B),
    (1, ab['B3'], [[0, 8]] + transp(gloria_seq(74, 4), -3)),
    (3, ab['B3'], umkehrung(43, 2)),
    (0, ab['Schluss'], [[76, 4], [74, 4], [74, 8]]),
]
ENTRY = {0: ab['A1'], 1: ab['A1'], 2: 0, 3: 0}


def scale_at(t): return set(G_DUR)
TAIL = 2 * BAR

# Dynamik: Echo-Stellen leise (Faktor), für Spiel und MIDI
DYN = [[ab['Echo'], ab['A3'], .7], [ab['A4'], ab['B3'], .74]]


def figur(v, idx):
    """Branle-Bewegung: freie halbe Noten der Mittelstimmen werden zu zwei Vierteln (Ton + Wechselnote/Durchgang)."""
    if idx not in (1, 2): return v
    out, t = [], 0
    for k, (n, d, *f) in enumerate(v):
        nxt = v[k + 1][0] if k + 1 < len(v) else 0
        if f or not n or d != 4 or t % 4 or t >= TOTAL - TAIL:
            out.append([n, d, *f]); t += d; continue
        if nxt and abs(nxt - n) in (3, 4):  # Terz zum nächsten Ton: Durchgang
            mid = [x for x in range(min(n, nxt) + 1, max(n, nxt)) if x % 12 in G_DUR]
            out += [[n, 2], [mid[0], 2]] if len(mid) == 1 else [[n, 4]]
        else: out += [[n, 2], [n, 2]]  # Tonwiederholung: Tanzpuls
        t += d
    return out


# Trommel (Tabor): je Takt lang – kurz – kurz (Arbeaus Grundschlag), im Echo schweigt sie
def trommel():
    out = []
    for b in range(TOTAL // BAR):
        t = b * BAR
        if ab['Echo'] <= t < ab['A3'] or ab['A4'] <= t < ab['B3']: out.append([0, 8]); continue
        if t == TOTAL - BAR: out += [[1, 1]] * 6 + [[2, 2]]; continue  # Wirbel zum Schluss
        out += [[2, 4], [1, 2], [1, 2]]
    return out


def reparatur(v, P, frei=None):
    """Glocken-Diskant: Töne, die Quint-/Oktavparallelen bilden, durch einen anderen Akkordton ersetzen (D69)."""
    from satz import report
    segs = K.segments(P)
    for _ in range(60):
        par = report(v)['Parallelen']
        hit = False
        for item in par:
            t, pair = item.split(':'); t = float(t)
            if 'S' not in pair or not any(a <= t < b for a, b in (frei or P.DISKANT_ZEIT)): continue
            s = v[0]; tt = 0
            for k, (n, d) in enumerate(s):
                if tt == t:
                    pool = lambda tx: [x for x in range(P.RANGE[0][0], P.RANGE[0][1] + 1) if x % 12 in next(c for (a, b, c) in segs if a <= tx < b)['tones']]
                    n0 = s[k - 1][0]
                    tries = [(n0, x) for x in sorted(pool(t), key=lambda x: abs(x - n))] + \
                            [(y, x) for y in sorted(pool(t - s[k - 1][1]), key=lambda y: abs(y - n0)) for x in sorted(pool(t), key=lambda x: abs(x - n))]
                    for y, x in tries:  # erst nur diesen Ton, dann auch den davor ändern
                        s[k - 1][0], s[k][0] = y, x
                        if len(report(v)['Parallelen']) < len(par) and abs(x - y) <= 9: hit = True; break
                        s[k - 1][0], s[k][0] = n0, n
                    break
                tt += d
            if hit: break
        if not hit: break
    return v


if __name__ == '__main__':
    me = sys.modules[__name__]
    v = K.glaetten(reparatur(K.clean(K.akkordtreue(K.clean(K.compose(me), me), me), me), me), me)
    print('Längen', [laenge(x) for x in v], K.report(v), file=sys.stderr)
    print(json.dumps({'voices': v, 'perc': trommel(), 'dyn': DYN}))
