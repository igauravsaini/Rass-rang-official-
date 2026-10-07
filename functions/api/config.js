import { getDb } from '../_lib/db.js';

export async function onRequestGet(context) {
  const fallbackPasses = [
    { id: 1, code: 'SIGMA', label: 'Sigma Pass (Single Person)', persons: 1, price: 499 },
    { id: 2, code: 'COUPLE', label: 'Couple Pass (2 Persons)', persons: 2, price: 899 },
    { id: 3, code: 'FAMILY', label: 'Family Pass (4 Persons)', persons: 4, price: 1699 },
  ];

  const fallbackSpots = [
    {
      id: 1,
      name: 'Caha Gorakhpur',
      address: 'Kajakpur, Rail Vihar Colony Phase 3rd, Taramandal, Gorakhpur, Uttar Pradesh 273017',
      city: 'Gorakhpur',
      timings: '10:00 AM – 08:00 PM (Daily)',
      contact_person: 'Festival Helpdesk',
      contact_phone: '9876543210',
    },
  ];

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
        passes: passes && passes.length > 0 ? passes : fallbackPasses,
        spots: spots && spots.length > 0 ? spots : fallbackSpots,
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
    console.warn('[Cloudflare Pages config.js] Returning default configuration:', err.message || err);
    return new Response(
      JSON.stringify({
        success: true,
        passes: fallbackPasses,
        spots: fallbackSpots,
        fallback: true,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30',
        },
      }
    );
  }
}
