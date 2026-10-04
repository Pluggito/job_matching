const fs = require('fs');
let c = fs.readFileSync('src/app/globals.css', 'utf8');

c = c.replace(/@import url\('https:\/\/fonts\.googleapis\.com[^']+'\);\r?\n?/, '');
c = c.replace(/'Space Grotesk'/g, 'var(--font-space-grotesk)');
c = c.replace(/'DM Mono'/g, 'var(--font-dm-mono)');
c = c.replace(/Manrope/g, 'var(--font-manrope)');

fs.writeFileSync('src/app/globals.css', c);
console.log("Replaced fonts!");
