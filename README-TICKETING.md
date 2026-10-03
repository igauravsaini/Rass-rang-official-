# Raas~Rang Garba Nights 2026 — Cloudflare Pages Pre-Ticket Booking & Gate Scanner System

Complete production setup guide for deploying Raas~Rang on **Cloudflare Pages**, with **Cloudflare Pages Functions** (edge compute), **Supabase Postgres (RLS + Atomic RPC)**, **Resend Email Notifications**, and a **Volunteer Gate QR Scanner**.

---

## 🚀 1. Supabase Postgres Database Setup

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and create or select your project.
2. Go to the **SQL Editor** from the left navigation panel.
3. Open [`supabase/schema.sql`](supabase/schema.sql) in this repository.
4. Paste the entire SQL script and click **Run**.
5. This initializes:
   - `public.passes`: Seeded with **SIGMA** (1 person, ₹499), **COUPLE** (2 persons, ₹899), and **FAMILY** (4 persons, ₹1699).
   - `public.spots`: Seeded with 4 Gorakhpur collection desks (Mahant Digvijaynath Park, Golghar, Medical College Rd, Rapti Nagar).
   - `public.bookings`: Stores reservations with the strict lifecycle (`PRE_BOOKED` → `COLLECTED` → `CHECKED_IN` or `CANCELLED`).
   - `public.scan_logs`: Audit logs for volunteer handovers and gate admissions.
   - **Row Level Security (RLS)**: Enforced on all tables with zero public access (only the backend service-role key can access the DB).
   - `public.create_booking(...)`: Atomic transaction RPC that guarantees per-mobile limits (max 5) and quota limits without race conditions.

---

## ☁️ 2. Cloudflare Pages Deployment & Environment Variables

### A. Deploy via GitHub / GitLab:
1. Push your code to your repository:
   ```bash
   git add .
   git commit -m "feat: complete pre-ticket booking system for Cloudflare Pages"
   git push
   ```
2. In the [Cloudflare Dashboard](https://dash.cloudflare.com/):
   - Navigate to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
   - Select your repository.
3. Configure the Build Settings:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Click **Save and Deploy**.

### B. Add Environment Variables (Secrets) in Cloudflare:
In your Cloudflare Pages Project:
- Go to **Settings** → **Variables and Secrets** → **Add variables**:

| Variable Name | Type | Description |
|---|---|---|
| `SUPABASE_URL` | Plaintext | Supabase Project URL (`https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_KEY` | **Secret (Encrypted)** | Supabase `service_role` secret key |
| `ADMIN_API_KEY` | **Secret (Encrypted)** | Secret key for `/admin` management portal |
| `VOLUNTEER_API_KEY` | **Secret (Encrypted)** | Secret key for `/admin/scan` gate volunteers |
| `RESEND_API_KEY` | **Secret (Encrypted)** | Resend API key (`re_...`) |
| `EMAIL_FROM` | Plaintext | Verified sender address, e.g. `Raas~Rang <tickets@yourdomain.com>` |
| `TURNSTILE_SECRET` | **Secret (Encrypted)** | Cloudflare Turnstile Secret Key |
| `VITE_TURNSTILE_SITE_KEY` | Plaintext | Cloudflare Turnstile Public Site Key |

---

## 💻 3. Local Development with Cloudflare Pages Functions

To test your frontend and Cloudflare Pages Functions together locally:

```bash
# 1. Build the frontend
npm run build

# 2. Run local Cloudflare Pages emulator with Wrangler
npx wrangler pages dev dist
```

You can create a `.dev.vars` file in the project root with your local credentials for testing:
```ini
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-key
ADMIN_API_KEY=test_admin_key
VOLUNTEER_API_KEY=test_volunteer_key
```

---

## 🎟️ 4. Architecture & Endpoints

All backend endpoints run at the edge on Cloudflare Pages Functions under `functions/api/`:

| Method | Path | Handled By | Purpose |
|---|---|---|---|
| `GET` | `/api/config` | [`functions/api/config.js`](functions/api/config.js) | Active passes & Gorakhpur collection spots |
| `POST` | `/api/book-ticket` | [`functions/api/book-ticket.js`](functions/api/book-ticket.js) | Atomic reservation, Turnstile check, async email |
| `POST` | `/api/get-ticket` | [`functions/api/get-ticket.js`](functions/api/get-ticket.js) | Lookup by ticket number + mobile last 4 |
| `POST` | `/api/verify-ticket` | [`functions/api/verify-ticket.js`](functions/api/verify-ticket.js) | Desk handover (`COLLECT`) and gate scan (`CHECK_IN`) |
| `GET/PATCH` | `/api/admin-bookings` | [`functions/api/admin-bookings.js`](functions/api/admin-bookings.js) | Reporting, search, status changes, CSV export |

### Attendee Experience:
- Click **"Pre-Book Pass"** on any ticket card.
- Fill Name, 10-digit Indian Mobile, Email, choose Collection Spot, and accept terms.
- Receive instant Virtual Ticket with **Ticket Number** (`RRG-26-XXXXXX`), details, and **live QR code**.
- Download as **PNG**, download as **PDF**, share via **WhatsApp**, or copy code.
- Ticket is auto-saved in `localStorage` and retrievable via **"Find My Ticket"**.

### Admin & Gate Volunteers:
- **Admin Dashboard:** Access `https://<your-subdomain>.pages.dev/admin` with `ADMIN_API_KEY`.
- **Gate Camera Scanner:** Access `https://<your-subdomain>.pages.dev/admin/scan` with `VOLUNTEER_API_KEY`.
  - Scans QR using camera or manual entry.
  - Chimes green on admission.
  - Alarms red with **"ALREADY USED"** if duplicate entry is attempted.
