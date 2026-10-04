import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function devApiMiddleware(): Plugin {
  const localBookings: any[] = [
    {
      id: 'demo-1',
      ticket_no: 'RRG-26-8K4M2P',
      name: 'Sample Devotee',
      mobile: '9876543210',
      email: 'sample@gorakhpur.com',
      status: 'PRE_BOOKED',
      payment_status: 'PENDING',
      created_at: new Date().toISOString(),
      passes: { id: 2, code: 'COUPLE', label: 'Couple Pass (2 Persons)', persons: 2, price: 899 },
      spots: { id: 1, name: 'Caha Gorakhpur', address: 'Kajakpur, Rail Vihar Colony Phase 3rd, Taramandal, Gorakhpur, Uttar Pradesh 273017', city: 'Gorakhpur' },
    },
  ];

  const handler = (req: any, res: any, next: any) => {
    if (!req.url || !req.url.startsWith('/api/')) {
      return next();
    }

        const sendJson = (status: number, payload: any) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(payload));
        };

        const getBody = (): Promise<any> =>
          new Promise((resolve) => {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch {
                resolve({});
              }
            });
          });

        const url = req.url.split('?')[0];

        // 1. GET /api/config
        if (req.method === 'GET' && url === '/api/config') {
          return sendJson(200, {
            success: true,
            passes: [
              { id: 1, code: 'SIGMA', label: 'Sigma Pass (Single Person Entry)', persons: 1, price: 499 },
              { id: 2, code: 'COUPLE', label: 'Couple Pass (2 Persons Entry)', persons: 2, price: 899 },
              { id: 3, code: 'FAMILY', label: 'Family Pass (4 Persons Entry)', persons: 4, price: 1699 },
            ],
            spots: [
              {
                id: 1,
                name: 'Caha Gorakhpur',
                address: 'Kajakpur, Rail Vihar Colony Phase 3rd, Taramandal, Gorakhpur, Uttar Pradesh 273017',
                city: 'Gorakhpur',
                contact_person: 'Festival Helpdesk',
                contact_phone: '9876543210',
                timings: '10:00 AM – 08:00 PM (Daily)',
              },
            ],
          });
        }

        // 2. POST /api/book-ticket
        if (req.method === 'POST' && url === '/api/book-ticket') {
          getBody().then((body) => {
            if (!body.name || !body.mobile) {
              return sendJson(400, { success: false, error: 'Full name and mobile are required.' });
            }

            const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
            let chars = '';
            for (let i = 0; i < 6; i++) {
              chars += alphabet[Math.floor(Math.random() * alphabet.length)];
            }
            const ticketNo = `RRG-26-${chars}`;

            const passMap: Record<string, { label: string; persons: number; price: number }> = {
              SIGMA: { label: 'Sigma Pass (Single Person Entry)', persons: 1, price: 499 },
              COUPLE: { label: 'Couple Pass (2 Persons Entry)', persons: 2, price: 899 },
              FAMILY: { label: 'Family Pass (4 Persons Entry)', persons: 4, price: 1699 },
            };
            const passInfo = passMap[body.passType] || passMap.COUPLE;
            const isOnline = body.passMode === 'online';

            const newBooking = {
              ticketNo,
              name: body.name.trim(),
              mobileMasked: `${body.mobile.slice(0, 2)}XXXXXX${body.mobile.slice(-2)}`,
              passType: body.passType || 'COUPLE',
              passName: isOnline ? `${passInfo.label} (Online Pass)` : `${passInfo.label} (Offline Pass)`,
              passMode: isOnline ? 'ONLINE' : 'OFFLINE',
              persons: passInfo.persons,
              price: passInfo.price,
              spot: isOnline ? 'Direct Gate Entry (Mahant Digvijaynath Park)' : 'Caha Gorakhpur',
              spotAddress: isOnline
                ? 'Mahant Digvijaynath Park, Ramgarh Tal Rd, Gorakhpur'
                : 'Kajakpur, Rail Vihar Colony Phase 3rd, Taramandal, Gorakhpur, Uttar Pradesh 273017',
              spotCity: 'Gorakhpur',
              spotTimings: '10:00 AM – 08:00 PM (Daily)',
              spotContact: 'Festival Helpdesk (9876543210)',
              status: isOnline ? 'ISSUED' : 'PRE_BOOKED',
              createdAt: new Date().toISOString(),
            };

            localBookings.unshift({
              id: 'local-' + Date.now(),
              ticket_no: ticketNo,
              name: newBooking.name,
              mobile: body.mobile,
              email: body.email,
              status: newBooking.status,
              payment_status: isOnline ? 'PAID' : 'PENDING',
              created_at: newBooking.createdAt,
              passes: { code: newBooking.passType, label: newBooking.passName, persons: newBooking.persons, price: newBooking.price },
              spots: { name: newBooking.spot, address: newBooking.spotAddress, city: newBooking.spotCity },
            });

            return sendJson(201, { success: true, ticket: newBooking });
          });
          return;
        }

        // 3. POST /api/get-ticket
        if (req.method === 'POST' && url === '/api/get-ticket') {
          getBody().then((body) => {
            const ticketNo = (body.ticketNo || '').trim().toUpperCase();
            const last4 = (body.mobileLast4 || '').trim();
            const found = localBookings.find((b) => b.ticket_no === ticketNo);
            if (!found || !found.mobile.endsWith(last4)) {
              return sendJson(404, { success: false, error: 'No ticket reservation found matching this ticket number and mobile digits.' });
            }
            return sendJson(200, {
              success: true,
              ticket: {
                ticketNo: found.ticket_no,
                name: found.name,
                mobileMasked: `${found.mobile.slice(0, 2)}XXXXXX${found.mobile.slice(-2)}`,
                passType: found.passes?.code,
                passName: found.passes?.label,
                persons: found.passes?.persons,
                price: found.passes?.price,
                spot: found.spots?.name,
                spotAddress: found.spots?.address,
                spotTimings: '10:00 AM – 08:00 PM (Daily)',
                spotContact: 'Desk In-charge (9876543210)',
                status: found.status,
                createdAt: found.created_at,
              },
            });
          });
          return;
        }

        // 4. POST /api/verify-ticket
        if (req.method === 'POST' && url === '/api/verify-ticket') {
          getBody().then((body) => {
            const ticketNo = (body.ticketNo || '').trim().toUpperCase();
            const action = body.action || 'CHECK_IN';
            const found = localBookings.find((b) => b.ticket_no === ticketNo);
            if (!found) {
              return sendJson(404, { success: false, error: 'INVALID_TICKET: No reservation exists for this ticket number.' });
            }
            if (found.status === 'CHECKED_IN') {
              return sendJson(409, { success: false, error: 'ALREADY USED', message: 'This ticket was already checked in earlier!', booking: found });
            }
            if (action === 'COLLECT') {
              found.status = 'COLLECTED';
              found.collected_at = new Date().toISOString();
              return sendJson(200, { success: true, message: 'Pass marked as COLLECTED successfully!', booking: found });
            }
            if (action === 'CHECK_IN') {
              found.status = 'CHECKED_IN';
              found.checked_in_at = new Date().toISOString();
              return sendJson(200, { success: true, message: `CHECK-IN SUCCESSFUL! Welcome ${found.name}.`, booking: found });
            }
            return sendJson(400, { success: false, error: 'Invalid action.' });
          });
          return;
        }

        // 5. GET /api/admin-bookings
        if (req.method === 'GET' && url === '/api/admin-bookings') {
          return sendJson(200, {
            success: true,
            bookings: localBookings,
            stats: {
              total: localBookings.length,
              perStatus: {
                PRE_BOOKED: localBookings.filter((b) => b.status === 'PRE_BOOKED').length,
                COLLECTED: localBookings.filter((b) => b.status === 'COLLECTED').length,
                CHECKED_IN: localBookings.filter((b) => b.status === 'CHECKED_IN').length,
                CANCELLED: localBookings.filter((b) => b.status === 'CANCELLED').length,
              },
            },
          });
        }

        // 6. PATCH /api/admin-bookings
        if (req.method === 'PATCH' && url === '/api/admin-bookings') {
          getBody().then((body) => {
            const ticketNo = (body.ticketNo || '').trim().toUpperCase();
            const newStatus = body.status;
            const found = localBookings.find((b) => b.ticket_no === ticketNo);
            if (!found) {
              return sendJson(404, { success: false, error: 'Booking not found.' });
            }
            if (found.status === 'CHECKED_IN') {
              return sendJson(400, { success: false, error: 'Cannot modify a pass that has already been CHECKED_IN.' });
            }
            found.status = newStatus;
            if (newStatus === 'COLLECTED') {
              found.collected_at = new Date().toISOString();
              found.payment_status = 'PAID';
            }
            return sendJson(200, {
              success: true,
              message: `Ticket status successfully changed to ${newStatus}.`,
              booking: found,
            });
          });
          return;
        }

        next();
  };

  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  plugins: [react(), devApiMiddleware()],
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
});
