const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sponsorDir = path.resolve(__dirname, '../public/assets/images/sponsors');

async function processAll() {
  console.log('Processing sponsors in:', sponsorDir);

  // 1. Caha, The Coffee Club
  await sharp(path.join(sponsorDir, 'the-coffee-club.png'))
    .trim()
    .resize({ width: 440, height: 180, fit: 'inside' })
    .webp({ quality: 90 })
    .toFile(path.join(sponsorDir, 'caha-coffee-club.webp'));
  console.log('Processed: caha-coffee-club.webp');

  // 2. Onkar Furniture and Decor
  await sharp(path.join(sponsorDir, 'onkar-furniture.png'))
    .trim()
    .resize({ width: 440, height: 180, fit: 'inside' })
    .webp({ quality: 90 })
    .toFile(path.join(sponsorDir, 'onkar-furniture.webp'));
  console.log('Processed: onkar-furniture.webp');

  // 3. Shri Balaji Jewellers
  await sharp(path.join(sponsorDir, 'shri-balaji.png'))
    .trim()
    .resize({ width: 440, height: 180, fit: 'inside' })
    .webp({ quality: 90 })
    .toFile(path.join(sponsorDir, 'shri-balaji.webp'));
  console.log('Processed: shri-balaji.webp');

  // 4. GD Goenka Healthcare Academy (with circular mask so white square corners do not show)
  const goenkaTrimmed = await sharp(path.join(sponsorDir, 'gd-goenka.png'))
    .trim()
    .resize(240, 240, { fit: 'cover' })
    .toBuffer();

  const circleMask = Buffer.from(
    '<svg width="240" height="240"><circle cx="120" cy="120" r="120" fill="white" /></svg>'
  );

  await sharp(goenkaTrimmed)
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .webp({ quality: 95 })
    .toFile(path.join(sponsorDir, 'gd-goenka.webp'));
  console.log('Processed: gd-goenka.webp (circular masked)');

  // 5. Amar Ujala: black on white badge, crop to the badge and mask rounded rectangle with transparent outer background
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

  const pad = 10;
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const width = Math.min(info.width - left, (maxX - minX) + pad * 2);
  const height = Math.min(info.height - top, (maxY - minY) + pad * 2);

  const croppedPlate = await sharp(path.join(sponsorDir, 'amar-ujala-raw.jpg'))
    .extract({ left, top, width, height })
    .toBuffer();

  const rx = Math.round(height * 0.16);
  const plateMask = Buffer.from(
    `<svg width="${width}" height="${height}"><rect x="0" y="0" width="${width}" height="${height}" rx="${rx}" ry="${rx}" fill="white" /></svg>`
  );

  await sharp(croppedPlate)
    .composite([{ input: plateMask, blend: 'dest-in' }])
    .resize({ width: 440, height: 180, fit: 'inside' })
    .webp({ quality: 95 })
    .toFile(path.join(sponsorDir, 'amar-ujala.webp'));
  console.log('Processed: amar-ujala.webp');

  const generated = ['caha-coffee-club.webp', 'onkar-furniture.webp', 'shri-balaji.webp', 'gd-goenka.webp', 'amar-ujala.webp'];
  for (const f of generated) {
    const meta = await sharp(path.join(sponsorDir, f)).metadata();
    console.log(f, `${meta.width}x${meta.height}`, meta.format);
  }
}

processAll().catch(console.error);
