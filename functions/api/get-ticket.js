import { getDb } from '../_lib/db.js';
import { maskMobile, maskEmail } from '../_lib/validate.js';
import { checkRateLimit, getClientIp } from '../_lib/rateLimit.js';

export async function onRequestPost(context) {
  const req = context.request;
  const env = context.env;
  const clientIp = getClientIp(req);

  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: `Too many lookup requests. Please wait ${rateLimit.resetInSeconds || 60} seconds.`,
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON payload.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ticketNo = body?.ticketNo ? String(body.ticketNo).trim().toUpperCase() : '';
  const mobileLast4 = body?.mobileLast4 ? String(body.mobileLast4).trim() : '';

  if (!ticketNo || !/^RRG-\d{2}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/.test(ticketNo)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid ticket number format (expected RRG-26-XXXXXX).',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!mobileLast4 || !/^\d{4}$/.test(mobileLast4)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Please enter the exact last 4 digits of your registered mobile number.',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabase = getDb(env);

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        ticket_no,
        name,
        mobile,
        email,
        status,
        payment_status,
        created_at,
        collected_at,
        checked_in_at,
        passes ( code, label, persons, price ),
        spots ( name, address, city, timings, contact_person, contact_phone )
      `)
      .eq('ticket_no', ticketNo)
      .maybeSingle();

    if (error) throw error;

    if (!booking) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No ticket reservation found matching this ticket number.',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!booking.mobile.endsWith(mobileLast4)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Verification failed: Mobile number digits do not match this ticket reservation.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const ticketResponse = {
      ticketNo: booking.ticket_no,
      name: booking.name,
      mobileMasked: maskMobile(booking.mobile),
      emailMasked: maskEmail(booking.email),
      passType: booking.passes?.code,
      passName: booking.passes?.label,
      persons: booking.passes?.persons,
      price: booking.passes?.price,
      spot: booking.spots?.name,
      spotAddress: booking.spots?.address,
      spotCity: booking.spots?.city,
      spotTimings: booking.spots?.timings,
      spotContact: `${booking.spots?.contact_person} (${booking.spots?.contact_phone})`,
      status: booking.status,
      paymentStatus: booking.payment_status,
      createdAt: booking.created_at,
      collectedAt: booking.collected_at,
      checkedInAt: booking.checked_in_at,
    };

    return new Response(
      JSON.stringify({
        success: true,
        ticket: ticketResponse,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[Cloudflare Pages get-ticket.js] Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Database query error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
