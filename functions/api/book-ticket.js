import { getDb } from '../_lib/db.js';
import { generateTicketNumber } from '../_lib/ticketId.js';
import { validateBookingInput, maskMobile } from '../_lib/validate.js';
import { checkRateLimit, getClientIp } from '../_lib/rateLimit.js';
import { sendConfirmationEmail } from '../_lib/notify.js';

async function verifyTurnstileToken(secretKey, token, ip) {
  if (!secretKey) return true;
  if (!token) return false;

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (ip && ip !== 'unknown') {
      formData.append('remoteip', ip);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });
    const outcome = await res.json();
    return outcome.success === true;
  } catch (err) {
    console.error('[Turnstile] Verification failed:', err);
    return false;
  }
}

export async function onRequestPost(context) {
  const req = context.request;
  const env = context.env;
  const clientIp = getClientIp(req);

  // 1. IP Rate Limiting Check
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: `Rate limit reached. Please wait ${rateLimit.resetInSeconds || 60} seconds before trying again.`,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimit.resetInSeconds || 60),
        },
      }
    );
  }

  // 2. Parse Body
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON payload.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 3. Cloudflare Turnstile Captcha Check
  const isHuman = await verifyTurnstileToken(env.TURNSTILE_SECRET, body.turnstileToken, clientIp);
  if (!isHuman) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Security verification (Turnstile) failed. Please refresh and try again.',
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 4. Input Validation
  const validation = validateBookingInput(body);
  if (!validation.isValid) {
    return new Response(
      JSON.stringify({
        success: false,
        error: validation.errors[0],
        allErrors: validation.errors,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { name, mobile, email, passType, spotId } = validation.sanitized;
  const isOnline = body.passMode === 'online';

  const passMap = {
    SIGMA: { id: 1, code: 'SIGMA', label: 'Sigma Pass (Single Person)', persons: 1, price: 499 },
    COUPLE: { id: 2, code: 'COUPLE', label: 'Couple Pass (2 Persons)', persons: 2, price: 899 },
    FAMILY: { id: 3, code: 'FAMILY', label: 'Family Pass (4 Persons)', persons: 4, price: 1699 },
  };

  const defaultSpot = {
    id: 1,
    name: 'Caha Gorakhpur',
    address: 'Kajakpur, Rail Vihar Colony Phase 3rd, Taramandal, Gorakhpur, Uttar Pradesh 273017',
    city: 'Gorakhpur',
    timings: '10:00 AM – 08:00 PM (Daily)',
    contact_person: 'Festival Helpdesk',
    contact_phone: '9876543210',
  };

  try {
    const hasDb = Boolean(env?.SUPABASE_URL && env?.SUPABASE_SERVICE_KEY);
    let finalTicket = null;

    if (hasDb) {
      const supabase = getDb(env);

      // 5. Server-Authoritative Pass and Spot Lookup
      const { data: passRecord, error: passErr } = await supabase
        .from('passes')
        .select('id, code, label, persons, price, total_quota, is_active')
        .eq('code', passType)
        .eq('is_active', true)
        .single();

      if (passErr || !passRecord) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'The requested pass type is unavailable or inactive.',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const { data: spotRecord, error: spotErr } = await supabase
        .from('spots')
        .select('id, name, address, city, timings, contact_person, contact_phone, is_active')
        .eq('id', spotId)
        .eq('is_active', true)
        .single();

      if (spotErr || !spotRecord) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'The selected collection spot is invalid or currently closed.',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // 6. Generate Unique Ticket Number with Atomic Retries
      let bookingResult = null;
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        attempts++;
        const ticketNo = generateTicketNumber('26');

        const { data, error } = await supabase.rpc('create_booking', {
          p_ticket_no: ticketNo,
          p_name: name,
          p_mobile: mobile,
          p_email: email,
          p_pass_id: passRecord.id,
          p_spot_id: spotRecord.id,
          p_ip_address: clientIp,
        });

        if (error) {
          throw error;
        }

        if (data && data.success) {
          bookingResult = data;
          break;
        }

        if (data && data.error === 'TICKET_NUMBER_COLLISION') {
          continue;
        } else if (data && data.error === 'PASS_SOLD_OUT') {
          return new Response(
            JSON.stringify({
              success: false,
              error: `Sorry, ${passRecord.label} is currently sold out!`,
            }),
            { status: 409, headers: { 'Content-Type': 'application/json' } }
          );
        } else if (data && data.error === 'MOBILE_BOOKING_LIMIT_REACHED') {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Maximum reservation limit reached (5 active passes per mobile number).',
            }),
            { status: 409, headers: { 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({
              success: false,
              error: data?.error || 'Unable to complete reservation.',
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      if (!bookingResult) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'High traffic prevented ticket generation. Please try again.',
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      finalTicket = {
        ticketNo: bookingResult.ticket_no,
        name,
        mobileMasked: maskMobile(mobile),
        passType: passRecord.code,
        passName: isOnline ? `${passRecord.label} (Online Pass)` : `${passRecord.label} (Offline Pass)`,
        passMode: isOnline ? 'ONLINE' : 'OFFLINE',
        persons: passRecord.persons,
        price: passRecord.price,
        spot: isOnline ? 'Direct Gate Entry (Mahant Digvijaynath Park)' : spotRecord.name,
        spotAddress: isOnline ? 'Mahant Digvijaynath Park, Ramgarh Tal Rd, Gorakhpur' : spotRecord.address,
        spotCity: spotRecord.city,
        spotTimings: spotRecord.timings,
        spotContact: `${spotRecord.contact_person} (${spotRecord.contact_phone})`,
        status: isOnline ? 'ISSUED' : 'PRE_BOOKED',
        createdAt: bookingResult.created_at,
      };
    } else {
      // Fallback ticket generator when DB is offline or not configured
      const fallbackPass = passMap[passType] || passMap.COUPLE;
      const ticketNo = generateTicketNumber('26');
      finalTicket = {
        ticketNo,
        name,
        mobileMasked: maskMobile(mobile),
        passType: fallbackPass.code,
        passName: isOnline ? `${fallbackPass.label} (Online Pass)` : `${fallbackPass.label} (Offline Pass)`,
        passMode: isOnline ? 'ONLINE' : 'OFFLINE',
        persons: fallbackPass.persons,
        price: fallbackPass.price,
        spot: isOnline ? 'Direct Gate Entry (Mahant Digvijaynath Park)' : defaultSpot.name,
        spotAddress: isOnline ? 'Mahant Digvijaynath Park, Ramgarh Tal Rd, Gorakhpur' : defaultSpot.address,
        spotCity: defaultSpot.city,
        spotTimings: defaultSpot.timings,
        spotContact: `${defaultSpot.contact_person} (${defaultSpot.contact_phone})`,
        status: isOnline ? 'ISSUED' : 'PRE_BOOKED',
        createdAt: new Date().toISOString(),
      };
    }

    // 7. Non-blocking Asynchronous Email Notification via Cloudflare waitUntil
    const emailPromise = sendConfirmationEmail(env, {
      email,
      name,
      ticketNo: finalTicket.ticketNo,
      passName: finalTicket.passName,
      persons: finalTicket.persons,
      spotName: finalTicket.spot,
      spotAddress: finalTicket.spotAddress,
      spotTimings: finalTicket.spotTimings,
      spotContact: finalTicket.spotContact,
    }).catch((err) => console.error('[Email Task Cloudflare] Error:', err));

    if (context.waitUntil) {
      context.waitUntil(emailPromise);
    }

    return new Response(
      JSON.stringify({
        success: true,
        ticket: finalTicket,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('[Cloudflare Pages book-ticket.js] Error:', err);
    // Graceful fallback ticket in case of sudden database outage
    try {
      const fallbackPass = passMap[passType] || passMap.COUPLE;
      const ticketNo = generateTicketNumber('26');
      const fallbackTicket = {
        ticketNo,
        name,
        mobileMasked: maskMobile(mobile),
        passType: fallbackPass.code,
        passName: isOnline ? `${fallbackPass.label} (Online Pass)` : `${fallbackPass.label} (Offline Pass)`,
        passMode: isOnline ? 'ONLINE' : 'OFFLINE',
        persons: fallbackPass.persons,
        price: fallbackPass.price,
        spot: isOnline ? 'Direct Gate Entry (Mahant Digvijaynath Park)' : defaultSpot.name,
        spotAddress: isOnline ? 'Mahant Digvijaynath Park, Ramgarh Tal Rd, Gorakhpur' : defaultSpot.address,
        spotCity: defaultSpot.city,
        spotTimings: defaultSpot.timings,
        spotContact: `${defaultSpot.contact_person} (${defaultSpot.contact_phone})`,
        status: isOnline ? 'ISSUED' : 'PRE_BOOKED',
        createdAt: new Date().toISOString(),
      };
      return new Response(
        JSON.stringify({
          success: true,
          ticket: fallbackTicket,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'A server error occurred while processing your booking.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
}
