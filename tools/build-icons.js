// Alat build sekali jalan (opsional): membuat assets/icons/*.svg dari assets/js/icons.js
// Jalankan: node tools/build-icons.js   (bukan backend; hanya generator file statis)
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '../assets/js/icons.js'), 'utf8');
const win = {};
new Function('window', src)(win);
const out = path.join(__dirname, '../assets/icons');
fs.mkdirSync(out, { recursive: true });
let n = 0;
for (const [name, body] of Object.entries(win.NT_ICONS)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${name}"><title>${name}</title>${body}</svg>\n`;
  fs.writeFileSync(path.join(out, name + '.svg'), svg);
  n++;
}
console.log('Ikon dibuat:', n);
