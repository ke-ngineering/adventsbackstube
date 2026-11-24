/* Zeichnungen (SVG, keine Emojis – D6): Plätzchen für die Dose, Krümel die Backstuben-Maus, das Bild der Backstube. */
const Art = (() => {
const P = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
const pts = a => a.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
function starPts(cx, cy, R, r, n = 5, rot = -Math.PI / 2) { const o = []; for (let i = 0; i < n * 2; i++) o.push(P(cx, cy, i % 2 ? r : R, rot + i * Math.PI / n)); return pts(o); }
function scallop(cx, cy, R, n, d) { // gewellter Rand
  let s = ''; for (let i = 0; i <= n * 8; i++) { const a = i / (n * 8) * 2 * Math.PI, r = R + d * Math.cos(a * n); const [x, y] = P(cx, cy, r, a); s += (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1); } return s + 'Z';
}
const heart = (cx, cy, s) => `M${cx},${cy + 30 * s} C${cx - 46 * s},${cy} ${cx - 34 * s},${cy - 34 * s} ${cx},${cy - 14 * s} C${cx + 34 * s},${cy - 34 * s} ${cx + 46 * s},${cy} ${cx},${cy + 30 * s}Z`;
const sprinkle = (seed, n, cx, cy, r, cols, len = 5) => { const R = rng(seed); let o = ''; for (let i = 0; i < n; i++) { const a = R() * 6.283, d = Math.sqrt(R()) * r, x = cx + d * Math.cos(a), y = cy + d * Math.sin(a), t = R() * 180; o += `<rect x="${(x - len / 2).toFixed(1)}" y="${(y - 1.2).toFixed(1)}" width="${len}" height="2.4" rx="1.2" fill="${cols[i % cols.length]}" transform="rotate(${t.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; } return o; };
const dots = (seed, n, cx, cy, r, col, rr = 1.6) => { const R = rng(seed); let o = ''; for (let i = 0; i < n; i++) { const a = R() * 6.283, d = Math.sqrt(R()) * r; o += `<circle cx="${(cx + d * Math.cos(a)).toFixed(1)}" cy="${(cy + d * Math.sin(a)).toFixed(1)}" r="${rr}" fill="${col}"/>`; } return o; };
const shade = '<ellipse cx="50" cy="88" rx="30" ry="5" fill="rgba(60,30,10,.18)"/>';
const D = {teig: '#e7b56e', teigR: '#b9803f', braun: '#9a5a2c', braunR: '#6f3d1c', schoko: '#5a3420', schokoR: '#3c2113', weiss: '#fff8ea', rot: '#c8283a', gelee: '#b0192f', gruen: '#4f8a3c', gold: '#e8b437'};

const COOKIE_ART = {
  butter: () => `<path d="${scallop(50, 50, 34, 12, 3)}" fill="${D.teig}" stroke="${D.teigR}" stroke-width="2"/><circle cx="50" cy="50" r="24" fill="#f0c784"/>${sprinkle(1, 14, 50, 50, 20, [D.rot, D.gruen, D.gold, '#fff'])}`,
  herz: () => `<path d="${heart(50, 52, 1.15)}" fill="${D.braun}" stroke="${D.braunR}" stroke-width="2"/><path d="${heart(50, 52, .95)}" fill="none" stroke="${D.weiss}" stroke-width="3" stroke-dasharray="1 6" stroke-linecap="round"/><path d="${heart(50, 50, .42)}" fill="${D.rot}"/>`,
  kipferl: () => `<path d="M18,62 C22,30 78,30 82,62 C74,46 26,46 18,62Z" fill="${D.teig}" stroke="${D.teigR}" stroke-width="2"/>${dots(3, 26, 50, 46, 18, '#fffdf6', 1.4)}`,
  spritz: () => `<path d="M20,40 q10,-12 20,0 t20,0 t20,0 v22 q-10,12 -20,0 t-20,0 t-20,0Z" fill="${D.teig}" stroke="${D.teigR}" stroke-width="2"/><path d="M60,40 q10,-12 20,0 v22 q-10,12 -20,0Z" fill="${D.schoko}"/><path d="M26,46 h50 M26,52 h50 M26,58 h50" stroke="${D.teigR}" stroke-width="1" opacity=".5"/>`,
  zimtstern: () => `<polygon points="${starPts(50, 52, 38, 17)}" fill="${D.braun}" stroke="${D.braunR}" stroke-width="2" stroke-linejoin="round"/><polygon points="${starPts(50, 50, 32, 14)}" fill="${D.weiss}" stroke-linejoin="round"/>`,
  stiefel: () => `<path d="M34,18 h26 v40 h16 q10,0 10,12 v8 h-52Z" fill="${D.braun}" stroke="${D.braunR}" stroke-width="2" stroke-linejoin="round"/><path d="M36,22 h22 v14 h-22Z" fill="${D.weiss}"/><path d="M38,40 h18 v20 h18 q8,0 8,8 v6 h-44Z" fill="${D.rot}"/>${dots(4, 5, 46, 28, 8, '#d6c8b8', 1.5)}`,
  spitzbube: () => `<path d="${scallop(50, 50, 34, 10, 3)}" fill="${D.teig}" stroke="${D.teigR}" stroke-width="2"/>${dots(5, 40, 50, 50, 30, '#fffdf6', 1.3)}<circle cx="50" cy="50" r="10" fill="${D.gelee}"/><circle cx="47" cy="47" r="3" fill="#e0606e"/>`,
  florentiner: () => `<path d="${scallop(50, 52, 34, 7, 3.5)}" fill="${D.schoko}"/><path d="${scallop(50, 49, 32, 9, 3)}" fill="#d9993a"/>${[[38, 40, 20], [56, 44, -30], [46, 58, 70], [62, 58, 10], [40, 52, -60], [54, 34, 45]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="2.6" fill="#f3dcae" stroke="#c9944d" stroke-width=".8" transform="rotate(${r} ${x} ${y})"/>`).join('')}`,
  ausstecher: () => `<polygon points="${starPts(50, 52, 38, 18, 6)}" fill="${D.teig}" stroke="${D.teigR}" stroke-width="2" stroke-linejoin="round"/>${sprinkle(9, 18, 50, 52, 22, ['#e45c8a', '#4aa3df', D.gold, '#fff', D.gruen])}`,
  lebkuchen: () => `<circle cx="50" cy="52" r="36" fill="${D.braunR}"/><circle cx="50" cy="50" r="34" fill="${D.schoko}"/><path d="M24,40 q8,-12 20,-14" stroke="rgba(255,255,255,.25)" stroke-width="3" fill="none" stroke-linecap="round"/>${[[50, 36, 90], [38, 58, 30], [62, 58, 150]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="5" fill="#e2c49a" stroke="#a9794e" stroke-width="1" transform="rotate(${r} ${x} ${y})"/>`).join('')}`,
  linzer: () => `<path d="${scallop(50, 50, 34, 14, 2.5)}" fill="${D.teig}" stroke="${D.teigR}" stroke-width="2"/>${dots(10, 36, 50, 50, 30, '#fffdf6', 1.3)}${[[50, 38], [39, 57], [61, 57]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6.5" fill="${D.gelee}"/>`).join('')}`,
  makrone: () => `<path d="M18,70 q-4,-30 18,-40 q14,-10 28,0 q22,10 18,40Z" fill="#f4e7cf" stroke="#d9bf92" stroke-width="2"/>${dots(11, 40, 50, 52, 24, '#e3cfa6', 1.4)}<circle cx="50" cy="28" r="8" fill="${D.rot}"/><path d="M50,20 q4,-8 10,-10" stroke="#5d7a2e" stroke-width="2" fill="none"/>`,
  franz: () => `<ellipse cx="50" cy="52" rx="38" ry="30" fill="#c98a4a" stroke="#8f5a28" stroke-width="2"/><path d="M50,52 m-4,0 a4,4 0 1,1 8,0 a10,9 0 1,1 -18,0 a16,14 0 1,1 32,0 a22,20 0 1,1 -44,0" fill="none" stroke="#7b4520" stroke-width="3.5" stroke-linecap="round"/>${dots(12, 18, 50, 52, 26, '#fff6e0', 1.2)}`,
  pfeffernuss: () => `<circle cx="50" cy="54" r="28" fill="${D.braunR}"/><path d="M22,54 a28,28 0 0,1 56,0 q-6,6 -14,2 q-6,6 -14,0 q-6,6 -14,0 q-8,4 -14,-2Z" fill="${D.weiss}"/>`,
  baerentatze: () => `<path d="M20,64 q0,-34 30,-38 q30,4 30,38Z" fill="${D.schoko}" stroke="${D.schokoR}" stroke-width="2"/>${[30, 40, 50, 60, 70].map(x => `<path d="M${x},62 L${50 + (x - 50) * .45},34" stroke="${D.schokoR}" stroke-width="2"/>`).join('')}${[28, 39, 50, 61, 72].map(x => `<ellipse cx="${x}" cy="68" rx="3" ry="5" fill="#e2c49a"/>`).join('')}`,
  engelsauge: () => `<circle cx="50" cy="52" r="32" fill="${D.teig}" stroke="${D.teigR}" stroke-width="2"/><circle cx="50" cy="50" r="12" fill="${D.gelee}"/><circle cx="46" cy="46" r="3.5" fill="#e0606e"/>${dots(13, 10, 50, 52, 30, '#fffdf6', 1.2)}`,
  auszogne: () => `<circle cx="50" cy="52" r="38" fill="#d6913f"/><circle cx="50" cy="51" r="34" fill="#e9b064"/><circle cx="50" cy="50" r="22" fill="#f7deb0"/><circle cx="50" cy="50" r="22" fill="none" stroke="#e0a756" stroke-width="3"/>${dots(14, 50, 50, 50, 36, '#fffdf6', 1.3)}`,
  heidesand: () => `<circle cx="50" cy="52" r="32" fill="#f2d9a6"/><circle cx="50" cy="52" r="32" fill="none" stroke="#fffaf0" stroke-width="5" stroke-dasharray="2 2.5"/><circle cx="50" cy="52" r="24" fill="#e7bd78"/>`,
  schoko: () => `${dots(15, 22, 50, 54, 26, D.schoko, 9)}${dots(16, 14, 50, 50, 22, D.schokoR, 5)}${dots(17, 8, 46, 44, 16, '#8a5a3a', 2.5)}`,
  domino: () => `<path d="M24,40 L50,28 L76,40 L76,68 L50,80 L24,68Z" fill="${D.schoko}"/><path d="M24,40 L50,52 L76,40 L50,28Z" fill="#7a4a2c"/><path d="M50,52 V80" stroke="${D.schokoR}" stroke-width="1.5"/><path d="M24,52 L50,64 L76,52" stroke="#c84a5a" stroke-width="3" fill="none"/><path d="M24,60 L50,72 L76,60" stroke="#f2b8b0" stroke-width="3" fill="none"/>`,
  mohn: () => `<circle cx="50" cy="52" r="34" fill="#ecc788" stroke="#b9803f" stroke-width="2"/><path d="M50,52 m-4,0 a4,4 0 1,1 8,0 a9,9 0 1,1 -18,0 a15,15 0 1,1 30,0 a21,21 0 1,1 -42,0" fill="none" stroke="#3d4a6b" stroke-width="5" stroke-linecap="round"/><path d="M30,42 q8,-10 18,-12" stroke="#fffaf0" stroke-width="2" fill="none" opacity=".7"/>`,
  nussecke: () => `<path d="M16,74 L84,74 L50,20Z" fill="#c98a4a" stroke="#8f5a28" stroke-width="2" stroke-linejoin="round"/><path d="M16,74 L28,74 L22,64Z M84,74 L72,74 L78,64Z M50,20 L44,30 L56,30Z" fill="${D.schoko}"/>${dots(18, 22, 50, 56, 16, '#7b4520', 2.4)}`,
  stollen: () => `<path d="M26,38 L50,28 L74,38 L74,66 L50,76 L26,66Z" fill="#f2dfb5"/><path d="M26,38 L50,48 L74,38 L50,28Z" fill="#fffaf0"/>${dots(19, 10, 40, 58, 9, '#a14a2a', 2)}${dots(20, 10, 62, 58, 9, '#6a2b52', 2)}${dots(21, 30, 50, 38, 16, '#ffffff', 1.4)}`,
  wolke: () => `<path d="M18,72 L50,30 L82,72Z" fill="#fdf3dc"/><path d="M18,72 L82,72 L82,78 L18,78Z" fill="#a4683c"/><path d="M30,56 L50,30 L70,56Z" fill="#fff9ec"/><path d="M28,46 q22,-26 44,0 q-4,6 -10,2 q-6,6 -12,0 q-6,6 -12,0 q-6,4 -10,-2Z" fill="#d98b3a"/>${dots(22, 10, 50, 40, 10, '#b5352f', 2.4)}${dots(23, 8, 50, 38, 12, '#f2d9a6', 1.6)}`,
};
function cookie(id, size = 64) { const f = COOKIE_ART[id]; return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${shade}${f ? f() : ''}</svg>`; }

/* Krümel: kleine Maus mit Kochmütze und rotem Schal */
function kruemel(size = 72, mood = 'froh') {
  const mouth = mood === 'staunen' ? '<ellipse cx="50" cy="63" rx="3" ry="3.5" fill="#6b3b3b"/>' : '<path d="M45,61 q5,5 10,0" stroke="#6b3b3b" stroke-width="2" fill="none" stroke-linecap="round"/>';
  return `<svg viewBox="0 0 100 110" width="${size}" height="${size * 1.1}" class="kruemel" aria-hidden="true">
  <path d="M74,92 q22,4 18,-16 q-3,-12 -12,-6" stroke="#9c8a7a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="50" cy="86" rx="24" ry="20" fill="#a8968a"/><ellipse cx="50" cy="90" rx="15" ry="13" fill="#e9ddd2"/>
  <ellipse cx="40" cy="104" rx="7" ry="4" fill="#f0a9b0"/><ellipse cx="60" cy="104" rx="7" ry="4" fill="#f0a9b0"/>
  <circle cx="24" cy="38" r="15" fill="#a8968a"/><circle cx="24" cy="38" r="9" fill="#f0a9b0"/>
  <circle cx="76" cy="38" r="15" fill="#a8968a"/><circle cx="76" cy="38" r="9" fill="#f0a9b0"/>
  <ellipse cx="50" cy="54" rx="24" ry="21" fill="#b4a296"/>
  <circle cx="41" cy="50" r="4" fill="#2b1d16"/><circle cx="59" cy="50" r="4" fill="#2b1d16"/><circle cx="42.3" cy="48.6" r="1.3" fill="#fff"/><circle cx="60.3" cy="48.6" r="1.3" fill="#fff"/>
  <ellipse cx="50" cy="58" rx="4" ry="3" fill="#e57b8a"/>${mouth}
  <path d="M38,58 l-14,-3 M38,61 l-14,2 M62,58 l14,-3 M62,61 l14,2" stroke="#6e5e54" stroke-width="1"/>
  <circle cx="34" cy="60" r="3.5" fill="#f0a9b0" opacity=".55"/><circle cx="66" cy="60" r="3.5" fill="#f0a9b0" opacity=".55"/>
  <path d="M30,72 q20,10 40,0 l2,6 q-22,12 -44,0Z" fill="#c8283a"/><path d="M60,76 l6,14 l-8,-1Z" fill="#a51f30"/>
  <path d="M34,36 q-6,-18 8,-20 q6,-12 16,-2 q14,-2 10,14 q-2,6 -4,8Z" fill="#fffdf8" stroke="#e5dccd" stroke-width="1.5"/><rect x="35" y="31" width="30" height="8" rx="3" fill="#fffdf8" stroke="#e5dccd" stroke-width="1.5"/>
</svg>`;
}

/* Das Bild der Backstube über dem Kalender. day = höchstes geöffnetes Türchen (0 = noch nichts), kerzen = brennende Adventskerzen */
function szene(day, kerzen, opts = {}) {
  const has = d => day >= d;
  const flame = (x, y, on) => on ? `<path d="M${x},${y} q-3,-5 0,-10 q3,5 0,10Z" fill="#ffc34d" class="flame"/><circle cx="${x}" cy="${y - 4}" r="7" fill="rgba(255,200,90,.25)"/>` : '';
  const candle = (x, i) => `<rect x="${x - 3}" y="132" width="6" height="16" rx="1" fill="${['#c8283a', '#c8283a', '#e8b437', '#c8283a'][i]}"/>${flame(x, 132, kerzen > i)}`;
  const jars = has(1) ? [0, 1, 2, 3, 4].map(i => `<rect x="${236 + i * 18}" y="58" width="13" height="18" rx="3" fill="${ING[[0, 1, 2, 5, 6][i]].c}" opacity=".9"/><rect x="${236 + i * 18}" y="55" width="13" height="4" rx="1" fill="#8a5533"/>`).join('') + [0, 1, 2, 3].map(i => `<rect x="${245 + i * 20}" y="88" width="13" height="18" rx="3" fill="${ING[[3, 8, 9, 10][i]].c}" opacity=".9"/><rect x="${245 + i * 20}" y="85" width="13" height="4" rx="1" fill="#8a5533"/>`).join('') : '';
  const lights = has(5) ? (() => { let o = '<path d="M12,14 Q60,34 110,14 T210,14 T310,14 T356,16" stroke="#3b5d2a" stroke-width="2" fill="none"/>'; const cols = has(16) ? ['#ff5a5a', '#ffd15a', '#ff5a5a', '#ffd15a'] : ['#ffe08a']; for (let i = 0; i < 16; i++) { const x = 20 + i * 22, y = 18 + 9 * Math.sin(i * 1.5 + .7); o += `<circle cx="${x}" cy="${y.toFixed(1)}" r="4" fill="${cols[i % cols.length]}" class="bulb"/>`; } return o; })() : '';
  const tree = has(11) ? `<g><path d="M318,150 L292,150 L305,128 L295,128 L310,104 L302,104 L318,76 L334,104 L326,104 L341,128 L331,128 L344,150Z" fill="#2f6b3a"/><rect x="313" y="150" width="10" height="10" fill="#6f3d1c"/>
    ${[[310, 120, '#c8283a'], [326, 135, '#e8b437'], [318, 98, '#e8b437'], [302, 142, '#4aa3df'], [334, 116, '#c8283a']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${c}"/>`).join('')}
    ${has(24) ? `<polygon points="${starPts(318, 74, 9, 4)}" fill="#ffd34d"/>` : ''}</g>` : '';
  const dose = opts.dose ? `<g><ellipse cx="200" cy="150" rx="22" ry="6" fill="#7a2b2b"/><rect x="178" y="134" width="44" height="16" fill="#a83838"/><ellipse cx="200" cy="134" rx="22" ry="6" fill="#c84a4a"/>
    ${[...Array(Math.min(8, Math.ceil(opts.dose / 3)))].map((_, i) => `<circle cx="${186 + (i % 4) * 9}" cy="${130 - Math.floor(i / 4) * 5}" r="5" fill="${['#e7b56e', '#9a5a2c', '#fff8ea', '#5a3420'][i % 4]}"/>`).join('')}</g>` : '';
  return `<svg viewBox="0 0 360 170" class="szene" role="img" aria-label="Die Backstube">
  <rect width="360" height="170" fill="var(--wall, #f6e2b8)"/>
  <rect x="0" y="150" width="360" height="20" fill="#8a5533"/><rect x="0" y="148" width="360" height="4" fill="#b27448"/>
  <g><rect x="26" y="34" width="86" height="70" rx="6" fill="#26304f"/>
    ${dots(77, 22, 69, 69, 38, '#ffffff', 1.3)}<path d="M26,92 q20,-8 43,-2 t43,2 v12 h-86Z" fill="#f4f6fb"/>
    ${has(14) ? '<g transform="translate(54 80)"><path d="M0,10 h26 q6,0 6,-6" stroke="#c8283a" stroke-width="3" fill="none"/><rect x="2" y="2" width="20" height="7" rx="2" fill="#c8283a"/></g>' : ''}
    <path d="M69,34 v70 M26,69 h86" stroke="#b27448" stroke-width="4"/><rect x="22" y="30" width="94" height="78" rx="8" fill="none" stroke="#8a5533" stroke-width="6"/></g>
  <g><rect x="228" y="76" width="104" height="6" fill="#8a5533"/><rect x="228" y="106" width="104" height="6" fill="#8a5533"/>${jars}</g>
  <rect x="140" y="128" width="200" height="0" fill="none"/>
  <g><ellipse cx="120" cy="148" rx="34" ry="7" fill="#3b6b33"/>${[98, 112, 128, 142].map(candle).join('')}</g>
  ${has(2) ? '<g><rect x="152" y="140" width="48" height="8" rx="2" fill="#8d8f96"/>' + [0, 1, 2, 3].map(i => `<circle cx="${160 + i * 11}" cy="142" r="4" fill="${i % 2 ? '#fff8ea' : '#e7b56e'}"/>`).join('') + '</g>' : ''}
  ${has(3) ? '<g transform="rotate(-6 150 60)"><rect x="136" y="44" width="30" height="36" fill="#fffaf0" stroke="#d9c8a8"/><path d="M141,54 h20 M141,60 h18 M141,66 h20 M141,72 h12" stroke="#b9a07a" stroke-width="1.5"/><circle cx="151" cy="46" r="2.5" fill="#c8283a"/></g>' : ''}
  ${has(4) ? '<path d="M214,148 l18,-14 q6,-2 4,4 l-16,12Z" fill="#f4efe6" stroke="#cfc4b4"/>' : ''}
  ${has(6) ? '<path d="M8,150 v-22 h12 v14 h8 q4,0 4,4 v4Z" fill="#c8283a"/><rect x="7" y="126" width="15" height="5" fill="#fff8ea"/>' : ''}
  ${has(7) ? '<g><rect x="184" y="64" width="30" height="8" fill="#7a2b2b"/><rect x="186" y="56" width="28" height="8" fill="#355c7d"/></g>' : ''}
  ${has(9) ? `<polygon points="${starPts(258, 142, 8, 4)}" fill="none" stroke="#9aa0a8" stroke-width="2"/><path d="${heart(278, 142, .22)}" fill="none" stroke="#9aa0a8" stroke-width="2"/>` : ''}
  ${dose}${tree}${lights}
  ${day === 0 ? '<rect width="360" height="170" fill="rgba(30,22,40,.55)"/>' : ''}
  ${day > 0 && opts.kruemel !== false ? `<g transform="translate(${day >= 24 ? 196 : 226} ${day >= 24 ? 92 : 118}) scale(.32)">${kruemel(100).replace(/<svg[^>]*>|<\/svg>/g, '')}</g>` : ''}
</svg>`;
}
return {cookie, kruemel, szene, starPts, heart};
})();
