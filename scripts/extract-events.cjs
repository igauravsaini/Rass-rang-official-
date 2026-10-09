const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const srcPath = 'C:/Users/Lenovo/.gemini/antigravity-ide/brain/7533f193-ea58-433a-8937-dffd0a31c2fc/.user_uploaded/media_1791397917246.jpg';
const outDir = path.resolve(__dirname, '../public/assets/images/events');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 8 cards coordinates:
// Row 1: y = 13, h = 262
// Row 2: y = 289, h = 262
// Columns:
// Col 0: x = 47, w = 221
// Col 1: x = 287, w = 221
// Col 2: x = 523, w = 221
// Col 3: x = 761, w = 221

const cards = [
  { id: 'garba', col: 0, row: 0, name: 'Garba Night' },
  { id: 'dandiya', col: 1, row: 0, name: 'Dandiya Raas' },
  { id: 'cultural', col: 2, row: 0, name: 'Live Cultural Shows' },
  { id: 'music', col: 3, row: 0, name: 'DJ & Folk Music' },
  { id: 'food', col: 0, row: 1, name: 'Food Festival' },
  { id: 'fashion', col: 1, row: 1, name: 'Traditional Fashion' },
  { id: 'family', col: 2, row: 1, name: 'Family Zone' },
  { id: 'photo', col: 3, row: 1, name: 'Photo Booth' }
];

const colX = [47, 287, 523, 761];
const rowY = [13, 289];
const cardW = 221;
const cardH = 262;

async function extract() {
  for (const c of cards) {
    const x = colX[c.col];
    const y = rowY[c.row];

    // 1. Extract full card
    await sharp(srcPath)
      .extract({ left: x, top: y, width: cardW, height: cardH })
      .webp({ quality: 92 })
      .toFile(path.join(outDir, c.id + '-card.webp'));

    // 2. Extract upper illustration (artwork only)
    await sharp(srcPath)
      .extract({ left: x + 8, top: y + 8, width: cardW - 16, height: 130 })
      .webp({ quality: 92 })
      .toFile(path.join(outDir, c.id + '-art.webp'));

    console.log('Extracted:', c.id);
  }
}

extract().then(() => console.log('All 8 cards extracted successfully.'));
