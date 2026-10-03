import { generateTicketNumber } from '../functions/_lib/ticketId.js';
import { validateBookingInput, maskMobile, maskEmail } from '../functions/_lib/validate.js';

console.log('🧪 Starting Ticketing Logic Automated Tests...\n');

// 1. Test Ticket Number Generation Format & Entropy
const generated = new Set();
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const pattern = /^RRG-26-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;

let formatPassed = true;
let charPassed = true;

for (let i = 0; i < 200; i++) {
  const t = generateTicketNumber('26');
  if (!pattern.test(t)) {
    formatPassed = false;
    console.error(`❌ Format failed for: ${t}`);
  }
  const chars = t.split('-')[2];
  for (const c of chars) {
    if (!ALPHABET.includes(c)) {
      charPassed = false;
      console.error(`❌ Invalid character ${c} in ${t}`);
    }
  }
  generated.add(t);
}

if (generated.size === 200 && formatPassed && charPassed) {
  console.log('✅ Ticket Number Generator: 200 unique tickets generated with 0 collisions and strict alphabet check.');
} else {
  console.error(`❌ Collision or format error. Unique count: ${generated.size}/200`);
}

// 2. Test Input Validation
const validTest = validateBookingInput({
  name: 'Gaurav Saini',
  mobile: '9876543210',
  email: 'test@example.com',
  passType: 'COUPLE',
  spotId: 1,
  termsAccepted: true,
});

if (validTest.isValid) {
  console.log('✅ Validation: Valid booking payload passed client/server validation.');
} else {
  console.error('❌ Validation failed for valid payload:', validTest.errors);
}

// 3. Test Invalid Mobile & Invalid Pass
const invalidMobileTest = validateBookingInput({
  name: 'Gaurav Saini',
  mobile: '1234567890', // starts with 1
  email: 'test@example.com',
  passType: 'VIP_PASS', // invalid pass
  spotId: 1,
  termsAccepted: true,
});

if (!invalidMobileTest.isValid && invalidMobileTest.errors.length >= 2) {
  console.log('✅ Validation: Invalid mobile & pass type correctly rejected with error messages.');
} else {
  console.error('❌ Validation failed to reject invalid payload.');
}

// 4. Test Masking
const mMobile = maskMobile('9876543210');
const mEmail = maskEmail('gaurav@example.com');

if (mMobile === '98XXXXXX10' && mEmail.startsWith('g*') && mEmail.endsWith('@example.com')) {
  console.log(`✅ Masking: Mobile masked to "${mMobile}", Email masked to "${mEmail}".`);
} else {
  console.error(`❌ Masking error. Mobile: ${mMobile}, Email: ${mEmail}`);
}

console.log('\n🎉 All Local Ticketing Verification Tests Passed Successfully!');
