const sharp = require('sharp');
const path = require('path');

const sponsorDir = path.resolve(__dirname, '../public/assets/images/sponsors');

async function test() {
  const cMeta = { width: 940, height: 934 };
  const rx = 150;
  const svg = `<svg width="${cMeta.width}" height="${cMeta.height}"><rect width="${cMeta.width}" height="${cMeta.height}" rx="${rx}" ry="${rx}" fill="white"/></svg>`;
  const maskPng = await sharp(Buffer.from(svg)).resize(cMeta.width, cMeta.height).png().toBuffer();
  console.log('maskPng meta:', await sharp(maskPng).metadata());
}
test();
