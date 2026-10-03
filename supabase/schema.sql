-- ==============================================================================
-- RAAS~RANG GARBA NIGHTS 2026 — SUPABASE POSTGRES SCHEMA
-- Production Pre-Ticket Booking & Gate Scanning Engine
-- ==============================================================================

-- 1. CLEANUP & EXTENSIONS (Safe re-runs)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PASSES TABLE
CREATE TABLE IF NOT EXISTS public.passes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    persons INT NOT NULL DEFAULT 1,
    price INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    total_quota INT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. COLLECTION SPOTS TABLE
CREATE TABLE IF NOT EXISTS public.spots (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Gorakhpur',
    contact_person TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    timings TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_no TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL CHECK (mobile ~ '^[6-9][0-9]{9}$'),
    email TEXT NOT NULL,
    pass_id INT NOT NULL REFERENCES public.passes(id) ON DELETE RESTRICT,
    spot_id INT NOT NULL REFERENCES public.spots(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'PRE_BOOKED' CHECK (status IN ('PRE_BOOKED', 'COLLECTED', 'CHECKED_IN', 'CANCELLED')),
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'REFUNDED')),
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    collected_at TIMESTAMPTZ,
    checked_in_at TIMESTAMPTZ
);

-- 5. SCAN & AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.scan_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    scanned_by TEXT NOT NULL,
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT
);

-- 6. PERFORMANCE & QUERY INDEXES
CREATE INDEX IF NOT EXISTS idx_bookings_mobile ON public.bookings(mobile);
CREATE INDEX IF NOT EXISTS idx_bookings_ticket_no ON public.bookings(ticket_no);
CREATE INDEX IF NOT EXISTS idx_bookings_spot_status ON public.bookings(spot_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_logs_booking ON public.scan_logs(booking_id, scanned_at DESC);

-- 7. SECURITY: STRICT ROW LEVEL SECURITY (RLS)
-- Deny public anon key direct access. Only service-role key touches these tables.
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

-- 8. ATOMIC BOOKING STORED PROCEDURE (Prevents Quota & Concurrency Race Conditions)
CREATE OR REPLACE FUNCTION public.create_booking(
    p_ticket_no TEXT,
    p_name TEXT,
    p_mobile TEXT,
    p_email TEXT,
    p_pass_id INT,
    p_spot_id INT,
    p_ip_address TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_quota INT;
    v_active_bookings_for_pass INT;
    v_mobile_bookings_count INT;
    v_booking_id UUID;
    v_created_at TIMESTAMPTZ;
BEGIN
    -- Step 1: Validate pass & check quota with lock
    SELECT total_quota INTO v_quota
    FROM public.passes
    WHERE id = p_pass_id AND is_active = true
    FOR SHARE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'INVALID_OR_INACTIVE_PASS');
    END IF;

    IF v_quota IS NOT NULL THEN
        SELECT count(*) INTO v_active_bookings_for_pass
        FROM public.bookings
        WHERE pass_id = p_pass_id AND status != 'CANCELLED';

        IF v_active_bookings_for_pass >= v_quota THEN
            RETURN json_build_object('success', false, 'error', 'PASS_SOLD_OUT');
        END IF;
    END IF;

    -- Step 2: Validate collection spot
    PERFORM 1 FROM public.spots WHERE id = p_spot_id AND is_active = true;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'INVALID_OR_INACTIVE_SPOT');
    END IF;

    -- Step 3: Check per-mobile booking limit (Max 5 non-cancelled passes)
    SELECT count(*) INTO v_mobile_bookings_count
    FROM public.bookings
    WHERE mobile = p_mobile AND status != 'CANCELLED';

    IF v_mobile_bookings_count >= 5 THEN
        RETURN json_build_object('success', false, 'error', 'MOBILE_BOOKING_LIMIT_REACHED');
    END IF;

    -- Step 4: Atomic insertion
    INSERT INTO public.bookings (
        ticket_no,
        name,
        mobile,
        email,
        pass_id,
        spot_id,
        status,
        payment_status,
        ip_address,
        created_at
    )
    VALUES (
        p_ticket_no,
        trim(p_name),
        p_mobile,
        lower(trim(p_email)),
        p_pass_id,
        p_spot_id,
        'PRE_BOOKED',
        'PENDING',
        p_ip_address,
        now()
    )
    RETURNING id, created_at INTO v_booking_id, v_created_at;

    RETURN json_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'ticket_no', p_ticket_no,
        'created_at', v_created_at
    );
EXCEPTION
    WHEN unique_violation THEN
        RETURN json_build_object('success', false, 'error', 'TICKET_NUMBER_COLLISION');
END;
$$;

-- 9. SEED DATA (Passes & Gorakhpur Collection Spots)
INSERT INTO public.passes (code, label, persons, price, is_active, total_quota)
VALUES
    ('SIGMA', 'Sigma Pass (Single Person Entry)', 1, 499, true, 1500),
    ('COUPLE', 'Couple Pass (2 Persons Entry)', 2, 899, true, 800),
    ('FAMILY', 'Family Pass (4 Persons Entry)', 4, 1699, true, 400)
ON CONFLICT (code) DO UPDATE
SET
    label = EXCLUDED.label,
    persons = EXCLUDED.persons,
    price = EXCLUDED.price,
    is_active = EXCLUDED.is_active;

INSERT INTO public.spots (name, address, city, contact_person, contact_phone, timings, is_active)
VALUES
    ('Mahant Digvijaynath Park Gate Counter', 'Mahant Digvijaynath Park, Ramgarh Tal Rd', 'Gorakhpur', 'Ravi Verma (Festival In-charge)', '9876543210', '10:00 AM – 08:00 PM (Daily)', true),
    ('Golghar City Center Collection Desk', 'Shop 14, Commercial Complex, Golghar Main Market', 'Gorakhpur', 'Amit Srivastava', '9876543211', '11:00 AM – 07:30 PM (Mon-Sat)', true),
    ('Medical College Road Desk', 'Near BRD Medical College Gate 1, Asuran Chowk', 'Gorakhpur', 'Pooja Tiwari', '9876543212', '10:30 AM – 07:00 PM (Daily)', true),
    ('Rapti Nagar Outreach Center', 'Sector 4 Community Hub, Rapti Nagar Phase 2', 'Gorakhpur', 'Kunal Singh', '9876543213', '11:00 AM – 06:30 PM (Daily)', true)
ON CONFLICT DO NOTHING;
