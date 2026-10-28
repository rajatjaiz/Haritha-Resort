-- Haritha Beach Resort - Complete Database Setup for Supabase


CREATE TABLE IF NOT EXISTS settings(key text PRIMARY KEY, value text);

CREATE TABLE IF NOT EXISTS menu_items(
  id serial PRIMARY KEY, kind text NOT NULL DEFAULT 'food', category text NOT NULL,
  name text NOT NULL, name_hi text, name_ml text, description text,
  price double precision NOT NULL DEFAULT 0,
  veg integer NOT NULL DEFAULT 1, available integer NOT NULL DEFAULT 1, sort integer NOT NULL DEFAULT 0);

CREATE TABLE IF NOT EXISTS orders(
  id serial PRIMARY KEY, room text NOT NULL, guest_name text, notes text,
  items jsonb NOT NULL, subtotal double precision, tax double precision, total double precision,
  status text NOT NULL DEFAULT 'new', pay_method text, pay_status text NOT NULL DEFAULT 'unpaid',
  rzp_order_id text, rzp_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz);
CREATE INDEX IF NOT EXISTS orders_room_idx ON orders(room, created_at);
CREATE INDEX IF NOT EXISTS orders_rzp_idx ON orders(rzp_order_id);

CREATE TABLE IF NOT EXISTS requests(
  id serial PRIMARY KEY, room text NOT NULL, type text NOT NULL, detail text,
  status text NOT NULL DEFAULT 'open', source text NOT NULL DEFAULT 'app',
  created_at timestamptz NOT NULL DEFAULT now(), done_at timestamptz);
CREATE INDEX IF NOT EXISTS requests_room_idx ON requests(room, status);

CREATE TABLE IF NOT EXISTS stays(
  id serial PRIMARY KEY, room text NOT NULL, guest_name text NOT NULL, phone text,
  checkin_at timestamptz NOT NULL, expected_checkout_at timestamptz, checkout_at timestamptz,
  feedback_token text, feedback_sent integer NOT NULL DEFAULT 0);
CREATE UNIQUE INDEX IF NOT EXISTS stays_one_active_per_room ON stays(room) WHERE checkout_at IS NULL;

CREATE TABLE IF NOT EXISTS feedback(
  id serial PRIMARY KEY, stay_id integer, room text, guest_name text, rating integer,
  food integer, cleanliness integer, service integer, comment text,
  created_at timestamptz NOT NULL DEFAULT now());

-- WhatsApp webhook de-duplication (Meta retries deliveries)
CREATE TABLE IF NOT EXISTS wa_seen(id text PRIMARY KEY, at timestamptz NOT NULL DEFAULT now());

-- The app talks to Postgres directly with the server-side connection string.
-- Row Level Security with no policies blocks the public Supabase API (anon / authenticated keys)
-- from reading or writing any of these tables.
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE stays ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_seen ENABLE ROW LEVEL SECURITY;


