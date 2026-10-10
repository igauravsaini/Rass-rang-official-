import { maskMobile, maskEmail } from '../_lib/validate.js';
import { checkRateLimit, getClientIp } from '../_lib/rateLimit.js';

const TICKET_PATTERN =
  /^RRG-\d{2}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;

const PASS_DETAILS = {
  SIGMA: {
    label: 'Sigma Pass (1 Entry)',
    persons: 1,
    price: 499,
  },
  COUPLE: {
    label: 'Couple Pass (2 Entry)',
    persons: 2,
    price: 899,
  },
  FAMILY: {
    label: 'Family Pass (4 Entry)',
    persons: 4,
    price: 1699,
  },
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export async function onRequestPost(context) {
  const req = context.request;
  const env = context.env;

  const rateLimit = checkRateLimit(getClientIp(req));

  if (!rateLimit.allowed) {
    return jsonResponse(
      {
        success: false,
        error: `Too many lookup requests. Please wait ${
          rateLimit.resetInSeconds || 60
        } seconds.`,
      },
      429
    );
  }

  let body;

  try {
    body = await req.json();
  } catch {
    return jsonResponse(
      { success: false, error: 'Invalid JSON payload.' },
      400
    );
  }

  const ticketNo = String(body?.ticketNo || '')
    .trim()
    .toUpperCase();

  const mobileLast4 = String(body?.mobileLast4 || '').trim();

  if (!TICKET_PATTERN.test(ticketNo)) {
    return jsonResponse(
      {
        success: false,
        error: 'Invalid ticket number format. Expected RRG-26-XXXXXX.',
      },
      400
    );
  }

  if (!/^\d{4}$/.test(mobileLast4)) {
    return jsonResponse(
      {
        success: false,
        error: 'Enter the last 4 digits of your registered mobile number.',
      },
      400
    );
  }

  const webhookUrl = env.BOOKING_SHEET_WEBHOOK_URL;
  const webhookToken = env.GOOGLE_SHEETS_WEBHOOK_TOKEN;

  if (!webhookUrl || !webhookToken) {
    console.error('[get-ticket] Google Sheets webhook configuration missing.');

    return jsonResponse(
      {
        success: false,
        error: 'Ticket lookup is temporarily unavailable. Please try again later.',
      },
      503
    );
  }

  try {
    const upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhookToken,
        action: 'FIND_TICKET',
        ticketNo,
        mobileLast4,
      }),
    });

    const raw = await upstream.text();

    let result;

    try {
      result = JSON.parse(raw);
    } catch {
      console.error('[get-ticket] Apps Script returned a non-JSON response.');

      return jsonResponse(
        {
          success: false,
          error: 'Ticket lookup service returned an invalid response.',
        },
        502
      );
    }

    if (!upstream.ok) {
      console.error('[get-ticket] Apps Script HTTP error:', upstream.status);

      return jsonResponse(
        {
          success: false,
          error: 'Ticket lookup service is temporarily unavailable.',
        },
        502
      );
    }

    if (!result.success) {
      const message = String(result.error || '');

      if (message.includes('mobile digits do not match')) {
        return jsonResponse(
          {
            success: false,
            error: 'Verification failed: the mobile digits do not match this reservation.',
          },
          401
        );
      }

      if (
        message.includes('No ticket reservation found') ||
        message.includes('No ticket reservation') ||
        message.includes('cancelled')
      ) {
        return jsonResponse(
          {
            success: false,
            error: message || 'No matching reservation found.',
          },
          404
        );
      }

      console.error('[get-ticket] Apps Script lookup failed:', message);

      return jsonResponse(
        {
          success: false,
          error: 'Unable to retrieve this ticket right now. Please try again.',
        },
        502
      );
    }

    const row = result.ticket;

    if (!row) {
      return jsonResponse(
        {
          success: false,
          error: 'The lookup service did not return ticket details.',
        },
        502
      );
    }

    const passCode = String(row.passType || '')
      .trim()
      .toUpperCase();

    const pass = PASS_DETAILS[passCode];

    if (!pass) {
      return jsonResponse(
        {
          success: false,
          error: 'The pass category for this reservation is invalid.',
        },
        502
      );
    }

    const mobile = String(row.mobile || '').replace(/\D/g, '');
    const email = String(row.email || '').trim();

    const ticketResponse = {
      ticketNo: String(row.ticketNo || ticketNo),
      name: String(row.name || ''),
      mobileMasked: maskMobile(mobile),
      emailMasked: email ? maskEmail(email) : '',
      passType: passCode,
      passName: pass.label,
      passMode: String(row.passMode || 'OFFLINE').toUpperCase(),
      persons: Number(row.persons || pass.persons),
      price: Number(row.price || pass.price),
      spot: String(row.spot || 'Caha Gorakhpur'),
      spotAddress:
        'Kajakpur, Rail Vihar Colony Phase 3rd, Taramandal, Gorakhpur, Uttar Pradesh 273017',
      spotCity: 'Gorakhpur',
      spotTimings: '10:00 AM – 08:00 PM (Daily)',
      spotContact: 'Festival Helpdesk (9876543210)',
      status: String(row.status || 'PRE_BOOKED').toUpperCase(),
      paymentStatus: String(row.paymentStatus || 'PENDING').toUpperCase(),
      createdAt: row.createdAt || '',
      collectedAt: row.collectedAt || null,
      checkedInAt: row.checkedInAt || null,
    };

    return jsonResponse({
      success: true,
      ticket: ticketResponse,
    });
  } catch (error) {
    console.error(
      '[get-ticket] Google Sheets lookup failed:',
      error?.message || 'Unknown error'
    );

    return jsonResponse(
      {
        success: false,
        error: 'Unable to connect to the ticket register. Please try again.',
      },
      502
    );
  }
}
