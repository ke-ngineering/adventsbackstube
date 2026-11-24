"""Eigene Kompositionen (D69) neu berechnen und als STUECKE in js/core.js eintragen (zwischen den Markierungen).
Aufruf: python3 tools/satz/stuecke.py"""
import json, subprocess, sys, os, re
HIER = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HIER, '..', '..')
lauf = lambda name: json.loads(subprocess.run([sys.executable, os.path.join(HIER, name)], capture_output=True, text=True, check=True).stdout)
kompakt = lambda x: json.dumps(x, separators=(',', ':'))

branle, intrada, musette, gigue = lauf('branle.py'), lauf('intrada.py'), lauf('musette.py'), lauf('gigue_dulci.py')
QUELLE = 'eigene Komposition (D69)'
js = []
js.append("  {name:'Branle über „Ding Dong! Merrily on High“', meter:4, mlabel:'2/2', tempo:.95, style:'streicher', room:.16, mix:[1.4,1.05,1.05,1.1], "
          f"src:'{QUELLE} über Arbeaus „Branle de l\\'Official“ (Orchésographie 1589, gemeinfrei)', satz:'Branle mit Glockenkaskade, Diminutionen, Echo und Tenorlied', "
          f"voices:{kompakt(branle['voices'])}, dyn:{kompakt(branle['dyn'])}}}")  # ohne Trommel (D70)
teile = [
    f"{{titel:'Intrada über „Macht hoch die Tür“', style:'blech', meter:3, mlabel:'3/4', tempo:1.4, percIns:'pauke', voices:{kompakt(intrada['voices'])}, perc:{kompakt(intrada['perc'])}, dyn:{kompakt(intrada['dyn'])}}}",
    f"{{titel:'Branle gay (Musette) über „Ding Dong! Merrily on High“', style:'musette', meter:3, mlabel:'3/4', tempo:.75, room:.14, mix:[1.1,.75,.85,.5], voices:{kompakt(musette['voices'])}, dyn:{kompakt(musette['dyn'])}}}",
    f"{{titel:'Gigue über „In dulci jubilo“', style:'tanz', meter:3, mlabel:'6/8', pickup:1, tempo:.85, voices:{kompakt(gigue['voices'])}, dyn:{kompakt(gigue['dyn'])}, wechsel:{kompakt(gigue['wechsel'])}}}",
]
js.append("  {name:'Weihnachts-Suite: Intrada – Branle gay – Gigue', style:'blech', "
          f"src:'{QUELLE} über „Macht hoch die Tür“, „Ding Dong! Merrily on High“ und „In dulci jubilo“ (gemeinfrei)', satz:'Suite in drei Sätzen', teile:[\n    "
          + ',\n    '.join(teile) + "]}")
block = '// STUECKE-ANFANG (erzeugt von tools/satz/stuecke.py – nicht von Hand ändern)\nconst STUECKE = [\n' + ',\n'.join(js) + '];\n// STUECKE-ENDE'
p = os.path.join(ROOT, 'js', 'core.js'); s = open(p, encoding='utf8').read()
if '// STUECKE-ANFANG' in s: s = re.sub(r'// STUECKE-ANFANG.*?// STUECKE-ENDE', lambda m: block, s, flags=re.S)
else: s = s.replace('const ALLE_LIEDER = MELODIES.concat(LIED_VARIANTEN);', block + "\nSTUECKE.forEach(m => { m.notes = m.notes || (m.teile ? m.teile[0].voices[0] : m.voices[0]); m.eigen = true; });\nconst ALLE_LIEDER = MELODIES.concat(LIED_VARIANTEN, STUECKE);")
open(p, 'w', encoding='utf8').write(s)
print('OK', len(s) // 1024, 'KB core.js')
