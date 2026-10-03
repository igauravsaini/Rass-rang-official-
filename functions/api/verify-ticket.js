import { getDb } from '../_lib/db.js';
import { authenticateRequest } from '../_lib/auth.js';

export async function onRequestPost(context) {
  const req = context.request;
  const env = context.env;

  // 1. Authenticate Volunteer or Admin
  const auth = authenticateRequest(req, env);
  if (!auth.isAuthorized) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: Valid volunteer or admin key required.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ticketNo = body?.ticketNo ? String(body.ticketNo).trim().toUpperCase() : '';
  const action = body?.action || 'LOOKUP'; // 'LOOKUP' | 'COLLECT' | 'CHECK_IN'
  const scannedBy = body?.scannedBy || (auth.role === 'admin' ? 'Admin' : 'Volunteer');

  if (!ticketNo) {
    return new Response(
      JSON.stringify({ success: false, error: 'Ticket number is required.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabase = getDb(env);

    // 2. Fetch current booking details
    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select(`
        id,
        ticket_no,
        name,
        mobile,
        status,
        payment_status,
        created_at,
        collected_at,
        checked_in_at,
        spot_id,
        passes ( code, label, persons, price ),
        spots ( id, name, address, city )
      `)
      .eq('ticket_no', ticketNo)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    if (!booking) {
      return new Response(
        JSON.stringify({ success: false, error: 'INVALID_TICKET: No record exists for this ticket number.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Action handling & Lifecycle verification
    if (action === 'LOOKUP') {
      return new Response(
        JSON.stringify({
          success: true,
          booking,
          warning: booking.status === 'CHECKED_IN' ? 'ALREADY USED' : null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'COLLECT') {
      if (booking.status === 'CANCELLED') {
        return new Response(
          JSON.stringify({ success: false, error: 'TICKET_CANCELLED: This reservation has been cancelled.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (booking.status === 'COLLECTED') {
        return new Response(
          JSON.stringify({ success: false, error: 'ALREADY_COLLECTED: Physical pass was already collected on ' + booking.collected_at }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (booking.status === 'CHECKED_IN') {
        return new Response(
          JSON.stringify({ success: false, error: 'ALREADY_CHECKED_IN: Pass was already used for entry.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Update to COLLECTED
      const now = new Date().toISOString();
      const { data: updated, error: updateErr } = await supabase
        .from('bookings')
        .update({
          status: 'COLLECTED',
          payment_status: 'PAID',
          collected_at: now,
        })
        .eq('id', booking.id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      // Log scan event
      await supabase.from('scan_logs').insert({
        booking_id: booking.id,
        action: 'COLLECTED_PASS',
        scanned_by: scannedBy,
        scanned_at: now,
        notes: `Physical pass collected and payment confirmed at spot: ${booking.spots?.name}`,
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Pass marked as COLLECTED successfully!',
          booking: { ...booking, ...updated },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'CHECK_IN') {
      if (booking.status === 'CHECKED_IN') {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'ALREADY USED',
            message: `This ticket was already checked in at ${booking.checked_in_at || 'earlier today'}. Entry denied!`,
            booking,
          }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (booking.status === 'PRE_BOOKED') {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'NOT_COLLECTED: Pass is still in PRE_BOOKED status. Attendee must pay and collect at collection desk before entering.',
            booking,
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (booking.status === 'CANCELLED') {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'TICKET_CANCELLED: This ticket was cancelled.',
            booking,
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Allowed transition: COLLECTED -> CHECKED_IN
      const now = new Date().toISOString();
      const { data: updated, error: updateErr } = await supabase
        .from('bookings')
        .update({
          status: 'CHECKED_IN',
          checked_in_at: now,
        })
        .eq('id', booking.id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      // Log scan event
      await supabase.from('scan_logs').insert({
        booking_id: booking.id,
        action: 'GATE_CHECK_IN',
        scanned_by: scannedBy,
        scanned_at: now,
        notes: `Gate entry granted for ${booking.passes?.persons || 1} person(s).`,
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: `CHECK-IN SUCCESSFUL! Welcome ${booking.name} (${booking.passes?.label}).`,
          booking: { ...booking, ...updated },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action specified.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[Cloudflare Pages verify-ticket.js] Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Database or validation error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
