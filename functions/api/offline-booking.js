import { generateTicketNumber } from '../_lib/ticketId.js';

const GOOGLE_SHEETS_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbzu10x5UDITi1xSMdZbu6fybHqacC_lbiJ4uWVh-EjGu3ZHIiVQD3ZHfOKwGa6jHNIk/exec';

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

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    // ---------------------------------------------------------
    // 1. Check server-side Google Sheets secret
    // ---------------------------------------------------------
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

    // ---------------------------------------------------------
    // 2. Parse request
    // ---------------------------------------------------------
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

    // ---------------------------------------------------------
    // 3. Validate customer details
    // ---------------------------------------------------------
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

    // ---------------------------------------------------------
    // 4. Get trusted pass information
    //    NEVER trust price/person count from the browser.
    // ---------------------------------------------------------
    const pass = PASSES[passType];

    // ---------------------------------------------------------
    // 5. Generate the REAL Raas-Rang ticket number
    //    Format: RRG-26-XXXXXX
    // ---------------------------------------------------------
    const ticketNumber = generateTicketNumber('26');

    const createdAt = new Date().toISOString();

    // ---------------------------------------------------------
    // 6. Prepare Google Sheets payload
    // ---------------------------------------------------------
    const sheetsPayload = {
      webhookToken,

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
    // 7. Save booking to Google Sheets
    // ---------------------------------------------------------
    let sheetsResponse;

    try {
      sheetsResponse = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sheetsPayload),
      });
    } catch (error) {
      console.error(
        '[Offline Booking] Google Sheets request failed:',
        error
      );

      return jsonResponse(
        {
          success: false,
          error:
            'Unable to connect to the booking register. Please try again.',
        },
        502
      );
    }

    let sheetsData;

    try {
      sheetsData = await sheetsResponse.json();
    } catch {
      console.error(
        '[Offline Booking] Google Sheets returned invalid response.'
      );

      return jsonResponse(
        {
          success: false,
          error:
            'Booking register returned an invalid response. Please try again.',
        },
        502
      );
    }

    // ---------------------------------------------------------
    // 8. Make sure Google Sheets actually accepted the booking
    // ---------------------------------------------------------
    if (!sheetsResponse.ok || !sheetsData?.success) {
      console.error(
        '[Offline Booking] Google Sheets rejected booking:',
        sheetsData
      );

      return jsonResponse(
        {
          success: false,
          error:
            sheetsData?.error ||
            'Unable to save the booking in the register.',
        },
        502
      );
    }

    // ---------------------------------------------------------
    // 9. Build the virtual ticket response
    // ---------------------------------------------------------
    const ticket = {
      ticketNo: ticketNumber,

      name,
      mobileMasked: `${mobile.slice(0, 2)}******${mobile.slice(-2)}`,
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
    };

    // ---------------------------------------------------------
    // 10. Return ticket to website
    // ---------------------------------------------------------
    return jsonResponse({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error('[Offline Booking] Unexpected error:', error);

    return jsonResponse(
      {
        success: false,
        error: 'Unable to complete offline booking. Please try again.',
      },
      500
    );
  }
}