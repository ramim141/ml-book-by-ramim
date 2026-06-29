const fs = require('fs');
const txt = fs.readFileSync('d:/machine-learning-book-by-ramim/qb_temp.txt', 'utf-8');
const matches = txt.match(/".*?\?+.*?"/g);
if (matches) {
    const unique = Array.from(new Set(matches));
    console.log(unique.join('\n'));
}
