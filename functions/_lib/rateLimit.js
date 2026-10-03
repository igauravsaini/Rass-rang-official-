const ipHits = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

export function checkRateLimit(ip) {
  if (!ip || ip === 'unknown') {
    return { allowed: true, remaining: MAX_REQUESTS };
  }

  const now = Date.now();
  const entry = ipHits.get(ip);

  if (!entry || now - entry.firstHit > WINDOW_MS) {
    ipHits.set(ip, { count: 1, firstHit: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (entry.count >= MAX_REQUESTS) {
    const resetInSeconds = Math.ceil((WINDOW_MS - (now - entry.firstHit)) / 1000);
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count };
}

export function getClientIp(request) {
  // Cloudflare native header
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim();

  return 'unknown';
}