-- Seed Settings
INSERT INTO settings(key, value) VALUES('resort_name', 'Haritha Beach Resort') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings(key, value) VALUES('location', 'Suryalanka Beach, Bapatla, Andhra Pradesh') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings(key, value) VALUES('tagline', 'APTDC · Andhra Pradesh Tourism') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings(key, value) VALUES('wifi_name', 'Haritha_Guest') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings(key, value) VALUES('wifi_password', 'ChangeMe123') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings(key, value) VALUES('reception_phone', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings(key, value) VALUES('checkin_time', '12:00') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings(key, value) VALUES('checkout_time', '11:00') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings(key, value) VALUES('restaurant_hours', '07:30 - 22:30') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings(key, value) VALUES('gst_percent', '5') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings(key, value) VALUES('gstin', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings(key, value) VALUES('upi_id', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings(key, value) VALUES('upi_name', 'Haritha Beach Resort') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings(key, value) VALUES('accept_cash', '1') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings(key, value) VALUES('guidelines', 'Quiet hours 10 PM - 6 AM.
No outside food or alcohol in the rooms.
Beach swimming only in the marked safe zone; no lifeguard after dusk.
Please keep valuables in the room safe.
Switch off AC and lights when leaving the room.
Check-out time is 11:00 AM.') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings(key, value) VALUES('nearby', '[{"name":"Suryalanka Beach","note":"Right in front of the resort","dist":"0 km"},{"name":"Bapatla","note":"Town, ATM, pharmacy, hospital","dist":"~9 km"},{"name":"Chirala","note":"Railway station, market","dist":"~40 km"},{"name":"Guntur","note":"Major city, airport access via Vijayawada","dist":"~75 km"},{"name":"Bhavannarayana Swamy Temple, Bapatla","note":"Ancient temple","dist":"~9 km"}]') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings(key, value) VALUES('helplines', '[{"name":"Police","number":"100"},{"name":"Ambulance","number":"108"},{"name":"Fire","number":"101"},{"name":"Women helpline","number":"181"},{"name":"Tourist helpline","number":"1363"}]') ON CONFLICT (key) DO NOTHING;

-- Seed Sample Menu
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Breakfast', 'Idli (3 pcs)', 'इडली', 'ഇഡ്ഡലി', 'With sambar and chutneys', 60, 1, 0);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Breakfast', 'Plain Dosa', 'सादा डोसा', 'ദോശ', 'Crisp, with sambar and chutneys', 70, 1, 1);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Breakfast', 'Puri Bhaji (2 pcs)', 'पूरी भाजी', 'പൂരി ഭാജി', '', 70, 1, 2);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Veg Starters', 'Gobi Manchurian', 'गोबी मंचूरियन', 'ഗോബി മഞ്ചൂരിയൻ', '', 150, 1, 3);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Veg Main Course', 'Paneer Butter Masala', 'पनीर बटर मसाला', 'പനീർ ബട്ടർ മസാല', '', 210, 1, 4);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Veg Main Course', 'Veg Curry (Mixed)', 'मिक्स वेज करी', 'വെജ് കറി', '', 160, 1, 5);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Non-Veg Starters', 'Chicken 65', 'चिकन 65', 'ചിക്കൻ 65', '', 220, 0, 6);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Non-Veg Starters', 'Apollo Fish', 'अपोलो फिश', 'അപ്പോളോ ഫിഷ്', 'Andhra-style fried fish', 260, 0, 7);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Non-Veg Main Course', 'Andhra Chicken Curry', 'आंध्र चिकन करी', 'ആന്ധ്ര ചിക്കൻ കറി', 'Spicy, with bone', 250, 0, 8);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Non-Veg Main Course', 'Fish Curry', 'फिश करी', 'മീൻ കറി', 'Fresh catch, coastal style', 280, 0, 9);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Non-Veg Main Course', 'Prawns Masala', 'प्रॉन मसाला', 'ചെമ്മീൻ മസാല', '', 320, 0, 10);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Rice & Biryani', 'Veg Fried Rice', 'वेज फ्राइड राइस', 'വെജ് ഫ്രൈഡ് റൈസ്', '', 150, 1, 11);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Rice & Biryani', 'Chicken Dum Biryani', 'चिकन बिरयानी', 'ചിക്കൻ ബിരിയാണി', 'Served with raita', 260, 0, 12);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Rice & Biryani', 'Curd Rice', 'दही चावल', 'തൈര് സാദം', '', 80, 1, 13);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Breads', 'Butter Naan', 'बटर नान', 'ബട്ടർ നാൻ', '', 45, 1, 14);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Breads', 'Chapati (2 pcs)', 'चपाती', 'ചപ്പാത്തി', '', 40, 1, 15);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Beverages', 'Tea', 'चाय', 'ചായ', '', 20, 1, 16);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Beverages', 'Filter Coffee', 'फिल्टर कॉफी', 'കാപ്പി', '', 30, 1, 17);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Beverages', 'Fresh Lime Soda', 'लाइम सोडा', 'ലൈം സോഡ', '', 60, 1, 18);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Beverages', 'Tender Coconut', 'नारियल पानी', 'ഇളനീർ', '', 60, 1, 19);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('food', 'Desserts', 'Ice Cream (Scoop)', 'आइसक्रीम', 'ഐസ്ക്രീം', '', 60, 1, 20);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('bar', 'Beer', 'Beer (650 ml)', 'बीयर', 'ബിയർ', 'Price as per state MRP', 0, 1, 21);
INSERT INTO menu_items(kind, category, name, name_hi, name_ml, description, price, veg, sort) VALUES('bar', 'Whisky / Rum / Vodka', 'Spirits (60 ml)', 'स्पिरिट्स', 'സ്പിരിറ്റ്സ്', 'Ask at the bar counter', 0, 1, 22);
