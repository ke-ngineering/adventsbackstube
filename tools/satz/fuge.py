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
from satz import parse, report

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
def segments():
    out, t = [], 0
    for tok in CHORDS.replace('|', ' ').split():
        s, d = tok.rsplit(':', 1); out.append((t, t + int(d), parse(s))); t += int(d)
    assert t == TOTAL, (t, TOTAL)
    return out

def fixed_at(v, t):
    for (vv, start, notes) in FIXED:
        if vv != v: continue
        x = start
        for n, d in notes:
            if x <= t < x + d: return n
            x += d
    return None

def free_voices(t):
    return [v for v in range(4) if t >= ENTRY[v] and fixed_at(v, t) is None]

def compose():
    segs = segments()
    layers = []
    for (t0, t1, ch) in segs:
        fx = {v: fixed_at(v, t0) for v in range(4) if fixed_at(v, t0) is not None}
        fr = free_voices(t0)
        # Stimmen, die im Abschnitt fest werden, nicht frei füllen
        fr = [v for v in fr if all(fixed_at(v, x) is None for x in range(t0, t1))]
        cands = []
        pools = [[n for n in range(RANGE[v][0], RANGE[v][1] + 1) if (n % 12 == ch['bass'] if v == 3 else n % 12 in ch['tones'])] for v in fr]
        for combo in itertools.product(*pools) if fr else [()]:
            full = dict(fx); full.update(zip(fr, combo))
            # Reihenfolge S ≥ A ≥ T ≥ B, Abstände
            ordered = [full.get(v) for v in range(4)]
            ok, prev = True, None
            for v in range(4):
                if ordered[v] is None: continue
                if prev is not None and ordered[v] > prev: ok = False; break
                prev = ordered[v]
            if not ok: continue
            if ordered[0] and ordered[1] and ordered[0] - ordered[1] > 12: continue
            if ordered[1] and ordered[2] and ordered[1] - ordered[2] > 12: continue
            if ordered[3] is not None and v_bass_ok(ch, ordered) is False: continue
            cands.append((tuple(ordered), cost_static(ch, ordered, fr)))
        if not cands: raise SystemExit(f'keine Lage bei {t0}')
        layers.append((t0, t1, fr, cands))
    # DP
    best = [{c: (k, None) for c, k in layers[0][3]}]
    for i in range(1, len(layers)):
        cur = {}
        for c, k in layers[i][3]:
            bc, bp = None, None
            for p, (pk, _) in best[-1].items():
                cc = pk + cost_move(p, c, layers[i][2])
                if bc is None or cc < bc: bc, bp = cc, p
            cur[c] = (bc + k, bp)
        best.append(cur)
    c = min(best[-1], key=lambda x: best[-1][x][0]); path = [c]
    for i in range(len(best) - 1, 0, -1):
        c = best[i][c][1]; path.append(c)
    path.reverse()
    # Stimmen zusammensetzen
    voices = [[] for _ in range(4)]
    for v in range(4):
        t = 0
        while t < TOTAL:
            f = fixed_at(v, t)
            if t < ENTRY[v]: voices[v].append([0, ENTRY[v] - t]); t = ENTRY[v]; continue
            if f is not None:
                # feste Note bis zu ihrem Ende
                for (vv, start, notes) in FIXED:
                    if vv != v: continue
                    x = start
                    for n, d in notes:
                        if x == t: voices[v].append([n, d]); t += d; break
                        x += d
                    else: continue
                    break
                continue
            # freie Note: Abschnitt suchen
            for (t0, t1, fr, _), chord in zip(layers, path):
                if t0 <= t < t1:
                    end = t1
                    for x in range(t, t1):
                        if fixed_at(v, x) is not None: end = x; break
                    voices[v].append([chord[v], end - t]); t = end; break
    return [embellish(merge(x), v) for v, x in enumerate(voices)]

def v_bass_ok(ch, o): return True

def cost_static(ch, o, fr):
    pcs = [n % 12 for n in o if n]
    c = 0
    if ch['root'] not in pcs: c += 20
    if ch['third'] not in pcs and len(pcs) >= 3: c += 25
    if o[3] is not None and 3 in fr and o[3] % 12 != ch['bass']: c += 30
    for v in fr:
        lo, hi = RANGE[v]; mid = (lo + hi) / 2; c += abs(o[v] - mid) * .12
    if len(pcs) >= 3 and len(set(pcs)) < 3: c += 10
    return c

def cost_move(p, q, fr):
    c = 0
    for v in fr:
        if p[v] is None or q[v] is None: continue
        d = abs(q[v] - p[v]); c += d * (.5 if v == 3 else 1.0)
        if d == 3 and (p[v] % 12, q[v] % 12) in {(10, 1), (1, 10), (3, 6), (6, 3), (5, 8), (8, 5)}: c += 40  # übermäßige Sekunde
        if d in (6, 10, 11): c += 25  # Tritonus, Septsprung
        if d > 4 and v != 3: c += (d - 4) * 4 + (60 if d > 7 else 0)
        if d > 7 and v == 3: c += (d - 7) * 3
    for i, j in itertools.combinations(range(4), 2):
        if None in (p[i], p[j], q[i], q[j]): continue
        if p[i] != q[i] and p[j] != q[j] and (p[i] - p[j]) % 12 == (q[i] - q[j]) % 12 and (q[i] - q[j]) % 12 in (0, 7): c += 80
    return c

def merge(v):  # gleiche Töne hintereinander zusammenfassen? Nein – Tonwiederholungen bleiben (Text/Artikulation); nur Pausen verbinden
    out = []
    for n, d in v:
        if out and n == 0 and out[-1][0] == 0: out[-1][1] += d
        else: out.append([n, d])
    return out

def embellish(v, idx):
    """Durchgangsnoten: zwischen zwei leitereigenen Tönen im Terzabstand eine Achtel einschieben (nicht im Sopran, nicht im Schluss)."""
    out, t = [], 0
    for k, (n, d) in enumerate(v):
        nxt = v[k + 1][0] if k + 1 < len(v) else 0
        if (idx != 0 and n and nxt and d >= 2 and 3 <= abs(nxt - n) <= 4 and t < TOTAL - 3 * BAR - 14
                and n % 12 in SCALE and nxt % 12 in SCALE):
            mids = [x for x in range(min(n, nxt) + 1, max(n, nxt)) if x % 12 in SCALE]
            if len(mids) == 1:
                out.append([n, d - 1]); out.append([mids[0], 1]); t += d; continue
        out.append([n, d]); t += d
    return out

def clean(v):
    """Durchgangsnoten entfernen, die Quint-/Oktavparallelen erzeugen (bis keine mehr übrig sind, die so entstehen)."""
    VO = 'SATB'
    for _ in range(20):
        bad = report(v)['Parallelen']; changed = False
        for item in bad:
            t, pair = item.split(':'); t = float(t)
            for ch in pair:
                x = v[VO.index(ch)]; tt = 0
                for k, (n, d) in enumerate(x):
                    if tt + d == t and d == 1 and k > 0 and x[k - 1][0]:
                        x[k - 1][1] += 1; del x[k]; changed = True; break
                    tt += d
        if not changed: break
    return v

if __name__ == '__main__':
    v = clean(compose())
    print('Längen', [sum(d for _, d in x) for x in v], report(v), file=sys.stderr)
    print(json.dumps({'voices': v}))
