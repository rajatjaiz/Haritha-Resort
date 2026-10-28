// Receipt / invoice HTML for an order. Seller details come from environment variables (see .env.example).
// INVOICE_MODE=test (default): merchant profile block + "TEST RECEIPT" marking, not a tax invoice.
// INVOICE_MODE=live: seller is the resort (name, address, GSTIN from Admin > Settings); no personal PAN is printed.
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inr = n => '₹' + (Math.round(n * 100) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function merchant() {
  const e = process.env;
  return { name: e.MERCHANT_NAME || '', type: e.MERCHANT_TYPE || '', pan: e.MERCHANT_PAN || '', category: e.MERCHANT_CATEGORY || '', address: e.MERCHANT_ADDRESS || '' };
}
const mode = () => (process.env.INVOICE_MODE || 'test').toLowerCase() === 'live' ? 'live' : 'test';

function renderInvoice(o, s) {
  const test = mode() === 'test', m = merchant();
  const seller = test
    ? `<b>${esc(m.name)}</b> (${esc(m.type)})<br>${esc(m.address)}<br>PAN: ${esc(m.pan)}<br>Category: ${esc(m.category)}`
    : `<b>${esc(s.resort_name)}</b><br>${esc(s.location)}<br>${s.gstin ? 'GSTIN: ' + esc(s.gstin) : ''}`;
  const half = o.tax / 2, pct = o.subtotal ? Math.round(o.tax / o.subtotal * 1000) / 10 : 0;
  const date = new Date(o.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  const payLine = o.pay_status === 'paid'
    ? `PAID via ${esc(o.pay_method)}${o.rzp_payment_id ? ' · Razorpay ref ' + esc(o.rzp_payment_id) : ''}`
    : `UNPAID · ${o.pay_method === 'room' ? 'to be added to room bill' : esc(o.pay_method)}`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${test ? 'Test receipt' : 'Invoice'} #${o.id}</title>
<style>body{font:14px/1.45 system-ui,sans-serif;max-width:720px;margin:24px auto;padding:0 16px;color:#111}h1{font-size:20px;margin:0}
table{width:100%;border-collapse:collapse;margin:14px 0}th,td{padding:6px;border-bottom:1px solid #ddd;text-align:left}td.r,th.r{text-align:right}
.box{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}.tag{display:inline-block;border:2px solid #c0392b;color:#c0392b;padding:2px 10px;font-weight:700;letter-spacing:1px}
.muted{color:#666;font-size:12px}@media print{button{display:none}}</style></head><body>
<div class="box"><div><h1>${test ? 'Test Receipt' : 'Invoice'} #${o.id}</h1><div class="muted">${esc(date)}</div></div>${test ? '<div><span class="tag">TEST · NOT A TAX INVOICE</span></div>' : ''}</div>
<div class="box" style="margin-top:14px"><div><div class="muted">Sold by</div>${seller}</div>
<div><div class="muted">Service location</div><b>${esc(s.resort_name)}</b><br>${esc(s.location)}<br>Room ${esc(o.room)}${o.guest_name ? ' · ' + esc(o.guest_name) : ''}</div></div>
<table><tr><th>Item</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr>
${o.items.map(i => `<tr><td>${esc(i.name)}</td><td class="r">${i.qty}</td><td class="r">${inr(i.price)}</td><td class="r">${inr(i.price * i.qty)}</td></tr>`).join('')}
<tr><td colspan="3" class="r">Subtotal</td><td class="r">${inr(o.subtotal)}</td></tr>
<tr><td colspan="3" class="r">CGST (${pct / 2}%)</td><td class="r">${inr(half)}</td></tr>
<tr><td colspan="3" class="r">SGST (${pct / 2}%)</td><td class="r">${inr(half)}</td></tr>
<tr><td colspan="3" class="r"><b>Total</b></td><td class="r"><b>${inr(o.total)}</b></td></tr></table>
<p><b>${payLine}</b></p>${o.notes ? `<p class="muted">Notes: ${esc(o.notes)}</p>` : ''}
<p class="muted">${test ? 'Generated in test mode for payment-flow testing only. Set INVOICE_MODE=live to issue resort invoices.' : 'Thank you for staying with us.'}</p>
<button onclick="print()">Print</button></body></html>`;
}
module.exports = { renderInvoice, merchant, mode };
