"""Prüft den Level-Generator aus index.html in Node: python3 tools/test_generator.py"""
import re, subprocess, pathlib, tempfile
h = (pathlib.Path(__file__).resolve().parent.parent / 'index.html').read_text()
js = re.search(r'<script>\n\{(.*)\n\}\n</script>', h, re.S).group(1)
core = js.split('/* ---- Zustand')[0].replace('localStorage.getItem(KEY)', 'null')
code = 'const location={hash:""},localStorage={getItem:()=>null};' + core + """
let worst=0;for(let L=1;L<=60;L++){const t=Date.now();const s=generate(L);const dt=Date.now()-t;worst=Math.max(worst,dt);if(s.length>levelCfg(L).colors+2)console.log('Notfall-Glas',L);if(!solvable(s,1e6)){console.log('UNLÖSBAR',L);process.exit(1)}}console.log('langsamstes Level',worst,'ms');
console.log('OK: Level 1-60 lösbar');"""
f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False); f.write(code); f.close()
subprocess.run(['node', f.name], check=True)
