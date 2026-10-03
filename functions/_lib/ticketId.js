const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const ALPHABET_LEN = ALPHABET.length;

/**
 * Generate cryptographically secure ticket number on Cloudflare Edge.
 * Format: RRG-<YY>-<6 chars>, e.g. RRG-26-7K3M9P
 * Excludes ambiguous chars: 0, O, 1, I, L.
 */
export function generateTicketNumber(year = '26') {
  const randomBytes = new Uint8Array(6);
  crypto.getRandomValues(randomBytes);

  let chars = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = randomBytes[i] % ALPHABET_LEN;
    chars += ALPHABET[randomIndex];
  }
  return `RRG-${year}-${chars}`;
}
