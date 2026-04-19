const fs = require('fs');
const content = fs.readFileSync('assets/index-BBIwAgSn.js', 'utf8');

const haldiIdx = content.indexOf('"Haldi"');
if (haldiIdx !== -1) {
    const context = content.substring(Math.max(0, haldiIdx - 600), Math.min(content.length, haldiIdx + 200));
    console.log(context);
}
