import { generateTicketNumber } from '../_lib/ticketId.js';

const GOOGLE_SHEETS_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbyeKheJhwIpx_XIWOdEO_OjyDNLOnhJ9YXpequuAeGvIQZuohugJewUUVoNKE--WTG_/exec';

const PASSES = {
  SIGMA: {
    code: 'SIGMA',
    label: 'Sigma Pass',
    persons: 1,
    price: 499,
  },
  COUPLE: {
    code: 'COUPLE',
    label: 'Couple Pass',
    persons: 2,
    price: 899,
  },
  FAMILY: {
    code: 'FAMILY',
    label: 'Family Pass',
    persons: 4,
    price: 1699,
  },
};

const COLLECTION_SPOT = {
  name: 'Caha Gorakhpur',
  address:
    'Kajakpur, Rail Vihar Colony Phase 3rd, Taramandal, Gorakhpur, Uttar Pradesh 273017',
  city: 'Gorakhpur',
  timings: '10:00 AM – 08:00 PM (Daily)',
  contact_person: 'Festival Helpdesk',
  contact_phone: '9876543210',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

function isValidMobile(mobile) {
  return /^[6-9]\d{9}$/.test(mobile);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassType(passType) {
  return Object.prototype.hasOwnProperty.call(PASSES, passType);
}

function maskMobile(mobile) {
  return `${mobile.slice(0, 2)}******${mobile.slice(-2)}`;
}

function buildTicketFromBooking(booking) {
  const pass = PASSES[String(booking.passType || '').toUpperCase()];

  if (!pass) {
    throw new Error('Invalid pass information in booking register.');
  }

  const mobile = String(booking.mobile || '');
  const email = String(booking.email || '');

  return {
    ticketNo: booking.ticketNumber,

    name: booking.customerName,
    mobileMasked: maskMobile(mobile),
    emailMasked: email,

    passType: pass.code,
    passName: pass.label,
    passMode: 'OFFLINE',

    persons: Number(booking.persons || pass.persons),
    price: Number(booking.passAmount || pass.price),

    spot: booking.collectionSpot || COLLECTION_SPOT.name,
    spotAddress: COLLECTION_SPOT.address,
    spotCity: COLLECTION_SPOT.city,
    spotTimings: COLLECTION_SPOT.timings,
    spotContact: COLLECTION_SPOT.contact_phone,

    status: booking.bookingStatus || 'PRE_BOOKED',
    paymentStatus: booking.paymentStatus || 'PENDING',

    createdAt: booking.createdAt || null,

    collectedAt: booking.collectedAt || null,
    checkedInAt: booking.checkedInAt || null,
  };
}

async function parseJsonSafely(response) {
  const text = await response.text();

  if (!text || !text.trim()) {
    return {
      ok: false,
      data: null,
      raw: '',
    };
  }

  try {
    return {
      ok: true,
      data: JSON.parse(text),
      raw: text,
    };
  } catch {
    return {
      ok: false,
      data: null,
      raw: text,
    };
  }
}

async function callGoogleSheets(payload) {
  let response;

  try {
    response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error(
      '[Offline Booking] Google Sheets network error:',
      error
    );

    return {
      networkError: true,
      httpOk: false,
      jsonOk: false,
      data: null,
    };
  }

  const parsed = await parseJsonSafely(response);

  return {
    networkError: false,
    httpOk: response.ok,
    jsonOk: parsed.ok,
    data: parsed.data,
  };
}

async function checkExistingBooking(webhookToken, mobile, email, passType) {
  const result = await callGoogleSheets({
    webhookToken,
    action: 'CHECK_EXISTING',
    mobile,
    email,
    passType,
  });

  if (
    result.httpOk &&
    result.jsonOk &&
    result.data?.success === true &&
    result.data?.existing === true &&
    result.data?.booking
  ) {
    return result.data.booking;
  }

  if (
    result.httpOk &&
    result.jsonOk &&
    result.data?.success === true &&
    result.data?.existing === false
  ) {
    return null;
  }

  return undefined;
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    const webhookToken = env?.GOOGLE_SHEETS_WEBHOOK_TOKEN;

    if (!webhookToken) {
      console.error(
        '[Offline Booking] GOOGLE_SHEETS_WEBHOOK_TOKEN is not configured.'
      );

      return jsonResponse(
        {
          success: false,
          error: 'Offline booking service is not configured.',
        },
        500
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          error: 'Invalid JSON request.',
        },
        400
      );
    }

    const name = String(body?.name || '').trim();
    const mobile = String(body?.mobile || '').trim();
    const email = String(body?.email || '').trim();
    const passType = String(body?.passType || '')
      .trim()
      .toUpperCase();
    const termsAccepted = body?.termsAccepted === true;

    if (!name || name.length < 2) {
      return jsonResponse(
        {
          success: false,
          error: 'Please enter your full name.',
        },
        400
      );
    }

    if (!isValidMobile(mobile)) {
      return jsonResponse(
        {
          success: false,
          error:
            'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.',
        },
        400
      );
    }

    if (!isValidEmail(email)) {
      return jsonResponse(
        {
          success: false,
          error: 'Please enter a valid email address.',
        },
        400
      );
    }

    if (!isValidPassType(passType)) {
      return jsonResponse(
        {
          success: false,
          error: 'Invalid pass type.',
        },
        400
      );
    }

    if (!termsAccepted) {
      return jsonResponse(
        {
          success: false,
          error: 'Please accept the confirmation checkbox.',
        },
        400
      );
    }

    const pass = PASSES[passType];

    // ---------------------------------------------------------
    // STEP 1
    // Check whether this customer already has an active booking.
    // ---------------------------------------------------------

    const existingBooking = await checkExistingBooking(
      webhookToken,
      mobile,
      email,
      passType
    );

    if (existingBooking) {
    console.log(
      '[Offline Booking] Existing booking found:',
      existingBooking.ticketNumber
    );

    return jsonResponse(
      {
        success: false,
        code: 'ALREADY_REGISTERED',
        error:
          'This mobile number and email are already registered for an offline pass reservation.',
      },
      409
    );
  }

    // ---------------------------------------------------------
    // STEP 2
    // Generate a new ticket ONLY if no existing booking exists.
    // ---------------------------------------------------------

    const ticketNumber = generateTicketNumber('26');
    const createdAt = new Date().toISOString();

    const bookingPayload = {
      webhookToken,
      action: 'BOOK_OFFLINE',

      ticketNumber,
      customerName: name,
      mobile,
      email,

      passType: pass.code,
      passMode: 'OFFLINE',

      persons: pass.persons,
      passAmount: pass.price,

      paymentStatus: 'PENDING',
      bookingStatus: 'PRE_BOOKED',

      collectionSpot: COLLECTION_SPOT.name,

      createdAt,
      collectedAt: '',
      checkedInAt: '',
    };

    // ---------------------------------------------------------
    // STEP 3
    // Ask Google Sheets to create the booking.
    // ---------------------------------------------------------

    const bookingResult = await callGoogleSheets(bookingPayload);

    // ---------------------------------------------------------
    // STEP 4
    // Normal successful response.
    // ---------------------------------------------------------

    if (
      bookingResult.httpOk &&
      bookingResult.jsonOk &&
      bookingResult.data?.success === true
    ) {
      const data = bookingResult.data;

      if (data.existing && data.booking) {
        return jsonResponse({
          success: true,
          existing: true,
          ticket: buildTicketFromBooking(data.booking),
        });
      }

      if (data.ticketNumber && data.booking) {
        return jsonResponse({
          success: true,
          existing: false,
          ticket: buildTicketFromBooking(data.booking),
        });
      }

      // Older/alternate successful response format.
      if (data.ticketNumber) {
        return jsonResponse({
          success: true,
          existing: false,
          ticket: {
            ticketNo: data.ticketNumber,
            name,
            mobileMasked: maskMobile(mobile),
            emailMasked: email,
            passType: pass.code,
            passName: pass.label,
            passMode: 'OFFLINE',
            persons: pass.persons,
            price: pass.price,
            spot: COLLECTION_SPOT.name,
            spotAddress: COLLECTION_SPOT.address,
            spotCity: COLLECTION_SPOT.city,
            spotTimings: COLLECTION_SPOT.timings,
            spotContact: COLLECTION_SPOT.contact_phone,
            status: 'PRE_BOOKED',
            paymentStatus: 'PENDING',
            createdAt,
            collectedAt: null,
            checkedInAt: null,
          },
        });
      }
    }

    // ---------------------------------------------------------
    // STEP 5
    // IMPORTANT RECOVERY
    //
    // Google Sheets may have saved the booking even if its
    // response was malformed/empty/502.
    //
    // Check the register before telling the customer to retry.
    // ---------------------------------------------------------

    const recoveredBooking = await checkExistingBooking(
      webhookToken,
      mobile,
      email,
      passType
    );

    if (recoveredBooking) {
      console.log(
        '[Offline Booking] Booking recovered after uncertain response:',
        recoveredBooking.ticketNumber
      );

      return jsonResponse({
        success: true,
        existing: true,
        recovered: true,
        ticket: buildTicketFromBooking(recoveredBooking),
      });
    }

    // ---------------------------------------------------------
    // STEP 6
    // Nothing was saved and we genuinely cannot complete it.
    // ---------------------------------------------------------

    if (bookingResult.networkError) {
      return jsonResponse(
        {
          success: false,
          error:
            'Unable to reach the booking register. Please try again.',
        },
        502
      );
    }

    return jsonResponse(
      {
        success: false,
        error:
          'Unable to confirm the booking register. Please try again.',
      },
      502
    );
  } catch (error) {
    console.error('[Offline Booking] Unexpected error:', error);

    return jsonResponse(
      {
        success: false,
        error:
          'Unable to complete offline booking. Please try again.',
      },
      500
    );
  }
}