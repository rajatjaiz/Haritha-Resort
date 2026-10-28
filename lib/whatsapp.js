// WhatsApp Cloud API: outbound sending, webhook verification, and the guest-message bot.
const crypto = require('node:crypto');
const db = require('./db');

const GRAPH = process.env.WHATSAPP_GRAPH_URL || `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || 'v25.0'}`;
const env = () => ({
  token: process.env.WHATSAPP_ACCESS_TOKEN,
  phoneId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  wabaId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
  verify: process.env.WHATSAPP_VERIFY_TOKEN,
  secret: process.env.WHATSAPP_APP_SECRET
});
const configured = () => { const e = env(); return !!(e.token && e.phoneId); };
const digits = s => String(s || '').replace(/\D/g, '');

// ---- outbound -----------------------------------------------------------
// POST {GRAPH}/{phone-number-id}/messages. Returns { ok, status, id?, error? }; never throws.
async function send(to, payload) {
  const e = env();
  if (!e.token || !e.phoneId) return { ok: false, error: 'WhatsApp is not configured (WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID)' };
  const num = digits(to);
  if (num.length < 8) return { ok: false, error: 'Invalid phone number' };
  try {
    const r = await fetch(`${GRAPH}/${e.phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${e.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to: num, ...payload }),
      signal: AbortSignal.timeout(10000)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, status: r.status, error: j.error?.message || `HTTP ${r.status}`, code: j.error?.code };
    return { ok: true, status: r.status, id: j.messages?.[0]?.id };
  } catch (err) { return { ok: false, error: err.message }; }
}
const sendText = (to, body) => send(to, { type: 'text', text: { body: String(body).slice(0, 4000), preview_url: true } });
const sendTemplate = (to, name, lang, params = []) => send(to, {
  type: 'template',
  template: { name, language: { code: lang || 'en' }, ...(params.length ? { components: [{ type: 'body', parameters: params.map(p => ({ type: 'text', text: String(p).slice(0, 1000) })) }] } : {}) }
});
const sendList = (to, body, button, rows) => send(to, {
  type: 'interactive',
  interactive: { type: 'list', body: { text: body.slice(0, 1024) }, action: { button: button.slice(0, 20), sections: [{ title: 'Options', rows: rows.map(r => ({ id: r[0], title: r[1].slice(0, 24), ...(r[2] ? { description: r[2].slice(0, 72) } : {}) })) }] } }
});

// Post-checkout feedback request. Business-initiated messages outside the 24h window must be an approved template
// (WHATSAPP_TEMPLATE with two body variables: guest name, feedback link).
async function sendFeedbackRequest(stay, resortName, link) {
  const tpl = process.env.WHATSAPP_TEMPLATE;
  if (tpl) return sendTemplate(stay.phone, tpl, process.env.WHATSAPP_TEMPLATE_LANG || 'en', [stay.guest_name, link]);
  return sendText(stay.phone, `Thank you for staying with ${resortName}, ${stay.guest_name}! We would love your feedback (takes 30 seconds): ${link}`);
}

// ---- webhook ------------------------------------------------------------
// GET /webhook?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
function verifyHandshake(q) {
  const { verify } = env();
  const a = Buffer.from(String(q.get('hub.verify_token') || '')), b = Buffer.from(verify || '');
  if (verify && q.get('hub.mode') === 'subscribe' && a.length === b.length && crypto.timingSafeEqual(a, b)) return { ok: true, challenge: q.get('hub.challenge') || '' };
  return { ok: false };
}
// X-Hub-Signature-256 = "sha256=" + HMAC_SHA256(raw body, app secret)
function signatureOk(raw, header) {
  const { secret } = env();
  if (!secret) return process.env.WHATSAPP_SKIP_SIGNATURE === '1';
  const want = 'sha256=' + crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const got = String(header || '');
  return got.length === want.length && crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want));
}
// Flatten Meta's entry[].changes[].value payload into plain messages.
function parseWebhook(body) {
  const out = { messages: [], statuses: [] };
  for (const en of body?.entry || []) for (const ch of en.changes || []) {
    const v = ch.value || {}; const names = {};
    for (const c of v.contacts || []) names[c.wa_id] = c.profile?.name;
    for (const m of v.messages || []) {
      const text = m.type === 'text' ? m.text?.body
        : m.type === 'interactive' ? (m.interactive?.list_reply?.id || m.interactive?.button_reply?.id)
        : m.type === 'button' ? m.button?.payload || m.button?.text : null;
      out.messages.push({ id: m.id, from: m.from, type: m.type, text: (text || '').trim(), name: names[m.from] });
    }
    for (const s of v.statuses || []) out.statuses.push(s);
  }
  return out;
}

// ---- bot ----------------------------------------------------------------
const SERVICES = { reception: 'Reception', housekeeping: 'Housekeeping', towels: 'Extra towels', water: 'Drinking water', laundry: 'Laundry', taxi: 'Taxi / transport', maintenance: 'Maintenance' };
const MENU_ROWS = [
  ['order', 'Order food', 'Open the menu and order to your room'], ['status', 'My order status', 'Track your latest food order'],
  ['wifi', 'Wi-Fi details', 'Network name and password'], ['bill', 'My food bill', 'Food orders for this stay'],
  ['reception', 'Call reception', 'Staff will contact you'], ['housekeeping', 'Housekeeping', 'Room cleaning'],
  ['towels', 'Extra towels', ''], ['water', 'Drinking water', ''], ['laundry', 'Laundry', ''], ['taxi', 'Taxi / transport', '']
];
const money = n => '₹' + (Math.round(n * 100) / 100).toLocaleString('en-IN');

function intent(text) {
  const t = text.toLowerCase();
  if (/^(order|food|menu|hungry|eat)\b/.test(t) || /\b(order food|menu)\b/.test(t)) return 'order';
  if (/\b(wifi|wi-fi|wi fi|internet|password)\b/.test(t)) return 'wifi';
  if (/\b(status|track|where.*(order|food))\b/.test(t)) return 'status';
  if (/\b(bill|invoice|charges)\b/.test(t)) return 'bill';
  if (/\b(towel|towels)\b/.test(t)) return 'towels';
  if (/\b(water|drinking water)\b/.test(t)) return 'water';
  if (/\b(housekeeping|clean|cleaning|room service)\b/.test(t)) return 'housekeeping';
  if (/\b(laundry|iron|washing)\b/.test(t)) return 'laundry';
  if (/\b(taxi|cab|transport|pickup)\b/.test(t)) return 'taxi';
  if (/\b(maintenance|repair|ac not|not working|leak)\b/.test(t)) return 'maintenance';
  if (/\b(reception|front desk|manager|call me)\b/.test(t)) return 'reception';
  if (/^(hi|hello|hey|hii|namaste|help|start|options|0)\b/.test(t)) return 'hello';
  return null;
}

async function stayByPhone(from) {
  const d = digits(from).slice(-10);
  return db.get("SELECT * FROM stays WHERE checkout_at IS NULL AND right(regexp_replace(coalesce(phone,''),'\\D','','g'),10)=$1 ORDER BY id DESC LIMIT 1", [d]);
}

// Handle one inbound message from a guest.
async function handleMessage(m, opts = {}) {
  const reply = t => sendText(m.from, t);
  const s = Object.fromEntries((await db.all('SELECT key,value FROM settings')).map(r => [r.key, r.value]));
  const base = String(opts.base || process.env.PUBLIC_URL || '').replace(/\/$/, '');
  const stay = await stayByPhone(m.from);
  const cmd = intent(m.text) || (m.text ? null : 'hello');

  if (!stay) {
    // Never reveal guest-only info (Wi-Fi, orders) or create staff requests for numbers that are not checked in.
    const phone = s.reception_phone ? ` You can also call reception on ${s.reception_phone}.` : '';
    return reply(`Welcome to ${s.resort_name}! 🌴 To order food, get the Wi-Fi password or call staff, please scan the QR code in your room, or ask reception to link this WhatsApp number to your stay.${phone}`);
  }
  if (cmd === 'hello' || cmd === null && !m.text) {
    return sendList(m.from, `Hi ${stay.guest_name}! 👋 You are in Room ${stay.room} at ${s.resort_name}. How can we help?`, 'Choose option', MENU_ROWS);
  }
  if (cmd === 'order') return reply(`🍽️ Order food to Room ${stay.room}: ${base}/?room=${encodeURIComponent(stay.room)}\nRestaurant hours: ${s.restaurant_hours}.`);
  if (cmd === 'wifi') return reply(`📶 Wi-Fi: ${s.wifi_name}\nPassword: ${s.wifi_password}`);
  if (cmd === 'status') {
    const o = await db.get("SELECT * FROM orders WHERE room=$1 AND status<>'awaiting_payment' AND created_at>=$2 ORDER BY id DESC LIMIT 1", [stay.room, stay.checkin_at]);
    if (!o) return reply('You have no food orders yet. Reply *menu* to order.');
    const label = { new: 'received by the kitchen', preparing: 'being prepared', ready: 'on its way to you', delivered: 'delivered', cancelled: 'cancelled' }[o.status] || o.status;
    return reply(`Order #${o.id} (${money(o.total)}) is ${label}.`);
  }
  if (cmd === 'bill') {
    const rows = await db.all("SELECT total, pay_status FROM orders WHERE room=$1 AND status NOT IN ('cancelled','awaiting_payment') AND created_at>=$2", [stay.room, stay.checkin_at]);
    const tot = rows.reduce((a, r) => a + r.total, 0), due = rows.filter(r => r.pay_status !== 'paid').reduce((a, r) => a + r.total, 0);
    return reply(`🧾 Food orders this stay: ${rows.length}\nTotal ${money(tot)} · Due at check-out ${money(due)}`);
  }
  // Staff requests: known service keywords, or free text forwarded to reception.
  const type = SERVICES[cmd] ? cmd : 'other';
  const detail = type === 'other' ? m.text.slice(0, 300) : 'via WhatsApp';
  const open = await db.get("SELECT id FROM requests WHERE room=$1 AND type=$2 AND status='open'", [stay.room, type]);
  if (!open) { await db.run("INSERT INTO requests(room,type,detail,source) VALUES($1,$2,$3,'whatsapp')", [stay.room, type, detail]); }
  return reply(open ? 'We already have this request open — our staff have been notified. 🙏'
    : type === 'other' ? '✅ Your message has been passed to reception. We will get back to you shortly.' : `✅ ${SERVICES[type]} requested for Room ${stay.room}. Staff will reach you shortly.`);
}

// Process a verified POST body. Dedupes retried deliveries by message id. Never throws.
async function processWebhook(body, opts = {}) {
  const { messages, statuses } = parseWebhook(body);
  for (const st of statuses) if (st.status === 'failed') console.error('WhatsApp delivery failed', st.recipient_id, JSON.stringify(st.errors));
  let handled = 0;
  for (const m of messages) {
    try {
      if (Math.random() < 0.02) await db.run("DELETE FROM wa_seen WHERE at < now() - interval '7 days'");
      const fresh = await db.get('INSERT INTO wa_seen(id) VALUES($1) ON CONFLICT (id) DO NOTHING RETURNING id', [m.id]);
      if (!fresh) continue;
      await handleMessage(m, opts); handled++;
    } catch (e) { console.error('WhatsApp message error', e); }
  }
  return { received: messages.length, handled };
}

module.exports = { env, configured, send, sendText, sendTemplate, sendList, sendFeedbackRequest, verifyHandshake, signatureOk, parseWebhook, processWebhook, handleMessage, intent, GRAPH };
