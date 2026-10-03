const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const NAME_REGEX = /^[a-zA-Z\s.]{2,60}$/;

export function validateBookingInput(data) {
  const errors = [];

  // 1. Name validation
  const rawName = data?.name ? String(data.name).trim() : '';
  if (!rawName || rawName.length < 2 || rawName.length > 60 || !NAME_REGEX.test(rawName)) {
    errors.push('Full name must be 2–60 characters and contain only letters and spaces.');
  }

  // 2. Mobile validation
  const rawMobile = data?.mobile ? String(data.mobile).trim() : '';
  if (!rawMobile || !MOBILE_REGEX.test(rawMobile)) {
    errors.push('Mobile number must be a valid 10-digit Indian number starting with 6, 7, 8, or 9.');
  }

  // 3. Email validation
  const rawEmail = data?.email ? String(data.email).trim().toLowerCase() : '';
  if (!rawEmail || !EMAIL_REGEX.test(rawEmail) || rawEmail.length > 120) {
    errors.push('Please provide a valid email address.');
  }

  // 4. Pass Type validation
  const rawPassType = data?.passType ? String(data.passType).trim().toUpperCase() : '';
  if (!['SIGMA', 'COUPLE', 'FAMILY'].includes(rawPassType)) {
    errors.push('Invalid pass type selected. Choose SIGMA, COUPLE, or FAMILY.');
  }

  // 5. Spot ID validation
  const spotIdNum = parseInt(data?.spotId, 10);
  if (isNaN(spotIdNum) || spotIdNum <= 0) {
    errors.push('Please select a valid ticket collection spot.');
  }

  // 6. Terms accepted
  if (data?.termsAccepted !== true && data?.termsAccepted !== 'true') {
    errors.push('You must accept the terms and conditions.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      name: rawName,
      mobile: rawMobile,
      email: rawEmail,
      passType: rawPassType,
      spotId: spotIdNum,
    },
  };
}

export function maskMobile(mobile) {
  if (!mobile || mobile.length < 10) return 'XXXXXXXXXX';
  return `${mobile.slice(0, 2)}XXXXXX${mobile.slice(-2)}`;
}

export function maskEmail(email) {
  if (!email || !email.includes('@')) return '*****@***.***';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  return `${user[0]}${'*'.repeat(user.length - 2)}${user.slice(-1)}@${domain}`;
}
