function safeCompare(a, b) {
  if (!a || !b) return false;
  const encoder = new TextEncoder();
  const bufA = encoder.encode(String(a));
  const bufB = encoder.encode(String(b));

  if (bufA.byteLength !== bufB.byteLength) return false;

  let result = 0;
  for (let i = 0; i < bufA.byteLength; i++) {
    result |= bufA[i] ^ bufB[i];
  }
  return result === 0;
}

export function authenticateRequest(request, env) {
  const adminKey = env?.ADMIN_API_KEY || (typeof process !== 'undefined' ? process.env?.ADMIN_API_KEY : undefined);
  const volunteerKey = env?.VOLUNTEER_API_KEY || (typeof process !== 'undefined' ? process.env?.VOLUNTEER_API_KEY : undefined);

  const providedKey = request.headers.get('x-api-key');

  if (!providedKey) {
    return { isAuthorized: false, role: null };
  }

  if (adminKey && safeCompare(providedKey, adminKey)) {
    return { isAuthorized: true, role: 'admin' };
  }

  if (volunteerKey && safeCompare(providedKey, volunteerKey)) {
    return { isAuthorized: true, role: 'volunteer' };
  }

  return { isAuthorized: false, role: null };
}
