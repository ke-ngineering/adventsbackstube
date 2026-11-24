"""Vierstimmiger Satz (Sopran = Melodie) aus einer Akkordfolge – klassische Stimmführung per dynamischer Programmierung.

Eingabe: JSON {"melody": [[midi, achtel], ...], "chords": [["D", achtel], ["A7/C#", achtel], ...]}
Ausgabe: JSON {"voices": [S, A, T, B]} – jede Stimme als [[midi, achtel], ...]

Regeln (Kosten): kleine Schritte in Alt/Tenor, keine parallelen Quinten/Oktaven, keine Stimmkreuzung,
Abstand S–A und A–T höchstens eine Oktave, Grundton und Terz vorhanden, Terz nicht verdoppeln, Leitton nicht verdoppeln,
Septime vorhanden (bei Septakkorden). Bass = Grundton bzw. Schrägstrich-Ton.
Aufruf: python3 tools/satz/satz.py eingabe.json > ausgabe.json
"""
import json, sys, itertools

NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
QUAL = {'': [0, 4, 7], 'm': [0, 3, 7], '7': [0, 4, 7, 10], 'maj7': [0, 4, 7, 11], 'm7': [0, 3, 7, 10], '6': [0, 4, 7, 9],
        'm6': [0, 3, 7, 9], 'dim': [0, 3, 6], 'dim7': [0, 3, 6, 9], 'm7b5': [0, 3, 6, 10], 'sus4': [0, 5, 7], '7sus4': [0, 5, 7, 10]}
RANGE = {'A': (55, 74), 'T': (48, 67), 'B': (38, 60)}


def pc(name):
    p = NOTE[name[0]]
    for ch in name[1:]:
        p += 1 if ch == '#' else -1 if ch == 'b' else 0
    return p % 12


def parse(sym):
    bass = None
    if '/' in sym:
        sym, b = sym.split('/'); bass = pc(b)
    i = 1
    while i < len(sym) and sym[i] in '#b':
        i += 1
    root, q = pc(sym[:i]), sym[i:]
    ints = QUAL[q]
    tones = [(root + x) % 12 for x in ints]
    return {'root': root, 'tones': tones, 'third': tones[1], 'seventh': tones[3] if len(tones) > 3 and q not in ('6', 'm6') else None,
            'bass': bass if bass is not None else root, 'name': sym}


def melody_at(mel, t0, t1):
    """Melodietöne im Abschnitt [t0, t1): (Ton zu Beginn, tiefster, höchster)"""
    t, out = 0, []
    for n, d in mel:
        if t < t1 and t + d > t0 and n:
            out.append(n)
        t += d
    return (out[0] if out else None), min(out) if out else None, max(out) if out else None


def candidates(ch, s, smin):
    tones = ch['tones']
    res = []
    bs = [b for b in range(RANGE['B'][0], RANGE['B'][1] + 1) if b % 12 == ch['bass']]
    al = [a for a in range(RANGE['A'][0], RANGE['A'][1] + 1) if a % 12 in tones and a <= (smin if smin else s) and (s - a) <= 12]
    for a in al:
        for t in range(max(RANGE['T'][0], a - 12), min(RANGE['T'][1], a) + 1):
            if t % 12 not in tones:
                continue
            for b in bs:
                if b > t or t - b > 19:
                    continue
                res.append((a, t, b))
    return res


def static_cost(ch, s, v, lead):
    a, t, b = v
    pcs = [s % 12, a % 12, t % 12, b % 12]
    c = 0
    if ch['root'] not in pcs: c += 30
    if ch['third'] not in pcs: c += 40
    if ch['seventh'] is not None and ch['seventh'] not in pcs: c += 12
    if pcs.count(ch['third']) > 1 and ch['bass'] != ch['third']: c += 6
    if lead is not None and pcs.count(lead) > 1 and lead == ch['third']: c += 20
    if ch['seventh'] is not None and pcs.count(ch['seventh']) > 1: c += 25
    if len(set(pcs)) < min(3, len(ch['tones'])): c += 15
    # mittlere Lagen bevorzugen
    c += abs(a - 65) * .15 + abs(t - 57) * .15 + abs(b - 46) * .12
    return c


