const fs = require('fs');
const content = fs.readFileSync('d:/chrome extentions/Raas~Rang - Copy/scripts/amar-ujala-paths.txt', 'utf8');

const minX = 22, maxX = 435, minY = 300, maxY = 448;
const W = maxX - minX;
const H = maxY - minY;

function pdfToSvgPath(commands) {
  return commands.replace(/([0-9.-]+)\s+([0-9.-]+)\s+m/g, (_, x, y) => {
    return 'M ' + (parseFloat(x) - minX).toFixed(2) + ' ' + (maxY - parseFloat(y)).toFixed(2);
  }).replace(/([0-9.-]+)\s+([0-9.-]+)\s+l/g, (_, x, y) => {
    return 'L ' + (parseFloat(x) - minX).toFixed(2) + ' ' + (maxY - parseFloat(y)).toFixed(2);
  }).replace(/([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+c/g, (_, x1, y1, x2, y2, x, y) => {
    return 'C ' + (parseFloat(x1) - minX).toFixed(2) + ' ' + (maxY - parseFloat(y1)).toFixed(2) + ' ' +
                  (parseFloat(x2) - minX).toFixed(2) + ' ' + (maxY - parseFloat(y2)).toFixed(2) + ' ' +
                  (parseFloat(x) - minX).toFixed(2) + ' ' + (maxY - parseFloat(y)).toFixed(2);
  }).replace(/\bh\b/g, 'Z').replace(/\bs\b/g, '').replace(/\bf\*\b/g, '').replace(/[^MLCZ0-9. -]/g, ' ');
}

const letterSectionStart = content.indexOf('0.0000 0.0000 0.0000 1.0000 k\n') + 30;
const letterSectionEnd = content.indexOf('\nf*\n', letterSectionStart);
const letterCommands = content.slice(letterSectionStart, letterSectionEnd);
const letterD = pdfToSvgPath(letterCommands).trim();

const borderStart = content.indexOf('54.8490 444.2031 m');
const borderEnd = content.indexOf('\ns\n', borderStart);
const borderCommands = content.slice(borderStart, borderEnd);
const borderD = pdfToSvgPath(borderCommands).trim();

const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W.toFixed(0) + ' ' + H.toFixed(0) + '" width="' + W.toFixed(0) + '" height="' + H.toFixed(0) + '">\n' +
  '  <!-- White rounded plate background -->\n' +
  '  <path d="' + borderD + ' Z" fill="#ffffff" stroke="#111111" stroke-width="2.5" />\n' +
  '  <!-- PRINT PARTNER header text -->\n' +
  '  <text x="' + (W / 2).toFixed(2) + '" y="33" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="900" letter-spacing="3" text-anchor="middle" fill="#111111">PRINT PARTNER</text>\n' +
  '  <!-- Amar Ujala Hindi vector typography -->\n' +
  '  <path d="' + letterD + '" fill="#111111" fill-rule="evenodd" />\n' +
  '</svg>';

fs.writeFileSync('d:/chrome extentions/Raas~Rang - Copy/public/assets/images/sponsors/amar-ujala.svg', svg);
console.log('Clean SVG generated!');
