// Source of truth for the database schema (Postgres / Supabase).
// `npm run db:sql` writes this to supabase/migrations/0001_init.sql.
module.exports = `
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
`;
