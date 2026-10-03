import { getDb } from '../_lib/db.js';
import { authenticateRequest } from '../_lib/auth.js';

export async function onRequestGet(context) {
  const req = context.request;
  const env = context.env;

  const auth = authenticateRequest(req, env);
  if (!auth.isAuthorized) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: Admin or Volunteer API key required.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabase = getDb(env);

  try {
    const url = new URL(req.url);
    const search = url.searchParams.get('search')?.trim();
    const passCode = url.searchParams.get('pass')?.trim();
    const spotId = url.searchParams.get('spot')?.trim();
    const status = url.searchParams.get('status')?.trim();
    const isExport = url.searchParams.get('export') === 'csv';

    let query = supabase
      .from('bookings')
      .select(`
        id,
        ticket_no,
        name,
        mobile,
        email,
        status,
        payment_status,
        created_at,
        collected_at,
        checked_in_at,
        ip_address,
        passes ( id, code, label, persons, price ),
        spots ( id, name, address, city )
      `)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`ticket_no.ilike.%${search}%,name.ilike.%${search}%,mobile.ilike.%${search}%`);
    }

    if (passCode && passCode !== 'ALL') {
      const { data: matchedPass } = await supabase.from('passes').select('id').eq('code', passCode).maybeSingle();
      if (matchedPass) {
        query = query.eq('pass_id', matchedPass.id);
      }
    }

    if (spotId && spotId !== 'ALL') {
      query = query.eq('spot_id', parseInt(spotId, 10));
    }

    if (status && status !== 'ALL') {
      query = query.eq('status', status);
    }

    const { data: bookings, error } = await query;
    if (error) throw error;

    if (isExport) {
      const header = ['Ticket No', 'Attendee Name', 'Mobile', 'Email', 'Pass Code', 'Pass Name', 'Persons', 'Price (INR)', 'Spot Name', 'Status', 'Payment', 'Created At', 'Collected At', 'Checked In At'];
      const rows = (bookings || []).map((b) => [
        `"${b.ticket_no}"`,
        `"${(b.name || '').replace(/"/g, '""')}"`,
        `"${b.mobile}"`,
        `"${b.email}"`,
        `"${b.passes?.code || ''}"`,
        `"${b.passes?.label || ''}"`,
        b.passes?.persons || 1,
        b.passes?.price || 0,
        `"${(b.spots?.name || '').replace(/"/g, '""')}"`,
        `"${b.status}"`,
        `"${b.payment_status}"`,
        `"${b.created_at || ''}"`,
        `"${b.collected_at || ''}"`,
        `"${b.checked_in_at || ''}"`,
      ]);

      const csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

      return new Response(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="raas_rang_bookings_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const total = (bookings || []).length;
    const perStatus = { PRE_BOOKED: 0, COLLECTED: 0, CHECKED_IN: 0, CANCELLED: 0 };
    const perPass = {};
    const perSpot = {};

    for (const b of (bookings || [])) {
      perStatus[b.status] = (perStatus[b.status] || 0) + 1;
      const pCode = b.passes?.code || 'UNKNOWN';
      perPass[pCode] = (perPass[pCode] || 0) + 1;
      const sName = b.spots?.name || 'Unassigned';
      perSpot[sName] = (perSpot[sName] || 0) + 1;
    }

    return new Response(
      JSON.stringify({
        success: true,
        bookings: bookings || [],
        stats: {
          total,
          perStatus,
          perPass,
          perSpot,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[Cloudflare Pages admin-bookings GET] Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to retrieve bookings.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestPatch(context) {
  const req = context.request;
  const env = context.env;

  const auth = authenticateRequest(req, env);
  if (!auth.isAuthorized) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: Admin or Volunteer API key required.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabase = getDb(env);

  try {
    const body = await req.json();
    const ticketNo = body?.ticketNo ? String(body.ticketNo).trim().toUpperCase() : '';
    const newStatus = body?.status;
    const updatedBy = auth.role === 'admin' ? 'Admin' : 'Volunteer';

    if (!ticketNo || !['COLLECTED', 'CANCELLED'].includes(newStatus)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Valid ticket number and target status (COLLECTED or CANCELLED) are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data: current, error: findErr } = await supabase
      .from('bookings')
      .select('id, ticket_no, status')
      .eq('ticket_no', ticketNo)
      .maybeSingle();

    if (findErr || !current) {
      return new Response(
        JSON.stringify({ success: false, error: 'Booking not found.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (current.status === 'CHECKED_IN') {
      return new Response(
        JSON.stringify({ success: false, error: 'Cannot modify a pass that has already been CHECKED_IN.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updateData = { status: newStatus };
    if (newStatus === 'COLLECTED') {
      updateData.collected_at = new Date().toISOString();
      updateData.payment_status = 'PAID';
    }

    const { data: updated, error: updateErr } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', current.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    await supabase.from('scan_logs').insert({
      booking_id: current.id,
      action: `STATUS_CHANGED_TO_${newStatus}`,
      scanned_by: updatedBy,
      scanned_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Ticket status successfully changed to ${newStatus}.`,
        booking: updated,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[Cloudflare Pages admin-bookings PATCH] Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to update ticket status.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