def move_cost(p, q, sp, sq):
    (a0, t0, b0), (a1, t1, b1) = p, q
    c = abs(a1 - a0) * 1.0 + abs(t1 - t0) * 1.0 + abs(b1 - b0) * .55
    for x, y in ((a0, a1), (t0, t1)):
        if abs(y - x) > 4: c += (abs(y - x) - 4) * 5
    if abs(b1 - b0) > 7: c += (abs(b1 - b0) - 7) * 4
    if abs(b1 - b0) > 12: c += 40
    prev, cur = [sp, a0, t0, b0], [sq, a1, t1, b1]
    for i, j in itertools.combinations(range(4), 2):
        if prev[i] is None or cur[i] is None: continue
        i0, i1 = (prev[i] - prev[j]) % 12, (cur[i] - cur[j]) % 12
        moved = prev[i] != cur[i] or prev[j] != cur[j]
        if moved and i0 == i1 and i1 in (0, 7): c += 60  # parallele Oktave/Quinte
        # verdeckte Quinte/Oktave zwischen Außenstimmen bei Sprung im Sopran
        if (i, j) == (0, 3) and i1 in (0, 7) and (cur[0] - prev[0]) * (cur[3] - prev[3]) > 0 and abs(cur[0] - prev[0]) > 2: c += 10
    # Überholen
    if a1 < t0 or t1 > a0 or t1 < b0 or b1 > t0: c += 8
    return c


def harmonize(mel, chords, lead=None):
    segs, t = [], 0
    for sym, d in chords:
        segs.append((t, t + d, parse(sym), sym)); t += d
    total = sum(d for _, d in mel)
    assert t == total, f'Akkorde {t} ≠ Melodie {total} Achtel'
    layers = []
    for t0, t1, ch, sym in segs:
        s, smin, smax = melody_at(mel, t0, t1)
        cs = candidates(ch, s, smin)
        if not cs: raise SystemExit(f'keine Lage für {sym} bei {t0} (Sopran {s})')
        layers.append([(v, static_cost(ch, s, v, lead), s) for v in cs])
    best = [{v: (c, None) for v, c, s in layers[0]}]
    for k in range(1, len(layers)):
        cur = {}
        for v, c, s in layers[k]:
            sp = layers[k - 1][0][2]
            bc, bp = None, None
            for pv, (pc_, _) in best[-1].items():
                cc = pc_ + move_cost(pv, v, sp, s)
                if bc is None or cc < bc: bc, bp = cc, pv
            cur[v] = (bc + c, bp)
        best.append(cur)
    v = min(best[-1], key=lambda x: best[-1][x][0])
    path = [v]
    for k in range(len(best) - 1, 0, -1):
        v = best[k][v][1]; path.append(v)
    path.reverse()
    A, T, B = [], [], []
    for (t0, t1, ch, sym), (a, tt, b) in zip(segs, path):
        for arr, n in ((A, a), (T, tt), (B, b)):
            if arr and arr[-1][0] == n and False: arr[-1][1] += t1 - t0
            else: arr.append([n, t1 - t0])
    return [mel, A, T, B]


if __name__ == '__main__':
    inp = json.load(open(sys.argv[1]))
    print(json.dumps({'voices': harmonize(inp['melody'], inp['chords'], inp.get('lead'))}))


def report(v):
    """Prüft einen Satz: parallele Quinten/Oktaven, große Sprünge"""
    times = sorted({t for voice in v for t in _starts(voice)})
    at = lambda voice, t: next(n for (n, s0, s1) in _spans(voice) if s0 <= t < s1)
    par, prev = [], None
    for t in times:
        cur = [at(x, t) for x in v]
        if prev:
            for i, j in itertools.combinations(range(4), 2):
                if 0 in (cur[i], cur[j], prev[i], prev[j]): continue
                if prev[i] != cur[i] and prev[j] != cur[j] and (prev[i] - prev[j]) % 12 == (cur[i] - cur[j]) % 12 and (cur[i] - cur[j]) % 12 in (0, 7): par.append(f'{t}:{"SATB"[i]}{"SATB"[j]}')
        prev = cur
    leaps = [max(abs(a[0] - b[0]) for a, b in zip(x, x[1:]) if a[0] and b[0]) for x in v]
    return {'Parallelen': par, 'größter Sprung S/A/T/B': leaps}

def _spans(voice):
    t, o = 0, []
    for n, d in voice: o.append((n, t, t + d)); t += d
    return o

def _starts(voice): return [s0 for _, s0, _ in _spans(voice)]
