import { getDb } from '../_lib/db.js';
import { authenticateRequest } from '../_lib/auth.js';

const ADMIN_ORIGIN =
  'https://admin-panel.web-app-dashboard.workers.dev';

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin');

  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin':
      origin === ADMIN_ORIGIN ? ADMIN_ORIGIN : 'null',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(body, status = 200, request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: getCorsHeaders(request),
  });
}

function csvCell(value) {
  let text = value == null ? '' : String(value);

  if (/^[\s]*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

function cleanSearch(value) {
  return String(value || '')
    .trim()
    .replace(/[(),\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 100);
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get('Origin');

  if (origin !== ADMIN_ORIGIN) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request),
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;

  const auth = authenticateRequest(request, env);

  if (!auth.isAuthorized || auth.role !== 'admin') {
    return json(
      {
        success: false,
        error: 'Admin authorization required.',
      },
      401,
      request
    );
  }

  try {
    const url = new URL(request.url);

    const search = cleanSearch(url.searchParams.get('search'));
    const passFilter = (url.searchParams.get('pass') || '').trim();
    const spotFilter = (url.searchParams.get('spot') || '').trim();
    const status = (url.searchParams.get('status') || '')
      .trim()
      .toUpperCase();

    const isExport = url.searchParams.get('export') === 'csv';

    const allowedStatuses = new Set([
      'PRE_BOOKED',
      'COLLECTED',
      'CHECKED_IN',
      'CANCELLED',
    ]);

    if (status && status !== 'ALL' && !allowedStatuses.has(status)) {
      return json(
        {
          success: false,
          error: 'Invalid booking status filter.',
        },
        400,
        request
      );
    }

    const page = Math.max(
      1,
      Math.min(
        100000,
        Number.parseInt(url.searchParams.get('page') || '1', 10) || 1
      )
    );

    const requestedLimit =
      Number.parseInt(url.searchParams.get('limit') || '100', 10) || 100;

    const limit = Math.max(
      1,
      Math.min(isExport ? 5000 : 100, requestedLimit)
    );

    const supabase = getDb(env);

    let query = supabase
      .from('bookings')
      .select(
        `
          id,
          ticket_code,
          pass_id,
          spot_id,
          customer_name,
          mobile,
          email,
          quantity,
          unit_price,
          total_amount,
          status,
          payment_status,
          payment_method,
          payment_verified_at,
          created_at,
          updated_at,
          passes (
            id,
            pass_code,
            pass_name,
            description,
            price,
            quota
          ),
          spots (
            id,
            spot_code,
            spot_name,
            address,
            city
          )
        `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    // Search
    if (search) {
      const term = search
        .replace(/[%_]/g, '')
        .replace(/[(),\\]/g, ' ')
        .trim()
        .slice(0, 100);

      if (term) {
        query = query.or(
          `ticket_code.ilike.%${term}%,customer_name.ilike.%${term}%,mobile.ilike.%${term}%,email.ilike.%${term}%`
        );
      }
    }

    // Pass filter
    if (passFilter && passFilter !== 'ALL') {
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      let passId = passFilter;

      if (!uuidPattern.test(passFilter)) {
        const { data: matchedPass, error: passError } = await supabase
          .from('passes')
          .select('id')
          .eq('pass_code', passFilter)
          .maybeSingle();

        if (passError) throw passError;

        if (!matchedPass) {
          return json(
            {
              success: true,
              bookings: [],
              stats: {
                total: 0,
                perStatus: {},
                perPass: {},
                perSpot: {},
              },
              page,
              limit,
              total: 0,
              totalPages: 0,
            },
            200,
            request
          );
        }

        passId = matchedPass.id;
      }

      query = query.eq('pass_id', passId);
    }

    // Hub filter
    if (spotFilter && spotFilter !== 'ALL') {
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (!uuidPattern.test(spotFilter)) {
        return json(
          {
            success: false,
            error: 'Spot filter must be a valid spot UUID.',
          },
          400,
          request
        );
      }

      query = query.eq('spot_id', spotFilter);
    }

    // Status filter
    if (status && status !== 'ALL') {
      query = query.eq('status', status);
    }

    // Pagination
    const from = isExport ? 0 : (page - 1) * limit;
    const to = from + limit - 1;

    const { data: bookings, error, count } = await query.range(from, to);

    if (error) throw error;

    const rows = bookings || [];

    const perStatus = {
      PRE_BOOKED: 0,
      COLLECTED: 0,
      CHECKED_IN: 0,
      CANCELLED: 0,
    };

    const perPass = {};
    const perSpot = {};

    for (const booking of rows) {
      perStatus[booking.status] =
        (perStatus[booking.status] || 0) + 1;

      const passCode =
        booking.passes?.pass_code || 'UNKNOWN';

      const spotName =
        booking.spots?.spot_name || 'Unassigned';

      perPass[passCode] = (perPass[passCode] || 0) + 1;
      perSpot[spotName] = (perSpot[spotName] || 0) + 1;
    }

    // CSV export
    if (isExport) {
      const header = [
        'Ticket Code',
        'Customer Name',
        'Mobile',
        'Email',
        'Pass Code',
        'Pass Name',
        'Quantity',
        'Unit Price (INR)',
        'Total Amount (INR)',
        'Spot Code',
        'Spot Name',
        'Status',
        'Payment Status',
        'Payment Method',
        'Payment Verified At',
        'Created At',
      ];

      const csvRows = rows.map((b) =>
        [
          b.ticket_code,
          b.customer_name,
          b.mobile,
          b.email,
          b.passes?.pass_code,
          b.passes?.pass_name,
          b.quantity,
          b.unit_price,
          b.total_amount,
          b.spots?.spot_code,
          b.spots?.spot_name,
          b.status,
          b.payment_status,
          b.payment_method,
          b.payment_verified_at,
          b.created_at,
        ]
          .map(csvCell)
          .join(',')
      );

      return new Response(
        [header.map(csvCell).join(','), ...csvRows].join('\r\n'),
        {
          status: 200,
          headers: {
            ...getCorsHeaders(request),
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition':
              `attachment; filename="raas_rang_bookings_${new Date()
                .toISOString()
                .slice(0, 10)}.csv"`,
          },
        }
      );
    }

    const total = count ?? rows.length;

    return json(
      {
        success: true,
        bookings: rows,
        stats: {
          total,
          pageCount: rows.length,
          perStatus,
          perPass,
          perSpot,
        },
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      200,
      request
    );
  } catch (error) {
    console.error(
      '[admin-bookings GET] Failed:',
      error?.message || error
    );

    return json(
      {
        success: false,
        error: 'Failed to retrieve bookings.',
      },
      500,
      request
    );
  }
}

// Keep booking mutations disabled until the verified
// payment and collection workflow is integrated.
export async function onRequestPatch(context) {
  return json(
    {
      success: false,
      error:
        'Booking updates are temporarily disabled. Use the verified payment and ticket workflow.',
    },
    405,
    context.request
  );
}
