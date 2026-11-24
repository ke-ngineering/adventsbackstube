// gibt die Melodie eines Liedes aus js/core.js als JSON aus: node tools/satz/melodie.js "O du fröhliche"
const fs = require('fs'); const location = {hash: '', search: ''}, localStorage = {getItem: () => null, setItem() {}}, window = {}, document = {addEventListener() {}, hidden: false, getElementById: () => null}, navigator = {userAgent: 't'};
eval(fs.readFileSync(__dirname + '/../../js/core.js', 'utf8') + '; const m = MELODIES.find(x => x.name === process.argv[2]); console.log(JSON.stringify(m ? m.notes : null));');
