const sharp = require('sharp');
const path = require('path');

const sponsorDir = path.resolve(__dirname, '../public/assets/images/sponsors');

async function processAmarUjala() {
  const { data, info } = await sharp(path.join(sponsorDir, 'amar-ujala-raw.jpg'))
    .raw()
    .toBuffer({ resolveWithObject: true });

  let minX = info.width, maxX = 0, minY = info.height, maxY = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      if (data[idx] < 120 && data[idx+1] < 120 && data[idx+2] < 120) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const pad = 8;
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const width = Math.min(info.width - left, (maxX - minX) + pad * 2);
  const height = Math.min(info.height - top, (maxY - minY) + pad * 2);

  const cropped = await sharp(path.join(sponsorDir, 'amar-ujala-raw.jpg'))
    .extract({ left, top, width, height })
    .png()
    .toBuffer();

  const cMeta = await sharp(cropped).metadata();
  const rx = Math.round(cMeta.height * 0.18);
  const svg = `<svg width="${cMeta.width}" height="${cMeta.height}"><rect width="${cMeta.width}" height="${cMeta.height}" rx="${rx}" ry="${rx}" fill="white"/></svg>`;
  const maskPng = await sharp(Buffer.from(svg)).resize(cMeta.width, cMeta.height).png().toBuffer();

  await sharp(cropped)
    .composite([{ input: maskPng, blend: 'dest-in' }])
    .resize({ width: 440, height: 180, fit: 'inside' })
    .webp({ quality: 95 })
    .toFile(path.join(sponsorDir, 'amar-ujala.webp'));

  console.log('Processed: amar-ujala.webp successfully!');

  const generated = ['caha-coffee-club.webp', 'onkar-furniture.webp', 'shri-balaji.webp', 'gd-goenka.webp', 'amar-ujala.webp'];
  for (const f of generated) {
    const meta = await sharp(path.join(sponsorDir, f)).metadata();
    console.log(f, `${meta.width}x${meta.height}`, meta.format);
  }
}

processAmarUjala().catch(console.error);
