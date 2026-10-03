import { getDb } from '../_lib/db.js';

export async function onRequestGet(context) {
  try {
    const supabase = getDb(context.env);

    const { data: passes, error: passesError } = await supabase
      .from('passes')
      .select('id, code, label, persons, price, total_quota')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (passesError) throw passesError;

    const { data: spots, error: spotsError } = await supabase
      .from('spots')
      .select('id, name, address, city, timings, contact_person, contact_phone')
      .eq('is_active', true)
      .order('id', { ascending: true });

    if (spotsError) throw spotsError;

    return new Response(
      JSON.stringify({
        success: true,
        passes: passes || [],
        spots: spots || [],
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60, s-maxage=300',
        },
      }
    );
  } catch (err) {
    console.error('[Cloudflare Pages config.js] Error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unable to retrieve event pass configuration.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
