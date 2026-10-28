// Haritha Beach Resort - API routes. Framework-free (node:http style handler) so it runs both
// locally (server.js) and as a Vercel serverless function (api/index.js).
const crypto = require('node:crypto');
const db = require('./db');
const wa = require('./whatsapp');
const { renderInvoice, mode: invoiceMode } = require('./invoice');
const { DEFAULTS } = require('./seed');

const E = k => process.env[k];
const isVercel = () => !!process.env.VERCEL;
const publicUrl = req => (E('PUBLIC_URL') || (E('VERCEL_PROJECT_PRODUCTION_URL') && 'https://' + E('VERCEL_PROJECT_PRODUCTION_URL')) ||
  `${req?.headers?.['x-forwarded-proto'] || 'http'}://${req?.headers?.host || 'localhost:3000'}`).replace(/\/$/, '');

// ---- helpers ------------------------------------------------------------
const json = (res, code, body) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };
const readRaw = req => new Promise((resolve, reject) => {
  let b = '';
  req.on('data', d => { b += d; if (b.length > 1e6) { req.destroy(); reject(new Error('Body too large')); } });
  req.on('end', () => resolve(b)); req.on('error', reject);
});
const readBody = async req => { const raw = await readRaw(req); try { return raw ? JSON.parse(raw) : {}; } catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); } };
const clean = (s, n = 300) => String(s ?? '').slice(0, n);
const timingEq = (a, b) => { a = Buffer.from(String(a)); b = Buffer.from(String(b)); return a.length === b.length && crypto.timingSafeEqual(a, b); };
const getSettings = async () => Object.fromEntries((await db.all('SELECT key,value FROM settings')).map(r => [r.key, r.value]));
const activeStay = room => db.get('SELECT id,room,guest_name,checkin_at,expected_checkout_at FROM stays WHERE room=$1 AND checkout_at IS NULL ORDER BY id DESC LIMIT 1', [room]);
const waLink = (phone, text) => `https://wa.me/${String(phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

// Admin auth. On Vercel an ADMIN_PIN must be configured (the dev default is refused).
async function adminCheck(req) {
  const pin = String(E('ADMIN_PIN') || (isVercel() ? '' : '1234')).trim();
  if (!pin || (isVercel() && pin === '1234')) return { code: 503, error: 'ADMIN_PIN is not set. Set a strong ADMIN_PIN environment variable.' };
  const clientPin = String(req.headers['x-admin-pin'] || '').trim();
  if (timingEq(clientPin, pin)) return null;
  await new Promise(r => setTimeout(r, 400)); // slow down PIN guessing
  return { code: 401, error: 'Admin PIN required' };
}

const routes = [];
const route = (method, pattern, handler, admin = false) =>
  routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '/?$'), handler, admin });

// ---- public -------------------------------------------------------------
route('GET', '/api/config', async (req, res) => {
  const s = await getSettings(), rz = !!(E('RAZORPAY_KEY_ID') && E('RAZORPAY_KEY_SECRET'));
  json(res, 200, {
    resort_name: s.resort_name, location: s.location, tagline: s.tagline, wifi_name: s.wifi_name, wifi_password: s.wifi_password,
    reception_phone: s.reception_phone, checkin_time: s.checkin_time, checkout_time: s.checkout_time, restaurant_hours: s.restaurant_hours,
    gst_percent: +s.gst_percent, guidelines: s.guidelines, nearby: JSON.parse(s.nearby || '[]'), helplines: JSON.parse(s.helplines || '[]'),
    pay: { razorpay: rz, razorpay_key: rz ? E('RAZORPAY_KEY_ID') : null, upi_id: s.upi_id, upi_name: s.upi_name, cash: s.accept_cash === '1' }
  });
});
route('GET', '/api/menu', async (req, res) =>
  json(res, 200, await db.all('SELECT id,kind,category,name,name_hi,name_ml,description,price,veg,available FROM menu_items ORDER BY kind,sort,id')));
route('GET', '/api/stay/:room', async (req, res, p) => json(res, 200, (await activeStay(p.room)) || null));

route('GET', '/api/rooms/:room/pulse', async (req, res, p) => json(res, 200, await db.get(
  `SELECT (SELECT COALESCE(MAX(EXTRACT(EPOCH FROM COALESCE(updated_at,created_at))),0) FROM orders WHERE room=$1)::float8 o,
          (SELECT COUNT(*)::text||'-'||COALESCE(MAX(EXTRACT(EPOCH FROM done_at)),0)::text FROM requests WHERE room=$1) r,
          (SELECT COALESCE(MAX(id),0)::text||'-'||COUNT(*) FILTER (WHERE checkout_at IS NULL)::text FROM stays WHERE room=$1) s,
          (SELECT value FROM settings WHERE key='version') v`, [p.room])));

route('POST', '/api/orders', async (req, res) => {
  const b = await readBody(req);
  const room = clean(b.room, 20).trim();
  if (!room) return json(res, 400, { error: 'Room number required' });
  if (!Array.isArray(b.items) || !b.items.length) return json(res, 400, { error: 'Cart is empty' });
  const method = ['razorpay', 'upi', 'room'].includes(b.pay_method) ? b.pay_method : 'room';
  const rzp = E('RAZORPAY_KEY_ID') && E('RAZORPAY_KEY_SECRET');
  if (method === 'razorpay' && !rzp) return json(res, 400, { error: 'Online payment not configured' });
  const s = await getSettings();
  let subtotal = 0; const lines = [];
  for (const it of b.items.slice(0, 60)) {
    const m = await db.get("SELECT * FROM menu_items WHERE id=$1 AND kind='food'", [parseInt(it.id) || 0]);
    const qty = Math.max(1, Math.min(20, parseInt(it.qty) || 1));
    if (!m || !m.available) return json(res, 400, { error: `"${m ? m.name : 'Item'}" is not available` });
    lines.push({ id: m.id, name: m.name, qty, price: m.price }); subtotal += m.price * qty;
  }
  const tax = Math.round(subtotal * (+s.gst_percent)) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  const stay = await activeStay(room);
  const id = await db.insert(
    'INSERT INTO orders(room,guest_name,notes,items,subtotal,tax,total,pay_method,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [room, clean(b.guest_name || stay?.guest_name, 80), clean(b.notes, 300), JSON.stringify(lines), subtotal, tax, total, method, method === 'razorpay' ? 'awaiting_payment' : 'new']);
  let rz = null;
  if (method === 'razorpay') {
    const rr = await fetch((E('RAZORPAY_API_URL') || 'https://api.razorpay.com') + '/v1/orders', {
      method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { Authorization: 'Basic ' + Buffer.from(`${E('RAZORPAY_KEY_ID')}:${E('RAZORPAY_KEY_SECRET')}`).toString('base64'), 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Math.round(total * 100), currency: 'INR', receipt: `ord_${id}`, notes: { room, order_id: String(id), resort: s.resort_name } })
    }).catch(() => null);
    const rj = rr ? await rr.json().catch(() => ({})) : {};
    if (!rr || !rr.ok) {
      await db.run("UPDATE orders SET status='cancelled', updated_at=now() WHERE id=$1", [id]);
      return json(res, 502, { error: 'Payment provider error', detail: rj.error?.description });
    }
    await db.run('UPDATE orders SET rzp_order_id=$1 WHERE id=$2', [rj.id, id]);
    rz = { order_id: rj.id, amount: rj.amount, currency: rj.currency };
  }
  json(res, 201, { id, total, subtotal, tax, rzp: rz });
});

// Browser-side confirmation after Razorpay Checkout (the webhook below is the fallback if the tab is closed).
route('POST', '/api/orders/:id/verify', async (req, res, p) => {
  const b = await readBody(req);
  const o = await db.get('SELECT * FROM orders WHERE id=$1', [parseInt(p.id) || 0]);
  if (!o || !o.rzp_order_id || o.rzp_order_id !== b.razorpay_order_id) return json(res, 404, { error: 'Not found' });
  const expected = crypto.createHmac('sha256', E('RAZORPAY_KEY_SECRET') || '').update(`${o.rzp_order_id}|${b.razorpay_payment_id}`).digest('hex');
  if (!timingEq(expected, b.razorpay_signature)) return json(res, 400, { error: 'Payment verification failed' });
  await db.run("UPDATE orders SET pay_status='paid', status=CASE WHEN status='awaiting_payment' THEN 'new' ELSE status END, rzp_payment_id=$1, updated_at=now() WHERE id=$2", [b.razorpay_payment_id, o.id]);
  json(res, 200, { ok: true });
});

// Razorpay -> server webhook. Dashboard > Settings > Webhooks: URL {PUBLIC_URL}/api/razorpay/webhook,
// events payment.captured + order.paid, secret = RAZORPAY_WEBHOOK_SECRET.
route('POST', '/api/razorpay/webhook', async (req, res) => {
  const raw = await readRaw(req), secret = E('RAZORPAY_WEBHOOK_SECRET');
  if (!secret) return json(res, 503, { error: 'RAZORPAY_WEBHOOK_SECRET not set' });
  const sig = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  if (!timingEq(sig, req.headers['x-razorpay-signature'] || '')) return json(res, 400, { error: 'Bad signature' });
  const ev = JSON.parse(raw), pay = ev.payload?.payment?.entity;
  if (['payment.captured', 'order.paid'].includes(ev.event) && pay?.order_id)
    await db.run("UPDATE orders SET pay_status='paid', status=CASE WHEN status='awaiting_payment' THEN 'new' ELSE status END, rzp_payment_id=$1, updated_at=now() WHERE rzp_order_id=$2", [pay.id, pay.order_id]);
  json(res, 200, { ok: true });
});

route('GET', '/api/rooms/:room/orders', async (req, res, p) =>
  json(res, 200, await db.all("SELECT * FROM orders WHERE room=$1 AND status<>'awaiting_payment' AND created_at > now() - interval '1 day' ORDER BY id DESC", [p.room])));

const REQUEST_TYPES = ['reception', 'housekeeping', 'towels', 'laundry', 'taxi', 'maintenance', 'water', 'other'];
route('POST', '/api/requests', async (req, res) => {
  const b = await readBody(req);
  const room = clean(b.room, 20).trim();
  if (!room || !REQUEST_TYPES.includes(b.type)) return json(res, 400, { error: 'Invalid request' });
  const open = await db.get("SELECT id FROM requests WHERE room=$1 AND type=$2 AND status='open'", [room, b.type]);
  if (open) return json(res, 200, { id: open.id, duplicate: true });
  json(res, 201, { id: await db.insert('INSERT INTO requests(room,type,detail) VALUES($1,$2,$3)', [room, b.type, clean(b.detail, 300)]) });
});
route('GET', '/api/rooms/:room/requests', async (req, res, p) =>
  json(res, 200, await db.all("SELECT * FROM requests WHERE room=$1 AND created_at > now() - interval '1 day' ORDER BY id DESC", [p.room])));

route('GET', '/api/feedback/:token', async (req, res, p) => {
  const st = await db.get('SELECT id,guest_name,room FROM stays WHERE feedback_token=$1', [p.token]);
  if (!st) return json(res, 404, { error: 'Invalid link' });
  json(res, 200, { guest_name: st.guest_name, done: !!(await db.get('SELECT 1 x FROM feedback WHERE stay_id=$1', [st.id])), resort_name: (await getSettings()).resort_name });
});
route('POST', '/api/feedback/:token', async (req, res, p) => {
  const b = await readBody(req);
  const st = await db.get('SELECT * FROM stays WHERE feedback_token=$1', [p.token]);
  if (!st) return json(res, 404, { error: 'Invalid link' });
  if (await db.get('SELECT 1 x FROM feedback WHERE stay_id=$1', [st.id])) return json(res, 409, { error: 'Already submitted' });
  const n = v => { v = Math.round(+v); return v >= 1 && v <= 5 ? v : null; };
  if (!n(b.rating)) return json(res, 400, { error: 'Overall rating required' });
  await db.run('INSERT INTO feedback(stay_id,room,guest_name,rating,food,cleanliness,service,comment) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',
    [st.id, st.room, st.guest_name, n(b.rating), n(b.food), n(b.cleanliness), n(b.service), clean(b.comment, 1000)]);
  json(res, 201, { ok: true });
});

// ---- WhatsApp webhook ---------------------------------------------------
// Callback URL to register in Meta: {PUBLIC_URL}/webhook  (also served at /api/webhook)
const waVerify = async (req, res, p, url) => {
  const r = wa.verifyHandshake(url.searchParams);
  if (!r.ok) { res.writeHead(403); return res.end('Forbidden'); }
  res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end(r.challenge);
};
const waReceive = async (req, res) => {
  const raw = await readRaw(req);
  if (!wa.signatureOk(raw, req.headers['x-hub-signature-256'])) return json(res, 401, { error: 'Invalid signature (set WHATSAPP_APP_SECRET)' });
  let body; try { body = JSON.parse(raw); } catch { return json(res, 400, { error: 'Invalid JSON' }); }
  // Process before replying: serverless functions are frozen once the response is sent. Always answer 200 so Meta does not retry-storm.
  const r = await wa.processWebhook(body, { base: publicUrl(req) });
  json(res, 200, { ok: true, ...r });
};
route('GET', '/webhook', waVerify); route('POST', '/webhook', waReceive);
route('GET', '/api/webhook', waVerify); route('POST', '/api/webhook', waReceive);

// ---- admin --------------------------------------------------------------
route('GET', '/api/admin/ping', (req, res) => json(res, 200, { ok: true }), true);
route('GET', '/api/admin/pulse', async (req, res) => json(res, 200, await db.get(
  `SELECT (SELECT COUNT(*) FROM orders WHERE status<>'awaiting_payment')::int o,
          (SELECT COUNT(*) FROM orders WHERE status IN ('new','preparing','ready'))::int oa,
          (SELECT COALESCE(MAX(EXTRACT(EPOCH FROM updated_at)),0) FROM orders)::float8 ou,
          (SELECT COUNT(*) FROM requests)::int r, (SELECT COUNT(*) FROM requests WHERE status='open')::int ro,
          (SELECT COUNT(*) FROM stays)::int s, (SELECT COUNT(*) FROM stays WHERE checkout_at IS NULL)::int so,
          (SELECT COUNT(*) FROM feedback)::int f, (SELECT value FROM settings WHERE key='version') v`)), true);

route('GET', '/api/admin/orders', async (req, res, p, url) => {
  const st = url.searchParams.get('status'), days = Math.min(parseInt(url.searchParams.get('days')) || 1, 365);
  json(res, 200, st === 'active'
    ? await db.all("SELECT * FROM orders WHERE status IN ('new','preparing','ready') ORDER BY id")
    : await db.all("SELECT * FROM orders WHERE status<>'awaiting_payment' AND created_at > now() - make_interval(days => $1::int) ORDER BY id DESC", [days]));
}, true);
route('PATCH', '/api/admin/orders/:id', async (req, res, p) => {
  const b = await readBody(req); const sets = []; const vals = [];
  if (['new', 'preparing', 'ready', 'delivered', 'cancelled'].includes(b.status)) { vals.push(b.status); sets.push(`status=$${vals.length}`); }
  if (['paid', 'unpaid'].includes(b.pay_status)) { vals.push(b.pay_status); sets.push(`pay_status=$${vals.length}`); }
  if (!sets.length) return json(res, 400, { error: 'Nothing to update' });
  vals.push(parseInt(p.id) || 0);
  await db.run(`UPDATE orders SET ${sets.join(',')}, updated_at=now() WHERE id=$${vals.length}`, vals);
  json(res, 200, { ok: true });
}, true);
route('GET', '/api/admin/orders/:id/invoice', async (req, res, p) => {
  const o = await db.get('SELECT * FROM orders WHERE id=$1', [parseInt(p.id) || 0]);
  if (!o) return json(res, 404, { error: 'Not found' });
  json(res, 200, { html: renderInvoice(o, await getSettings()), mode: invoiceMode() });
}, true);

route('GET', '/api/admin/requests', async (req, res) =>
  json(res, 200, await db.all("SELECT * FROM requests WHERE status='open' OR created_at > now() - interval '1 day' ORDER BY (status='open') DESC, id DESC")), true);
route('PATCH', '/api/admin/requests/:id', async (req, res, p) => {
  await db.run("UPDATE requests SET status='done', done_at=now() WHERE id=$1", [parseInt(p.id) || 0]); json(res, 200, { ok: true });
}, true);

const menuVals = b => [b.kind === 'bar' ? 'bar' : 'food', clean(b.category, 60), clean(b.name, 100), clean(b.name_hi, 100), clean(b.name_ml, 100), clean(b.description, 300), Math.max(0, +b.price || 0), b.veg ? 1 : 0];
route('GET', '/api/admin/menu', async (req, res) => json(res, 200, await db.all('SELECT * FROM menu_items ORDER BY kind,sort,id')), true);
route('POST', '/api/admin/menu', async (req, res) => {
  const b = await readBody(req);
  if (!b.name || !b.category) return json(res, 400, { error: 'Name and category required' });
  const id = await db.insert('INSERT INTO menu_items(kind,category,name,name_hi,name_ml,description,price,veg,available) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)', [...menuVals(b), b.available === 0 ? 0 : 1]);
  await db.bump(); json(res, 201, { id });
}, true);
route('PUT', '/api/admin/menu/:id', async (req, res, p) => {
  const b = await readBody(req);
  await db.run('UPDATE menu_items SET kind=$1,category=$2,name=$3,name_hi=$4,name_ml=$5,description=$6,price=$7,veg=$8,available=$9 WHERE id=$10', [...menuVals(b), b.available ? 1 : 0, parseInt(p.id) || 0]);
  await db.bump(); json(res, 200, { ok: true });
}, true);
route('DELETE', '/api/admin/menu/:id', async (req, res, p) => { await db.run('DELETE FROM menu_items WHERE id=$1', [parseInt(p.id) || 0]); await db.bump(); json(res, 200, { ok: true }); }, true);
route('POST', '/api/admin/menu/import', async (req, res) => {
  const b = await readBody(req);
  if (!Array.isArray(b.items)) return json(res, 400, { error: 'items[] required' });
  if (b.replace) await db.run('DELETE FROM menu_items');
  for (let i = 0; i < b.items.length; i++) {
    const x = b.items[i];
    await db.run('INSERT INTO menu_items(kind,category,name,name_hi,name_ml,description,price,veg,sort) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)', [...menuVals({ ...x, veg: !(x.veg === 0 || x.veg === false) }), i]);
  }
  await db.bump(); json(res, 200, { imported: b.items.length });
}, true);

route('GET', '/api/admin/stays', async (req, res) => {
  const rows = await db.all("SELECT * FROM stays WHERE checkout_at IS NULL OR checkout_at > now() - interval '7 days' ORDER BY (checkout_at IS NULL) DESC, id DESC");
  const s = await getSettings(), base = publicUrl(req);
  json(res, 200, rows.map(r => ({ ...r, wa_link: r.checkout_at ? waLink(r.phone, `Thank you for staying with ${s.resort_name}, ${r.guest_name}! We would love your feedback (takes 30 seconds): ${base}/feedback.html?t=${r.feedback_token}`) : null })));
}, true);
route('POST', '/api/admin/stays', async (req, res) => {
  const b = await readBody(req);
  const room = clean(b.room, 20).trim(), name = clean(b.guest_name, 80).trim();
  if (!room || !name) return json(res, 400, { error: 'Room and guest name required' });
  const when = d => { const t = d ? new Date(d) : null; return t && !isNaN(t) ? t.toISOString() : null; };
  try {
    const id = await db.insert('INSERT INTO stays(room,guest_name,phone,checkin_at,expected_checkout_at,feedback_token) VALUES($1,$2,$3,$4,$5,$6)',
      [room, name, clean(b.phone, 20), when(b.checkin_at) || new Date().toISOString(), when(b.expected_checkout_at), crypto.randomBytes(12).toString('hex')]);
    json(res, 201, { id });
  } catch (e) {
    if (e.code === '23505') return json(res, 409, { error: `Room ${room} already has an active check-in` });
    throw e;
  }
}, true);
route('POST', '/api/admin/stays/:id/checkout', async (req, res, p) => {
  const id = parseInt(p.id) || 0;
  await db.run('UPDATE stays SET checkout_at=now() WHERE id=$1 AND checkout_at IS NULL', [id]);
  const st = await db.get('SELECT * FROM stays WHERE id=$1', [id]);
  if (!st) return json(res, 404, { error: 'Not found' });
  const s = await getSettings(), link = `${publicUrl(req)}/feedback.html?t=${st.feedback_token}`;
  let sent = { ok: false, error: 'No phone number on this stay' };
  if (st.phone) sent = await wa.sendFeedbackRequest(st, s.resort_name, link);
  if (sent.ok) await db.run('UPDATE stays SET feedback_sent=1 WHERE id=$1', [id]);
  json(res, 200, { ok: true, whatsapp_sent: sent.ok, whatsapp_error: sent.ok ? null : sent.error,
    wa_link: st.phone ? waLink(st.phone, `Thank you for staying with ${s.resort_name}, ${st.guest_name}! We would love your feedback (takes 30 seconds): ${link}`) : null });
}, true);
route('POST', '/api/admin/stays/:id/feedback-sent', async (req, res, p) => { await db.run('UPDATE stays SET feedback_sent=1 WHERE id=$1', [parseInt(p.id) || 0]); json(res, 200, { ok: true }); }, true);
route('GET', '/api/admin/stays/:id/bill', async (req, res, p) => {
  const st = await db.get('SELECT * FROM stays WHERE id=$1', [parseInt(p.id) || 0]);
  if (!st) return json(res, 404, { error: 'Not found' });
  const orders = await db.all("SELECT * FROM orders WHERE room=$1 AND status NOT IN ('cancelled','awaiting_payment') AND created_at >= $2::timestamptz AND ($3::timestamptz IS NULL OR created_at <= $3::timestamptz) ORDER BY id",
    [st.room, st.checkin_at, st.checkout_at]);
  json(res, 200, { stay: st, orders, total: orders.reduce((a, o) => a + o.total, 0), unpaid: orders.filter(o => o.pay_status !== 'paid').reduce((a, o) => a + o.total, 0) });
}, true);

route('GET', '/api/admin/feedback', async (req, res) => json(res, 200, {
  rows: await db.all('SELECT * FROM feedback ORDER BY id DESC LIMIT 500'),
  avg: await db.get('SELECT AVG(rating)::float8 r, AVG(food)::float8 f, AVG(cleanliness)::float8 c, AVG(service)::float8 s, COUNT(*)::int n FROM feedback')
}), true);

route('GET', '/api/admin/reports', async (req, res, p, url) => {
  const days = Math.min(parseInt(url.searchParams.get('days')) || 7, 365);
  const valid = "status NOT IN ('cancelled','awaiting_payment') AND created_at > now() - make_interval(days => $1::int)";
  const totals = await db.get(`SELECT COUNT(*)::int orders, COALESCE(SUM(total),0)::float8 revenue, COALESCE(SUM(total) FILTER (WHERE pay_status='paid'),0)::float8 paid FROM orders WHERE ${valid}`, [days]);
  const daily = await db.all(`SELECT to_char(created_at AT TIME ZONE 'Asia/Kolkata','YYYY-MM-DD') AS day, COUNT(*)::int orders, SUM(total)::float8 revenue FROM orders WHERE ${valid} GROUP BY 1 ORDER BY 1`, [days]);
  const byMethod = await db.all(`SELECT pay_method, COUNT(*)::int orders, SUM(total)::float8 revenue FROM orders WHERE ${valid} GROUP BY pay_method`, [days]);
  const tally = {};
  for (const o of await db.all(`SELECT items FROM orders WHERE ${valid}`, [days]))
    for (const i of o.items) { tally[i.name] ??= { name: i.name, qty: 0, revenue: 0 }; tally[i.name].qty += i.qty; tally[i.name].revenue += i.qty * i.price; }
  json(res, 200, { days, totals, daily, byMethod, top: Object.values(tally).sort((a, b) => b.qty - a.qty).slice(0, 10) });
}, true);

route('GET', '/api/admin/settings', async (req, res) => json(res, 200, await getSettings()), true);
route('PUT', '/api/admin/settings', async (req, res) => {
  const b = await readBody(req);
  for (const k of Object.keys(DEFAULTS)) if (k in b)
    await db.run('INSERT INTO settings(key,value) VALUES($1,$2) ON CONFLICT (key) DO UPDATE SET value=excluded.value', [k, typeof b[k] === 'string' ? b[k] : JSON.stringify(b[k])]);
  await db.bump(); json(res, 200, { ok: true });
}, true);

// WhatsApp setup status + test send (never returns the access token)
route('GET', '/api/admin/whatsapp', async (req, res) => {
  const e = wa.env();
  json(res, 200, { configured: wa.configured(), phone_number_id: e.phoneId || null, business_account_id: e.wabaId || null, display_number: E('WHATSAPP_DISPLAY_NUMBER') || null,
    webhook_url: publicUrl(req) + '/webhook', verify_token: e.verify || null, app_secret_set: !!e.secret, template: E('WHATSAPP_TEMPLATE') || null,
    razorpay: !!(E('RAZORPAY_KEY_ID') && E('RAZORPAY_KEY_SECRET')), razorpay_webhook_secret_set: !!E('RAZORPAY_WEBHOOK_SECRET'), invoice_mode: invoiceMode(), database: db.kind() });
}, true);
route('POST', '/api/admin/whatsapp/test', async (req, res) => {
  const b = await readBody(req);
  const r = b.template ? await wa.sendTemplate(b.to, b.template, b.lang || 'en') : await wa.sendText(b.to, clean(b.text || 'Test message from the Haritha Resort app ✅', 500));
  json(res, r.ok ? 200 : 502, r);
}, true);

// ---- entry --------------------------------------------------------------
async function handler(req, res) {
  try {
    const url = new URL(req.url, 'http://x');
    // On Vercel, rewrites send everything to /api/index?__path=<original path>
    const pathname = url.searchParams.get('__path') || url.pathname;
    url.searchParams.delete('__path');
    for (const r of routes) {
      if (r.method !== req.method) continue;
      const m = pathname.match(r.re);
      if (!m) continue;
      if (r.admin) { const bad = await adminCheck(req); if (bad) return json(res, bad.code, { error: bad.error }); }
      return await r.handler(req, res, m.groups || {}, url);
    }
    json(res, 404, { error: 'Not found' });
  } catch (e) {
    console.error(e);
    if (!res.headersSent) json(res, e.status || 500, { error: e.status ? e.message : 'Server error' });
  }
}
module.exports = { handler };
