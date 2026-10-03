import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;
let lastUrl = null;
let lastKey = null;

export function getDb(env) {
  const url = env?.SUPABASE_URL || (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : undefined);
  const key = env?.SUPABASE_SERVICE_KEY || (typeof process !== 'undefined' ? process.env?.SUPABASE_SERVICE_KEY : undefined);

  if (!url || !key) {
    throw new Error('Supabase configuration missing: Set SUPABASE_URL and SUPABASE_SERVICE_KEY in Cloudflare Pages environment variables.');
  }

  if (supabaseClient && lastUrl === url && lastKey === key) {
    return supabaseClient;
  }

  supabaseClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  lastUrl = url;
  lastKey = key;

  return supabaseClient;
}
