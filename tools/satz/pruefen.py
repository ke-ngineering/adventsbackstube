"""Satzprüfung (D69): Dissonanzen auf betonten Achteln, Parallelen, Stimmkreuzungen, Sprünge.
Aufruf: python3 tools/satz/pruefen.py satz.json [Achtel pro Takt]"""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from satz import report

def spans(v):
    t, o = 0, []
    for n, d in v: o.append((t, t + d, n)); t += d
    return o

def pruefen(voices, bar=8, schwer=4, name=''):
    sp = [spans(v) for v in voices]
    total = max(s[-1][1] for s in sp)
    at = lambda i, t: next((n for a, b, n in sp[i] if a <= t < b), 0)
    starts = lambda i, t: any(a == t for a, b, n in sp[i])
    dis, cross = [], []
    t = 0
    while t < total:
        if (t - getattr(pruefen, 'auftakt', 0)) % schwer == 0:
            ns = [at(i, t) for i in range(len(voices))]
            low = min((n for n in ns if n), default=0)
            for i in range(len(ns)):
                for j in range(i + 1, len(ns)):
                    a, b = ns[i], ns[j]
                    if not a or not b or not (starts(i, t) or starts(j, t)): continue
                    iv = abs(a - b) % 12
                    if iv in (1, 2, 6, 10, 11) or (iv == 5 and min(a, b) == low and len([n for n in ns if n]) > 2):
                        dis.append(f'T{int(t // bar) + 1}.{t % bar:g} {"SATBP"[i]}{"SATBP"[j]} {iv}')
            for i in range(len(ns) - 1):
                if ns[i] and ns[i + 1] and ns[i + 1] > ns[i]: cross.append(f'T{int(t // bar) + 1}')
        t += .5
    r = report(voices[:4])
    print(f'{name}: {total / bar:g} Takte, Parallelen {len(r["Parallelen"])} {r["Parallelen"][:6]}, Sprünge {r["größter Sprung S/A/T/B"]}')
    print(f'  betonte Dissonanzen {len(dis)}: {dis[:40]}')
    if cross: print(f'  Stimmkreuzungen: {sorted(set(cross))[:20]}')
    return dis

if __name__ == '__main__':
    j = json.load(open(sys.argv[1])); bar = int(sys.argv[2]) if len(sys.argv) > 2 else 8; schwer = float(sys.argv[3]) if len(sys.argv) > 3 else 4
    for k, teil in enumerate(j.get('teile', [j])): pruefen(teil['voices'], int(teil.get('bar', bar)), schwer, name=teil.get('name', sys.argv[1]))
