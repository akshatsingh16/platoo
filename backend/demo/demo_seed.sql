-- =============================================================================
-- demo_seed.sql — Plato demo dataset
--
-- Populates ONE restaurant with realistic demo data:
--   • 1 Super Admin + 6 staff users (assigned as MANAGER / CHEF / WAITER / CASHIER)
--   • 10 tables (mix of AVAILABLE / OCCUPIED / RESERVED / MAINTENANCE)
--   • 6 menu categories, 30 dishes with images
--   • ~7 days of closed sessions with SERVED orders + COMPLETED payments
--   • Live sessions with orders in every kitchen state (PENDING → READY)
--     and one table that has requested the bill (payment PENDING)
--
-- Target restaurant: the first restaurant owned by admin@plato.com (if that user
-- is an OWNER), otherwise one owned by owner@demo.plato.com (created if missing).
--
-- ⚠ IDEMPOTENT RESET: re-running wipes tables, menu, staff assignments,
--   sessions, orders and payments of the TARGET restaurant and re-creates them.
--
-- NOT a Flyway migration — lives outside db/migration on purpose, so it never
-- runs in production. Run via: backend/demo/seed-demo.ps1
--
-- All demo user passwords are the same as admin@plato.com (password123 locally).
-- =============================================================================

SET TIME ZONE 'Asia/Kolkata';
SELECT setseed(0.42);  -- deterministic "random" data across runs

-- ── Helper: create one order with random line items ─────────────────────────
CREATE OR REPLACE FUNCTION pg_temp.demo_add_order(
    p_rest UUID, p_table UUID, p_session UUID,
    p_status order_status, p_ts TIMESTAMPTZ,
    p_n_items INT, p_tax NUMERIC, p_seq INT, p_notes TEXT DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql AS $fn$
DECLARE
    v_order UUID;
    v_item_status order_item_status;
BEGIN
    v_item_status := CASE p_status
        WHEN 'PENDING'   THEN 'PENDING'
        WHEN 'ACCEPTED'  THEN 'PENDING'
        WHEN 'PREPARING' THEN 'PREPARING'
        WHEN 'READY'     THEN 'READY'
        WHEN 'SERVED'    THEN 'SERVED'
        ELSE 'CANCELLED' END::order_item_status;

    INSERT INTO orders (restaurant_id, table_id, session_id, order_number, status,
                        notes, placed_at, completed_at, created_at, updated_at)
    VALUES (p_rest, p_table, p_session,
            'ORD-' || to_char(p_ts, 'YYYYMMDD') || '-' || (1000 + p_seq)::text,
            p_status, p_notes, p_ts,
            CASE WHEN p_status = 'SERVED' THEN p_ts + interval '32 minutes' END,
            p_ts, p_ts)
    RETURNING id INTO v_order;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price,
                             special_request, status, created_at, updated_at)
    SELECT v_order, mi.id, 1 + floor(random() * 2)::int, mi.price,
           CASE WHEN random() < 0.15
                THEN (ARRAY['Less spicy please','Extra spicy','No onion','Serve hot','No ice'])[1 + floor(random()*5)::int]
           END,
           v_item_status, p_ts, p_ts
    FROM (SELECT id, price FROM menu_items
          WHERE restaurant_id = p_rest AND is_available
          ORDER BY random() LIMIT p_n_items) mi;

    UPDATE orders o SET
        subtotal    = t.sub,
        tax         = round(t.sub * p_tax / 100, 2),
        grand_total = t.sub + round(t.sub * p_tax / 100, 2)
    FROM (SELECT sum(quantity * unit_price) AS sub
          FROM order_items WHERE order_id = v_order) t
    WHERE o.id = v_order;

    RETURN v_order;
END $fn$;

