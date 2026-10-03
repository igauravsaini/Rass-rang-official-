/**
 * Safely parses JSON from a fetch Response, preventing
 * "SyntaxError: Unexpected end of JSON input" when the server returns
 * empty bodies (0 bytes), plain text, or HTML error pages.
 */
export async function safeParseJson<T = any>(res: Response): Promise<T> {
  const text = await res.text();
  const trimmed = (text || '').trim();

  if (!trimmed) {
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}: ${res.statusText || 'Empty response'}`);
    }
    return {} as T;
  }

  // Handle accidental HTML responses (e.g. SPA index.html fallback when API endpoint is missing or dev server needs restart)
  if (trimmed.startsWith('<!DOCTYPE html>') || trimmed.startsWith('<html') || trimmed.startsWith('<head')) {
    if (!res.ok) {
      throw new Error(`Server error (${res.status}): API endpoint not found.`);
    }
    throw new Error('API route returned HTML instead of JSON. If running locally, please restart `npm run dev`.');
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    if (!res.ok) {
      throw new Error(`Server error (${res.status}): ${trimmed.slice(0, 120)}`);
    }
    throw new Error(`Invalid JSON response: ${trimmed.slice(0, 120)}`);
  }
}
