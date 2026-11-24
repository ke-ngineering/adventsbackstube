"""Kontrapunkt-Maschine (D63/D65): feste Stimmen (Themen, Cantus firmus) + freie Stimmen aus einer Akkordfolge.
Ein Bauplan P liefert: BAR, RANGE, TOTAL, FIXED [(Stimme, Start, Noten)], ENTRY {Stimme: erster Einsatz},
CHORDS (Text „Akkord:Achtel | …“), scale_at(t) → Tonleiter-Tonklassen für Durchgangsnoten, TAIL (Schluss ohne Verzierung).
"""
import itertools, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from satz import parse, report

def segments(P):
    out, t = [], 0
    for tok in P.CHORDS.replace('|', ' ').split():
        s, d = tok.rsplit(':', 1); out.append((t, t + int(d), parse(s))); t += int(d)
    assert t == P.TOTAL, (t, P.TOTAL)
    return out

def fixed_at(P, v, t):
    for (vv, start, notes) in P.FIXED:
        if vv != v: continue
        x = start
        for n, d in notes:
            if x <= t < x + d: return n
            x += d
    return None

def free_voices(P, t):
    return [v for v in range(4) if t >= P.ENTRY[v] and fixed_at(P, v, t) is None]

def compose(P):
    segs = segments(P)
    layers = []
    for (t0, t1, ch) in segs:
        fx = {v: fixed_at(P, v, t0) for v in range(4) if fixed_at(P, v, t0) is not None}
        fr = free_voices(P, t0)
        # Stimmen, die im Abschnitt fest werden, nicht frei füllen
        fr = [v for v in fr if all(fixed_at(P, v, x) is None for x in range(t0, t1))]
        cands = []
        pools = [[n for n in range(P.RANGE[v][0], P.RANGE[v][1] + 1) if (n % 12 == ch['bass'] if v == 3 else n % 12 in ch['tones'])] for v in fr]
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
            cands.append((tuple(ordered), cost_static(ch, ordered, fr, P)))
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
        while t < P.TOTAL:
            f = fixed_at(P, v, t)
            if t < P.ENTRY[v]: voices[v].append([0, P.ENTRY[v] - t]); t = P.ENTRY[v]; continue
            if f is not None:
                # feste Note bis zu ihrem Ende
                for (vv, start, notes) in P.FIXED:
                    if vv != v: continue
                    x = start
                    for n, d in notes:
                        if x == t: voices[v].append([n, d, 'fest']); t += d; break
                        x += d
                    else: continue
                    break
                continue
            # freie Note: Abschnitt suchen
            for (t0, t1, fr, _), chord in zip(layers, path):
                if t0 <= t < t1:
                    end = t1
                    for x in range(t, t1):
                        if fixed_at(P, v, x) is not None: end = x; break
                    if chord[v] is None and voices[v] and voices[v][-1][0]: voices[v][-1][1] += end - t  # Stimme setzt im Abschnitt gleich wieder fest ein: Ton halten
                    else: voices[v].append([chord[v] or 0, end - t])
                    t = end; break
    out = [embellish(P, merge(x), v) for v, x in enumerate(voices)]
    if getattr(P, 'TANZ', False): out = [tanz(P, x, v) for v, x in enumerate(out)]
    return [[[n, d] for n, d, *_ in x] for x in out]

def v_bass_ok(ch, o): return True

def cost_static(ch, o, fr, P):
    pcs = [n % 12 for n in o if n]
    c = 0
    if ch['root'] not in pcs: c += 20
    if ch['third'] not in pcs and len(pcs) >= 3: c += 25
    if o[3] is not None and 3 in fr and o[3] % 12 != ch['bass']: c += 30
    for v in fr:
        lo, hi = P.RANGE[v]; mid = (lo + hi) / 2; c += abs(o[v] - mid) * .12
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
    for n, d, *f in v:
        if out and n == 0 and out[-1][0] == 0: out[-1][1] += d
        else: out.append([n, d, *f])
    return out

def embellish(P, v, idx):
    """Durchgangsnoten: zwischen zwei leitereigenen Tönen im Terzabstand eine Achtel einschieben (nicht im Sopran, nicht im Schluss)."""
    out, t = [], 0
    for k, (n, d, *f) in enumerate(v):
        nxt = v[k + 1][0] if k + 1 < len(v) else 0
        if f: out.append([n, d, *f]); t += d; continue  # Thema/Cantus bleibt unangetastet
        if (idx != 0 and n and nxt and d >= 2 and 3 <= abs(nxt - n) <= 4 and t < P.TOTAL - P.TAIL
                and n % 12 in P.scale_at(t) and nxt % 12 in P.scale_at(t + d)):
            mids = [x for x in range(min(n, nxt) + 1, max(n, nxt)) if x % 12 in P.scale_at(t + d - 1)]
            if len(mids) == 1:
                out.append([n, d - 1]); out.append([mids[0], 1]); t += d; continue
        out.append([n, d]); t += d
    return out