-- ── Helper: create a payment that aggregates a session's orders ─────────────
CREATE OR REPLACE FUNCTION pg_temp.demo_add_payment(
    p_rest UUID, p_session UUID, p_sc NUMERIC,
    p_method payment_method, p_status payment_status, p_ts TIMESTAMPTZ
) RETURNS VOID LANGUAGE plpgsql AS $fn$
BEGIN
    INSERT INTO payments (session_id, restaurant_id, subtotal, tax, service_charge,
                          discount, amount, payment_method, status,
                          transaction_reference, paid_at, created_at, updated_at)
    SELECT p_session, p_rest, s.sub, s.tax, round(s.sub * p_sc / 100, 2), 0,
           s.sub + s.tax + round(s.sub * p_sc / 100, 2),
           p_method, p_status,
           CASE WHEN p_status = 'COMPLETED' AND p_method <> 'CASH'
                THEN p_method::text || '-' || upper(substr(md5(random()::text), 1, 10)) END,
           CASE WHEN p_status = 'COMPLETED' THEN p_ts END,
           p_ts, p_ts
    FROM (SELECT coalesce(sum(subtotal), 0) AS sub, coalesce(sum(tax), 0) AS tax
          FROM orders WHERE session_id = p_session AND status <> 'CANCELLED') s;
END $fn$;

DO $$
DECLARE
    v_owner   UUID;
    v_hash    TEXT;
    v_rest    UUID;
    v_tax     NUMERIC;
    v_sc      NUMERIC;
    v_seq     INT := 0;
    v_day     INT;
    v_n       INT;
    v_i       INT;
    v_ts      TIMESTAMPTZ;
    v_table   UUID;
    v_session UUID;
    v_t       RECORD;
