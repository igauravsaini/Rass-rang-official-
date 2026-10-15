const sharp = require('sharp');
const path = require('path');

const sponsorDir = path.resolve(__dirname, '../public/assets/images/sponsors');

async function testCrop() {
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

  console.log('Bounds:', { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY });

  // Extract the badge exactly
  await sharp(path.join(sponsorDir, 'amar-ujala-raw.jpg'))
    .extract({ left: minX, top: minY, width: maxX - minX, height: maxY - minY })
    .resize({ width: 440, height: 180, fit: 'inside' })
    .webp({ quality: 95 })
    .toFile(path.join(sponsorDir, 'amar-ujala.webp'));

  console.log('amar-ujala.webp extracted!');
}
testCrop();
