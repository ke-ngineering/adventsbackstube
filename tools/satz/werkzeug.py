"""Kleine Helfer für die Tanzsätze (D69): Tonleiter-Schritte, Glocken-Diskant aus Akkorden, Takt-Bausteine."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from satz import parse

G_DUR = [7, 9, 11, 0, 2, 4, 6]  # Tonklassen der Tonleiter, beginnend beim Grundton
D_DUR = [2, 4, 6, 7, 9, 11, 1]
C_DUR = [0, 2, 4, 5, 7, 9, 11]


def stufe(n, k, tl=G_DUR):
    """Ton n um k Tonleiterstufen verschieben (diatonisch, n muss leitereigen sein)."""
    pcs = sorted(tl); out = n
    step = 1 if k > 0 else -1
    for _ in range(abs(k)):
        out += step
        while out % 12 not in pcs: out += step
    return out


def transp(notes, k, tl=G_DUR):
    return [[stufe(n, k, tl) if n else 0, d] for n, d in notes]


def oktav(notes, o):
    return [[n + 12 * o if n else 0, d] for n, d in notes]


def akkorde(text):
    """„G:4 Am:2 | D:2“ → [(start, ende, akkord)]"""
    out, t = [], 0
    for tok in text.replace('|', ' ').split():
        s, d = tok.rsplit(':', 1); out.append((t, t + int(d), parse(s))); t += int(d)
    return out


def glocken(chordtext, lo, hi, einheit=1, muster='ab', start=None):
    """Diskant aus Akkordtönen wie ein Glockengeläut: in jeder Einheit ein Akkordton, abwechselnd fallend
    („Runden“ der Glöckner) – nur Akkordtöne, daher immer konsonant. muster 'ab' = fallend, 'auf' = steigend, 'welle' = auf und ab."""
    segs, out, last = akkorde(chordtext), [], start
    for (t0, t1, ch) in segs:
        pool = [n for n in range(lo, hi + 1) if n % 12 in ch['tones']]
        t = t0
        while t < t1:
            if last is None: cur = pool[len(pool) // 2]
            else:
                lower = [n for n in pool if n < last]; upper = [n for n in pool if n > last]
                if muster == 'ab': cur = lower[-1] if lower else pool[-1]
                elif muster == 'auf': cur = upper[0] if upper else pool[0]
                else:  # Welle: richtungswechsel an den Rändern
                    d = getattr(glocken, 'richtung', -1)
                    nxt = (lower[-1] if lower else None) if d < 0 else (upper[0] if upper else None)
                    if nxt is None: glocken.richtung = -d; nxt = upper[0] if d < 0 else lower[-1]
                    cur = nxt
            out.append([cur, einheit]); last = cur; t += einheit
    return out


def laenge(notes): return sum(d for _, d in notes)