BEGIN
    -- ── Resolve owner + password hash ───────────────────────────────────────
    SELECT password_hash INTO v_hash FROM users WHERE email = 'admin@plato.com';
    IF v_hash IS NULL THEN
        RAISE EXCEPTION 'admin@plato.com not found — start the backend once so it seeds the admin user.';
    END IF;

    SELECT id INTO v_owner FROM users WHERE email = 'admin@plato.com' AND role = 'OWNER';
    IF v_owner IS NULL THEN
        INSERT INTO users (full_name, email, phone, password_hash, role)
        VALUES ('Demo Owner', 'owner@demo.plato.com', '9800000001', v_hash, 'OWNER')
        ON CONFLICT (email) DO UPDATE SET role = 'OWNER'
        RETURNING id INTO v_owner;
    END IF;

    -- ── Resolve / create restaurant ─────────────────────────────────────────
    SELECT id INTO v_rest FROM restaurants WHERE owner_id = v_owner ORDER BY created_at LIMIT 1;
    IF v_rest IS NULL THEN
        INSERT INTO restaurants (owner_id, name) VALUES (v_owner, 'Plato Restaurant')
        RETURNING id INTO v_rest;
    END IF;

    UPDATE restaurants SET
        description    = coalesce(description, 'Modern Indian kitchen serving tandoor classics, slow-cooked curries and dum biryani.'),
        phone          = coalesce(phone, '9876543210'),
        email          = coalesce(email, 'hello@platorestaurant.in'),
        address        = coalesce(address, '42, 100 Feet Road, Indiranagar'),
        city           = coalesce(city, 'Bengaluru'),
        state          = coalesce(state, 'Karnataka'),
        country        = coalesce(country, 'India'),
        zipcode        = coalesce(zipcode, '560038'),
        timezone       = coalesce(timezone, 'Asia/Kolkata'),
        opening_time   = coalesce(opening_time, '11:00'),
        closing_time   = coalesce(closing_time, '23:30'),
        status         = 'ACTIVE',
        accepting_orders = true,
        tax_percentage = CASE WHEN tax_percentage = 0 THEN 5.00 ELSE tax_percentage END,
        service_charge = CASE WHEN service_charge = 0 THEN 2.50 ELSE service_charge END,
        updated_at     = now()
    WHERE id = v_rest
    RETURNING tax_percentage, service_charge INTO v_tax, v_sc;

    RAISE NOTICE 'Seeding restaurant % (tax pct %, service charge pct %)', v_rest, v_tax, v_sc;

    -- ── Reset previous demo data for this restaurant ────────────────────────
    DELETE FROM payments    WHERE restaurant_id = v_rest;
    DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE restaurant_id = v_rest);
    DELETE FROM orders      WHERE restaurant_id = v_rest;
    DELETE FROM customer_sessions WHERE restaurant_id = v_rest;
    DELETE FROM menu_items      WHERE restaurant_id = v_rest;
    DELETE FROM menu_categories WHERE restaurant_id = v_rest;
    DELETE FROM employees         WHERE restaurant_id = v_rest;
    DELETE FROM restaurant_tables WHERE restaurant_id = v_rest;

    -- ── Users ───────────────────────────────────────────────────────────────
    INSERT INTO users (full_name, email, phone, password_hash, role, last_login, created_at) VALUES
        ('Platform Admin', 'superadmin@demo.plato.com', '9800000000', v_hash, 'SUPER_ADMIN', now() - interval '2 days',  now() - interval '60 days'),
        ('Priya Sharma',   'priya.manager@demo.plato.com', '9811111111', v_hash, 'EMPLOYEE', now() - interval '3 hours', now() - interval '45 days'),
        ('Arjun Nair',     'arjun.chef@demo.plato.com',    '9822222222', v_hash, 'EMPLOYEE', now() - interval '1 hour',  now() - interval '40 days'),
        ('Meera Iyer',     'meera.chef@demo.plato.com',    '9833333333', v_hash, 'EMPLOYEE', now() - interval '5 hours', now() - interval '30 days'),
        ('Rahul Verma',    'rahul.waiter@demo.plato.com',  '9844444444', v_hash, 'EMPLOYEE', now() - interval '2 hours', now() - interval '25 days'),
        ('Sneha Kapoor',   'sneha.waiter@demo.plato.com',  '9855555555', v_hash, 'EMPLOYEE', now() - interval '1 day',   now() - interval '20 days'),
        ('Vikram Singh',   'vikram.cashier@demo.plato.com','9866666666', v_hash, 'EMPLOYEE', now() - interval '4 hours', now() - interval '15 days')
    ON CONFLICT (email) DO UPDATE SET status = 'ACTIVE', password_hash = EXCLUDED.password_hash;

    INSERT INTO employees (user_id, restaurant_id, role)
    SELECT u.id, v_rest, e.role::employee_role
    FROM (VALUES ('priya.manager@demo.plato.com','MANAGER'),
                 ('arjun.chef@demo.plato.com','CHEF'),
                 ('meera.chef@demo.plato.com','CHEF'),
                 ('rahul.waiter@demo.plato.com','WAITER'),
                 ('sneha.waiter@demo.plato.com','WAITER'),
                 ('vikram.cashier@demo.plato.com','CASHIER')) e(email, role)
    JOIN users u ON u.email = e.email;

    -- ── Tables ──────────────────────────────────────────────────────────────
    INSERT INTO restaurant_tables (restaurant_id, table_number, capacity, label, qr_token, status)
    SELECT v_rest, t.num, t.cap, t.label, md5(random()::text) || substr(md5(random()::text), 1, 16), t.st::table_status
    FROM (VALUES ('T1', 2, 'Window Seat',      'AVAILABLE'),
                 ('T2', 4, 'Window Seat',      'OCCUPIED'),
                 ('T3', 4, 'Main Hall',        'AVAILABLE'),
                 ('T4', 6, 'Main Hall',        'OCCUPIED'),
                 ('T5', 2, 'Balcony',          'OCCUPIED'),
                 ('T6', 4, 'Balcony',          'AVAILABLE'),
                 ('T7', 8, 'Family Booth',     'OCCUPIED'),
                 ('T8', 4, 'Main Hall',        'OCCUPIED'),
                 ('T9', 10,'Private Dining',   'RESERVED'),
                 ('T10',2, 'Bar Counter',      'MAINTENANCE')) t(num, cap, label, st);

    -- ── Menu ────────────────────────────────────────────────────────────────
    INSERT INTO menu_categories (restaurant_id, name, description, display_order) VALUES
        (v_rest, 'Starters',        'Small plates fresh from the tandoor and the wok', 1),
        (v_rest, 'Main Course',     'Slow-cooked curries and signature mains',         2),
        (v_rest, 'Biryani & Rice',  'Fragrant dum biryanis and rice bowls',            3),
        (v_rest, 'Breads',          'Hand-stretched breads from the clay oven',        4),
        (v_rest, 'Desserts',        'Sweet endings',                                   5),
        (v_rest, 'Beverages',       'Coolers, lassis and hot brews',                   6);

    INSERT INTO menu_items (category_id, restaurant_id, name, description, price, image_url, is_available, display_order)
    SELECT c.id, v_rest, i.name, i.descr, i.price, i.img, i.avail, i.ord
    FROM (VALUES
        ('Starters','Paneer Tikka','Cottage cheese cubes marinated in spiced yoghurt, char-grilled in the tandoor',289.00,'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800',true,1),
        ('Starters','Chicken 65','Crispy fried chicken tossed with curry leaves and red chillies',319.00,'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800',true,2),
        ('Starters','Hara Bhara Kebab','Spinach, peas and potato patties with mint chutney',229.00,'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',true,3),
        ('Starters','Tandoori Prawns','Jumbo prawns in ajwain marinade, finished with lemon butter',449.00,'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800',true,4),
        ('Starters','Veg Spring Rolls','Crisp rolls stuffed with stir-fried vegetables, sweet chilli dip',199.00,'https://images.unsplash.com/photo-1606525437679-037aca74a3e9?w=800',true,5),
        ('Main Course','Butter Chicken','Tandoori chicken simmered in a velvety tomato-butter gravy',389.00,'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800',true,1),
        ('Main Course','Paneer Butter Masala','Soft paneer in rich, mildly sweet makhani gravy',329.00,'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800',true,2),
        ('Main Course','Dal Makhani','Black lentils slow-cooked overnight with cream and butter',269.00,'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',true,3),
        ('Main Course','Rogan Josh','Kashmiri-style lamb curry with aromatic whole spices',459.00,'https://images.unsplash.com/photo-1545247181-516773cae754?w=800',true,4),
        ('Main Course','Kadai Vegetables','Seasonal vegetables tossed with crushed coriander and peppers',279.00,'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',true,5),
        ('Main Course','Goan Fish Curry','Kingfish in tangy coconut and kokum curry',429.00,'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800',false,6),
        ('Biryani & Rice','Hyderabadi Chicken Biryani','Dum-cooked basmati with saffron, fried onions and tender chicken',379.00,'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',true,1),
        ('Biryani & Rice','Mutton Biryani','Slow-cooked lamb layered with long-grain basmati',449.00,'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=800',true,2),
        ('Biryani & Rice','Veg Dum Biryani','Garden vegetables and paneer sealed and cooked dum-style',299.00,'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800',true,3),
        ('Biryani & Rice','Jeera Rice','Basmati tempered with cumin and ghee',169.00,'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800',true,4),
        ('Breads','Butter Naan','Soft leavened bread brushed with butter',69.00,'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800',true,1),
        ('Breads','Garlic Naan','Naan topped with garlic and fresh coriander',89.00,'https://images.unsplash.com/photo-1655979284091-eea0e93405ee?w=800',true,2),
        ('Breads','Tandoori Roti','Whole-wheat bread from the clay oven',39.00,'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800',true,3),
        ('Breads','Lachha Paratha','Flaky, layered whole-wheat paratha',79.00,'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800',true,4),
        ('Breads','Cheese Kulcha','Stuffed with mozzarella and herbs',129.00,'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800',true,5),
        ('Desserts','Gulab Jamun','Warm milk dumplings soaked in rose-cardamom syrup',129.00,'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?w=800',true,1),
        ('Desserts','Rasmalai','Soft cottage cheese discs in saffron milk',149.00,'https://images.unsplash.com/photo-1601303516534-bf0b9b6d4f2d?w=800',true,2),
        ('Desserts','Kulfi Falooda','Pistachio kulfi with vermicelli, basil seeds and rose syrup',179.00,'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=800',true,3),
        ('Desserts','Chocolate Brownie','Warm walnut brownie with vanilla ice cream',199.00,'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800',true,4),
        ('Beverages','Mango Lassi','Thick yoghurt smoothie with Alphonso mango',129.00,'https://images.unsplash.com/photo-1571006682881-79262aa7b2a3?w=800',true,1),
        ('Beverages','Masala Chai','Spiced Indian milk tea',59.00,'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=800',true,2),
        ('Beverages','Fresh Lime Soda','Sweet or salted, with a hint of mint',89.00,'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800',true,3),
        ('Beverages','Cold Coffee','Blended coffee with ice cream',149.00,'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800',true,4),
        ('Beverages','Virgin Mojito','Mint, lime and soda over crushed ice',139.00,'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800',true,5),
        ('Beverages','Filter Coffee','South Indian decoction coffee with frothy milk',69.00,'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',true,6)
    ) i(cat, name, descr, price, img, avail, ord)
    JOIN menu_categories c ON c.restaurant_id = v_rest AND c.name = i.cat;

    -- ── History: closed sessions over the last 7 days (incl. earlier today) ─
    FOR v_day IN REVERSE 7..0 LOOP
        v_n := CASE WHEN v_day = 0 THEN 4 ELSE 4 + floor(random() * 5)::int END;
        FOR v_i IN 1..v_n LOOP
            v_ts := date_trunc('day', now()) - v_day * interval '1 day'
                    + interval '12 hours' + random() * interval '10 hours';
            CONTINUE WHEN v_ts > now() - interval '90 minutes';

            SELECT id INTO v_table FROM restaurant_tables
            WHERE restaurant_id = v_rest AND status <> 'MAINTENANCE'
            ORDER BY random() LIMIT 1;

            INSERT INTO customer_sessions (restaurant_id, table_id, session_token, status, guest_count,
                                           started_at, last_activity, expires_at, ended_at, created_at, updated_at)
            VALUES (v_rest, v_table, md5(random()::text) || md5(random()::text), 'CLOSED',
                    1 + floor(random() * 5)::int, v_ts, v_ts + interval '70 minutes',
                    v_ts + interval '100 minutes', v_ts + interval '75 minutes', v_ts, v_ts + interval '75 minutes')
            RETURNING id INTO v_session;

            v_seq := v_seq + 1;
            PERFORM pg_temp.demo_add_order(v_rest, v_table, v_session, 'SERVED', v_ts + interval '3 minutes',
                                           2 + floor(random() * 3)::int, v_tax, v_seq);
            IF random() < 0.45 THEN
                v_seq := v_seq + 1;
                PERFORM pg_temp.demo_add_order(v_rest, v_table, v_session, 'SERVED', v_ts + interval '35 minutes',
                                               1 + floor(random() * 2)::int, v_tax, v_seq, 'Desserts after mains');
            END IF;
            IF random() < 0.12 THEN
                v_seq := v_seq + 1;
                PERFORM pg_temp.demo_add_order(v_rest, v_table, v_session, 'CANCELLED', v_ts + interval '10 minutes',
                                               1, v_tax, v_seq, 'Changed our mind');
            END IF;

            PERFORM pg_temp.demo_add_payment(v_rest, v_session, v_sc,
                (ARRAY['UPI','UPI','CARD','CASH'])[1 + floor(random() * 4)::int]::payment_method,
                'COMPLETED', v_ts + interval '72 minutes');
        END LOOP;
    END LOOP;

    -- ── Live: active sessions on OCCUPIED tables ────────────────────────────
    FOR v_t IN
        SELECT id, table_number FROM restaurant_tables
        WHERE restaurant_id = v_rest AND status = 'OCCUPIED' ORDER BY table_number
    LOOP
        v_ts := now() - CASE v_t.table_number
                    WHEN 'T2' THEN interval '40 minutes'
                    WHEN 'T4' THEN interval '8 minutes'
                    WHEN 'T5' THEN interval '25 minutes'
                    WHEN 'T7' THEN interval '75 minutes'
                    ELSE interval '15 minutes' END;

        INSERT INTO customer_sessions (restaurant_id, table_id, session_token, status, guest_count,
                                       started_at, last_activity, expires_at, created_at, updated_at)
        VALUES (v_rest, v_t.id, md5(random()::text) || md5(random()::text), 'ACTIVE',
                2 + floor(random() * 4)::int, v_ts, now() - interval '2 minutes',
                now() + interval '28 minutes', v_ts, now())
        RETURNING id INTO v_session;

        v_seq := v_seq + 1;
        CASE v_t.table_number
            WHEN 'T2' THEN   -- starters served, mains on the stove
                PERFORM pg_temp.demo_add_order(v_rest, v_t.id, v_session, 'SERVED', v_ts + interval '2 minutes', 2, v_tax, v_seq);
                v_seq := v_seq + 1;
                PERFORM pg_temp.demo_add_order(v_rest, v_t.id, v_session, 'PREPARING', now() - interval '12 minutes', 3, v_tax, v_seq, 'Mains — medium spicy');
            WHEN 'T4' THEN   -- brand-new order awaiting kitchen confirmation
                PERFORM pg_temp.demo_add_order(v_rest, v_t.id, v_session, 'PENDING', now() - interval '3 minutes', 4, v_tax, v_seq, 'Birthday table — please bring a candle');
            WHEN 'T5' THEN   -- food plated, waiting for pickup
                PERFORM pg_temp.demo_add_order(v_rest, v_t.id, v_session, 'READY', now() - interval '20 minutes', 2, v_tax, v_seq);
            WHEN 'T7' THEN   -- finished eating, bill requested
                PERFORM pg_temp.demo_add_order(v_rest, v_t.id, v_session, 'SERVED', v_ts + interval '4 minutes', 4, v_tax, v_seq);
                v_seq := v_seq + 1;
                PERFORM pg_temp.demo_add_order(v_rest, v_t.id, v_session, 'SERVED', v_ts + interval '40 minutes', 2, v_tax, v_seq);
                PERFORM pg_temp.demo_add_payment(v_rest, v_session, v_sc, 'UPI', 'PENDING', now() - interval '4 minutes');
            ELSE             -- T8: accepted, kitchen about to start
                PERFORM pg_temp.demo_add_order(v_rest, v_t.id, v_session, 'ACCEPTED', now() - interval '6 minutes', 3, v_tax, v_seq);
        END CASE;
    END LOOP;

    RAISE NOTICE 'Demo seed complete: % orders created.', v_seq;
END $$;

-- ── Summary ─────────────────────────────────────────────────────────────────
SELECT 'tables' AS entity, count(*) FROM restaurant_tables
UNION ALL SELECT 'menu_items', count(*) FROM menu_items
UNION ALL SELECT 'employees', count(*) FROM employees WHERE is_active
UNION ALL SELECT 'sessions (active)', count(*) FROM customer_sessions WHERE status = 'ACTIVE'
UNION ALL SELECT 'orders', count(*) FROM orders
UNION ALL SELECT 'payments (completed)', count(*) FROM payments WHERE status = 'COMPLETED'
UNION ALL SELECT 'payments (pending)', count(*) FROM payments WHERE status = 'PENDING';