def tanz(P, v, idx):
    """Tanz-Rhythmus für freie Stimmen (Gigue, 6/8): punktierte Viertel → Viertel + Achtel (Ton wiederholt oder Nachbarton),
    punktierte Halbe → zwei solcher Gruppen. Feste Stimmen bleiben, der Schluss bleibt ruhig."""
    out, t = [], 0
    for k, (n, d, *f) in enumerate(v):
        nxt = v[k + 1][0] if k + 1 < len(v) else 0
        if f or not n or t >= P.TOTAL - P.TAIL or d not in (3, 6) or (t - getattr(P, 'AUFTAKT', 0)) % 3:
            out.append([n, d, *f]); t += d; continue
        for g in range(d // 3):
            last = g == d // 3 - 1
            step = [x for x in (n + 1, n + 2, n - 1, n - 2) if x % 12 in P.scale_at(t)]
            up = [y for y in (n + 1, n + 2) if y % 12 in P.scale_at(t)][:1]; dn = [y for y in (n - 1, n - 2) if y % 12 in P.scale_at(t)][:1]
            if last and nxt and abs(nxt - n) in (3, 4): x = ([y for y in range(min(n, nxt) + 1, max(n, nxt)) if y % 12 in P.scale_at(t)][:1] or [n])[0]  # Durchgang
            elif last and nxt and nxt != n: x = n  # stufenweiser Anschluss: Ton wiederholen
            else: x = (up if (k + g + idx) % 2 == 0 else dn or up or [n])[0] if (up or dn) else n  # Wechselnote oben/unten
            out.append([n, 2]); out.append([x, 1])
        t += d
    return out

def alt_pitch(P, v, vi, k, t):
    """Freie Note bei t durch einen anderen Akkordton ersetzen, wenn dadurch die Parallelen bei t verschwinden."""
    seg = next(c for (a, b, c) in segments(P) if a <= t < b)
    x = v[vi]; old = x[k][0]; before = len([p for p in report(v)['Parallelen'] if p.startswith(f'{t:g}:')])
    others = []
    for w in range(4):
        if w == vi: continue
        tt = 0
        for n, d in v[w]:
            if tt <= t < tt + d: others.append((w, n)); break
            tt += d
    for cand in sorted(range(old - 5, old + 6), key=lambda c: abs(c - old)):
        if cand == old or cand % 12 not in seg['tones'] or not (P.RANGE[vi][0] <= cand <= P.RANGE[vi][1]): continue
        if any(n and ((w < vi and n < cand) or (w > vi and n > cand)) for w, n in others): continue
        x[k][0] = cand
        after = len([p for p in report(v)['Parallelen'] if p.startswith(f'{t:g}:')]); total_after = len(report(v)['Parallelen'])
        if after < before and total_after < before + len(report(v)['Parallelen']) - after + 1: return True
        x[k][0] = old
    return False

def clean(v, P=None):
    """Durchgangsnoten entfernen, die Quint-/Oktavparallelen erzeugen (bis keine mehr übrig sind, die so entstehen)."""
    VO = 'SATB'
    for _ in range(80):
        bad = report(v)['Parallelen']; changed = False
        for item in bad:
            t, pair = item.split(':'); t = float(t)
            for ch in pair:
                x = v[VO.index(ch)]; tt = 0
                for k, (n, d) in enumerate(x):
                    fest = P and fixed_at(P, VO.index(ch), tt) is not None
                    if tt + d == t and d == 1 and k > 0 and x[k - 1][0] and not fest:
                        x[k - 1][1] += 1; del x[k]; changed = True; break
                    if tt == t and d == 1 and k > 0 and x[k - 1][0] and x[k][0] != x[k - 1][0] and not fest:
                        x[k][0] = x[k - 1][0]; changed = True; break  # Wechselnote → Tonwiederholung
                    if tt == t and d >= 2 and n and not fest and P is not None and alt_pitch(P, v, VO.index(ch), k, t):
                        changed = True; break
                    tt += d
        if not changed: break
    return v

