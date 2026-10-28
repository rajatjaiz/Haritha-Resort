const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let pin=sessionStorage.getItem('pin')||'', tab=sessionStorage.getItem('atab')||'orders', sound=true;
const money=n=>'₹'+(Math.round(n*100)/100).toLocaleString('en-IN'), utc=s=>new Date(s.includes('T')?s:s.replace(' ','T')+'Z'), ago=s=>{const m=Math.floor((Date.now()-utc(s))/60000);return m<1?'just now':m<60?m+' min ago':Math.floor(m/60)+'h '+m%60+'m ago'};
const api=async(u,method='GET',body)=>{const r=await fetch(u,{method,headers:{'Content-Type':'application/json','x-admin-pin':(pin||'').trim()},body:body?JSON.stringify(body):undefined});const j=await r.json().catch(()=>({}));if(r.status===401){login();throw new Error('auth')}if(!r.ok)throw new Error(j.error||'Error');return j};
function beep(){ if(!sound) return; try{const a=new (window.AudioContext||webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=880;g.gain.value=.2;o.start();setTimeout(()=>{o.frequency.value=660},180);setTimeout(()=>{o.stop();a.close()},450);}catch{} }
$('#snd').onclick=()=>{sound=!sound;$('#snd').textContent=sound?'🔔 Sound on':'🔕 Sound off';beep()};
function login(){
  if($('#live')) $('#live').textContent='Staff portal · please login';
  $('#m').innerHTML=`<div class="card" style="max-width:340px;margin:40px auto"><h3>Staff login</h3><label>Admin PIN</label><div style="margin:8px 0"><input id="p" type="text" inputmode="numeric" value="1234" autofocus style="font-size:20px;letter-spacing:2px;text-align:center;font-weight:600"></div><button class="big" id="go" style="margin-top:8px">Login</button><p id="le" class="muted" style="color:var(--r,#e11d48);margin-top:8px;text-align:center"></p></div>`;
  const go=async()=>{
    pin=($('#p').value||'1234').trim();
    const btn=$('#go'); if(btn){ btn.disabled=true; btn.textContent='Logging in…'; }
    try{
      await api('/api/admin/ping');
      sessionStorage.setItem('pin',pin);
      start();
    }catch(e){
      if(btn){ btn.disabled=false; btn.textContent='Login'; }
      $('#le').textContent=e.message==='auth'?'Wrong PIN (configured ADMIN_PIN)':(e.message||'Login failed');
    }
  };
  $('#go').onclick=go;
  $('#p').onkeydown=e=>e.key==='Enter'&&go();
}
const TABS=[['orders','🍳 Kitchen'],['requests','🛎️ Requests'],['stays','🛏️ Check-ins'],['menu','📖 Menu'],['feedback','⭐ Feedback'],['reports','📊 Reports'],['qr','🔳 Room QR'],['settings','⚙️ Settings']];
let counts={orders:0,requests:0};
function shell(){ $('#m').innerHTML=`<div class="top">${TABS.map(([k,l])=>`<button data-t="${k}" class="${tab===k?'on':''}">${l}${counts[k]?` <b class="badge" style="position:static">${counts[k]}</b>`:''}</button>`).join('')}</div><div id="c"></div>`;
  $('.top').onclick=e=>{const b=e.target.closest('button');if(b){tab=b.dataset.t;sessionStorage.setItem('atab',tab);show()}} }
async function show(){ shell(); try{ await VIEW[tab](document.querySelector('#c')); }catch(e){ if(e.message!=='auth') console.error(e); } }
const pill=(c,t)=>`<span class="pill ${c}">${t}</span>`;
const VIEW={
async orders(c){
  const o=await api('/api/admin/orders?status=active'); counts.orders=o.length;
  const nxt={new:['preparing','Start preparing'],preparing:['ready','Ready to serve'],ready:['delivered','Delivered']};
  c.innerHTML=`<div class="cols">${o.map(x=>`<div class="card k ${x.status}"><div style="display:flex;justify-content:space-between"><b>Room ${esc(x.room)} · #${x.id}</b>${pill(x.status,x.status)}</div>
   <div class="muted">${esc(x.guest_name||'')} · ${ago(x.created_at)}</div><div style="margin:8px 0">${x.items.map(i=>`<div><b>${i.qty}×</b> ${esc(i.name)}</div>`).join('')}</div>${x.notes?`<div class="muted">📝 ${esc(x.notes)}</div>`:''}
   <div>${money(x.total)} · ${x.pay_status==='paid'?pill('ready','PAID '+x.pay_method):pill('new','Collect ('+x.pay_method+')')}</div>
   <div class="row">${nxt[x.status]?`<button data-a="s" data-id="${x.id}" data-v="${nxt[x.status][0]}">${nxt[x.status][1]}</button>`:''}${x.pay_status!=='paid'?`<button class="alt" data-a="p" data-id="${x.id}">Mark paid</button>`:''}<button class="alt" data-a="r" data-id="${x.id}">Receipt</button><button class="warn" data-a="s" data-id="${x.id}" data-v="cancelled">Cancel</button></div></div>`).join('')||'<div class="card muted">No active orders 🎉</div>'}</div>
   <h3>Today’s completed</h3><div class="card" id="done"></div>`;
  c.onclick=async e=>{const b=e.target.closest('button[data-a]');if(!b)return;
    if(b.dataset.a==='r'){const w=window.open('','_blank');try{const r=await api('/api/admin/orders/'+b.dataset.id+'/invoice');w.document.write(r.html);w.document.close()}catch(err){w.close();alert(err.message)}return}
    await api('/api/admin/orders/'+b.dataset.id,'PATCH',b.dataset.a==='s'?{status:b.dataset.v}:{pay_status:'paid'});show()};
  const all=await api('/api/admin/orders?days=1'); c.querySelector('#done').innerHTML=`<table>${all.filter(x=>['delivered','cancelled'].includes(x.status)).map(x=>`<tr><td>#${x.id}</td><td>Room ${esc(x.room)}</td><td>${x.items.map(i=>i.qty+'× '+esc(i.name)).join(', ')}</td><td>${money(x.total)}</td><td>${pill(x.status,x.status)} ${x.pay_status==='paid'?pill('ready','paid'):''}</td><td><button class="alt" data-a="r" data-id="${x.id}">Receipt</button></td></tr>`).join('')||'<tr><td class="muted">None yet</td></tr>'}</table>`;
},
async requests(c){
  const r=await api('/api/admin/requests'); counts.requests=r.filter(x=>x.status==='open').length;
  c.innerHTML=`<div class="cols">${r.map(x=>`<div class="card ${x.status==='open'?'k rq':''}"><b>Room ${esc(x.room)}</b> ${pill(x.status==='open'?'new':'done',x.status)}<div style="font-size:18px;margin:6px 0">${esc(x.type)}</div><div class="muted">${esc(x.detail||'')} ${ago(x.created_at)}</div>${x.status==='open'?`<div class="row"><button data-id="${x.id}">Mark done</button></div>`:''}</div>`).join('')||'<div class="card muted">No requests</div>'}</div>`;
  c.onclick=async e=>{const b=e.target.closest('button[data-id]');if(b){await api('/api/admin/requests/'+b.dataset.id,'PATCH');show()}};
},
async stays(c){
  const s=await api('/api/admin/stays');
  c.innerHTML=`<div class="card"><h3>Check in a guest</h3><div class="grid"><div><label>Room</label><input id="r"></div><div><label>Guest name</label><input id="n"></div><div><label>WhatsApp number (with country code, e.g. 919876543210)</label><input id="ph" inputmode="tel"></div><div><label>Expected check-out</label><input id="co" type="datetime-local"></div></div><br><button id="ci">Check in</button> <span id="er" class="muted"></span></div>
  <div class="card"><h3>In-house &amp; recent</h3><table><tr><th>Room</th><th>Guest</th><th>Checked in</th><th>Running</th><th></th></tr>${s.map(x=>`<tr><td>${esc(x.room)}</td><td>${esc(x.guest_name)}<br><span class="muted">${esc(x.phone||'')}</span></td><td>${utc(x.checkin_at).toLocaleString()}</td>
  <td>${x.checkout_at?pill('done','checked out '+utc(x.checkout_at).toLocaleString()):pill('ready','in house · '+Math.floor((Date.now()-utc(x.checkin_at))/3600000)+'h')}</td>
  <td>${!x.checkout_at?`<button data-co="${x.id}">Check out + send feedback</button>`:''} <button class="alt" data-bill="${x.id}">Bill</button>${x.checkout_at&&x.phone&&x.wa_link?` <a class="btn alt" target="_blank" href="${x.wa_link}" data-sent="${x.id}">${x.feedback_sent?'Resend':'Send'} WhatsApp</a>`:''}</td></tr>`).join('')}</table></div><div id="bill"></div>`;
  $('#ci').onclick=async()=>{try{const co=$('#co').value;await api('/api/admin/stays','POST',{room:$('#r').value,guest_name:$('#n').value,phone:$('#ph').value,expected_checkout_at:co?new Date(co).toISOString():null});show()}catch(e){$('#er').textContent=e.message}};
  c.onclick=async e=>{
    const co=e.target.closest('[data-co]'); if(co){ if(!confirm('Check out this guest?'))return; const r=await api(`/api/admin/stays/${co.dataset.co}/checkout`,'POST'); if(!r.whatsapp_sent&&r.wa_link){ if(r.whatsapp_error&&!/not configured|No phone/.test(r.whatsapp_error)) alert('WhatsApp API said: '+r.whatsapp_error+'\nOpening WhatsApp so you can send the message manually.'); window.open(r.wa_link,'_blank'); await api(`/api/admin/stays/${co.dataset.co}/feedback-sent`,'POST'); } show(); return; }
    const sn=e.target.closest('[data-sent]'); if(sn){ api(`/api/admin/stays/${sn.dataset.sent}/feedback-sent`,'POST'); return; }
    const bl=e.target.closest('[data-bill]'); if(bl){ const b=await api(`/api/admin/stays/${bl.dataset.bill}/bill`);
      $('#bill').innerHTML=`<div class="card"><h3>Food bill · Room ${esc(b.stay.room)} · ${esc(b.stay.guest_name)}</h3><table>${b.orders.map(o=>`<tr><td>#${o.id}</td><td>${o.items.map(i=>i.qty+'× '+esc(i.name)).join(', ')}</td><td>${money(o.subtotal)} + GST ${money(o.tax)}</td><td><b>${money(o.total)}</b></td><td>${o.pay_status==='paid'?'paid':'<b>due</b>'}</td></tr>`).join('')||'<tr><td>No orders</td></tr>'}</table><p><b>Total ${money(b.total)}</b> · Due at checkout: <b>${money(b.unpaid)}</b></p><button class="alt noprint" onclick="print()">Print</button></div>`; }
  };
},
async menu(c){
  const m=await api('/api/admin/menu'); const cats=[...new Set(m.map(x=>x.category))];
  c.innerHTML=`<div class="card"><h3>Add item</h3><div class="grid"><div><label>Name</label><input id="n"></div><div><label>Category</label><input id="cat" list="cl"><datalist id="cl">${cats.map(c=>`<option>${esc(c)}`).join('')}</datalist></div><div><label>Price ₹</label><input id="pr" type="number" min="0"></div><div><label>Type</label><select id="kd"><option value="food">Food (orderable)</option><option value="bar">Bar (view only)</option></select></div><div><label>हिन्दी name</label><input id="hi"></div><div><label>മലയാളം name</label><input id="ml"></div></div><label>Description</label><input id="ds"><label><input type="checkbox" id="vg" style="width:auto" checked> Vegetarian</label><button id="ad">Add</button></div>
  <div class="card"><h3>Bulk import (JSON array)</h3><textarea id="bulk" rows="4" placeholder='[{"category":"Breakfast","name":"Idli","price":60,"veg":1}]'></textarea><label><input type="checkbox" id="rep" style="width:auto"> Replace the entire existing menu</label><button class="alt" id="imp">Import</button></div>
  <div class="card"><table><tr><th>Item</th><th>Category</th><th>₹</th><th>Veg</th><th>Available</th><th></th></tr>${m.map(x=>`<tr data-id="${x.id}"><td><input value="${esc(x.name)}" data-f="name"><small class="muted">${x.kind}</small></td><td><input value="${esc(x.category)}" data-f="category"></td><td><input type="number" value="${x.price}" data-f="price" style="width:90px"></td><td><input type="checkbox" data-f="veg" ${x.veg?'checked':''} style="width:auto"></td><td><input type="checkbox" data-f="available" ${x.available?'checked':''} style="width:auto"></td><td><button data-save>Save</button> <button class="warn" data-del>✕</button></td></tr>`).join('')}</table></div>`;
  const byId=id=>m.find(x=>x.id==id);
  $('#ad').onclick=async()=>{await api('/api/admin/menu','POST',{name:$('#n').value,category:$('#cat').value,price:+$('#pr').value,kind:$('#kd').value,name_hi:$('#hi').value,name_ml:$('#ml').value,description:$('#ds').value,veg:$('#vg').checked});show()};
  $('#imp').onclick=async()=>{try{const r=await api('/api/admin/menu/import','POST',{items:JSON.parse($('#bulk').value),replace:$('#rep').checked});alert('Imported '+r.imported);show()}catch(e){alert(e.message)}};
  c.onclick=async e=>{const tr=e.target.closest('tr[data-id]');if(!tr)return;
    if(e.target.matches('[data-del]')){if(confirm('Delete item?')){await api('/api/admin/menu/'+tr.dataset.id,'DELETE');show()}return}
    if(e.target.matches('[data-save]')){const it={...byId(tr.dataset.id)};tr.querySelectorAll('[data-f]').forEach(i=>it[i.dataset.f]=i.type==='checkbox'?+i.checked:i.value);await api('/api/admin/menu/'+tr.dataset.id,'PUT',it);e.target.textContent='Saved ✓'}};
},
async feedback(c){
  const {rows,avg}=await api('/api/admin/feedback'); const f=n=>n?n.toFixed(1):'–';
  c.innerHTML=`<div class="card"><h3>Average (${avg.n} responses)</h3>Overall <b>${f(avg.r)}</b> · Food <b>${f(avg.f)}</b> · Cleanliness <b>${f(avg.c)}</b> · Service <b>${f(avg.s)}</b></div><div class="card"><table><tr><th>Date</th><th>Room</th><th>Guest</th><th>Overall</th><th>Food</th><th>Clean</th><th>Service</th><th>Comment</th></tr>${rows.map(x=>`<tr><td>${utc(x.created_at).toLocaleDateString()}</td><td>${esc(x.room)}</td><td>${esc(x.guest_name)}</td><td>${'★'.repeat(x.rating)}</td><td>${x.food||''}</td><td>${x.cleanliness||''}</td><td>${x.service||''}</td><td>${esc(x.comment)}</td></tr>`).join('')||'<tr><td colspan="8" class="muted">No feedback yet</td></tr>'}</table></div>`;
},
async reports(c){
  const d=+(sessionStorage.getItem('rd')||7), r=await api('/api/admin/reports?days='+d), max=Math.max(1,...r.daily.map(x=>x.revenue));
  c.innerHTML=`<div class="top">${[1,7,30,90].map(x=>`<button data-d="${x}" class="${x===d?'on':''}">${x===1?'Today':'Last '+x+' days'}</button>`).join('')}</div>
  <div class="grid"><div class="card"><div class="muted">Orders</div><big style="font-size:28px">${r.totals.orders}</big></div><div class="card"><div class="muted">Revenue (incl. GST)</div><big style="font-size:28px">${money(r.totals.revenue)}</big><div class="muted">Collected ${money(r.totals.paid)}</div></div></div>
  <div class="card"><h3>Daily revenue</h3>${r.daily.map(x=>`<div style="display:flex;gap:8px;align-items:center;margin:4px 0"><span style="width:90px">${x.day}</span><div class="bar" style="width:${x.revenue/max*60}%"></div><span>${money(x.revenue)} (${x.orders})</span></div>`).join('')||'<span class="muted">No data</span>'}</div>
  <div class="card"><h3>Top items</h3><table>${r.top.map(x=>`<tr><td>${esc(x.name)}</td><td>${x.qty} sold</td><td>${money(x.revenue)}</td></tr>`).join('')||'<tr><td class="muted">No data</td></tr>'}</table></div>
  <div class="card"><h3>By payment method</h3><table>${r.byMethod.map(x=>`<tr><td>${esc(x.pay_method)}</td><td>${x.orders} orders</td><td>${money(x.revenue)}</td></tr>`).join('')}</table></div>`;
  c.querySelector('.top').onclick=e=>{const b=e.target.closest('[data-d]');if(b){sessionStorage.setItem('rd',b.dataset.d);show()}};
},
async qr(c){
  c.innerHTML=`<div class="card noprint"><h3>Room QR codes</h3><label>Public website address (the address guests will reach this app on)</label><input id="base" value="${esc(localStorage.getItem('base')||location.origin)}"><label>Rooms (comma separated or ranges, e.g. 101-110, 201-210)</label><input id="rooms" value="${esc(localStorage.getItem('rooms')||'101-110')}"><br><br><button id="mk">Generate</button> <button class="alt" onclick="print()">Print</button></div><div class="qrs" id="grid"></div>`;
  if(!window.QRCode) await new Promise(r=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';s.onload=r;s.onerror=r;document.head.append(s)});
  const mk=()=>{const base=$('#base').value.replace(/\/$/,''),spec=$('#rooms').value;localStorage.setItem('base',base);localStorage.setItem('rooms',spec);const rooms=[];
    spec.split(',').map(s=>s.trim()).filter(Boolean).forEach(p=>{const m=p.match(/^(\d+)-(\d+)$/);if(m){for(let i=+m[1];i<=Math.min(+m[2],+m[1]+300);i++)rooms.push(String(i))}else rooms.push(p)});
    c.querySelector('#grid').innerHTML=rooms.map(r=>`<div class="qrc"><b>Haritha Beach Resort</b><div class="q" id="q${r}"></div><div style="font-size:20px;margin:6px 0"><b>Room ${esc(r)}</b></div><small>Scan to order food, get Wi-Fi &amp; call staff</small></div>`).join('');
    if(window.QRCode)rooms.forEach(r=>new QRCode(c.querySelector('#q'+r),{text:`${base}/?room=${encodeURIComponent(r)}`,width:150,height:150}));else c.querySelector('#grid').insertAdjacentHTML('afterbegin','<div class="card">QR library could not load (needs internet).</div>')};
  $('#mk').onclick=mk; mk();
},
async settings(c){
  const s=await api('/api/admin/settings'); const F=[['resort_name','Resort name'],['location','Location'],['tagline','Tagline'],['wifi_name','Wi-Fi name'],['wifi_password','Wi-Fi password'],['reception_phone','Reception phone'],['checkin_time','Check-in time'],['checkout_time','Check-out time'],['restaurant_hours','Restaurant hours'],['gst_percent','GST % on food'],['gstin','Resort GSTIN (printed on live invoices)'],['upi_id','UPI ID (e.g. resort@bank) — enables "Pay by UPI"'],['upi_name','UPI payee name']];
  c.innerHTML=`<div class="card">${F.map(([k,l])=>`<label>${l}</label><input data-k="${k}" value="${esc(s[k])}">`).join('')}<label><input type="checkbox" data-k="accept_cash" ${s.accept_cash==='1'?'checked':''} style="width:auto"> Allow “pay at room / add to bill”</label>
  <label>Guidelines (one per line)</label><textarea data-k="guidelines" rows="6">${esc(s.guidelines)}</textarea>
  <label>Nearby places (JSON: [{"name","note","dist"}])</label><textarea data-k="nearby" rows="6">${esc(JSON.stringify(JSON.parse(s.nearby),null,1))}</textarea>
  <label>Helplines (JSON: [{"name","number"}])</label><textarea data-k="helplines" rows="5">${esc(JSON.stringify(JSON.parse(s.helplines),null,1))}</textarea><br><button id="sv">Save settings</button> <span id="ok" class="muted"></span></div>
  <div class="card"><h3>WhatsApp &amp; payments status</h3><div id="wst" class="muted">Loading…</div><label>Send a test WhatsApp message to (with country code)</label><input id="wto" inputmode="tel" placeholder="919876543210"><br><br><button class="alt" id="wtest">Send test</button> <span id="wres" class="muted"></span></div>`;
  api('/api/admin/whatsapp').then(w=>{const y=v=>v?'✅':'❌';$('#wst').innerHTML=`${y(w.configured)} WhatsApp API configured (Phone Number ID ${esc(w.phone_number_id||'—')}${w.display_number?', '+esc(w.display_number):''})<br>${y(w.app_secret_set)} Webhook signature secret (WHATSAPP_APP_SECRET)<br>Webhook callback URL: <b>${esc(w.webhook_url)}</b><br>Webhook verify token: <b>${esc(w.verify_token||'(not set)')}</b><br>Feedback template: ${esc(w.template||'none (plain text; only works inside 24h window)')}<br>${y(w.razorpay)} Razorpay keys · ${y(w.razorpay_webhook_secret_set)} Razorpay webhook secret · Invoice mode: <b>${esc(w.invoice_mode)}</b><br>Database: ${esc(w.database)}`}).catch(()=>{});
  $('#wtest').onclick=async()=>{$('#wres').textContent='Sending…';try{const r=await api('/api/admin/whatsapp/test','POST',{to:$('#wto').value});$('#wres').textContent='Sent ✓'}catch(e){$('#wres').textContent='Failed: '+e.message}};
  $('#sv').onclick=async()=>{const b={};document.querySelectorAll('[data-k]').forEach(i=>b[i.dataset.k]=i.type==='checkbox'?(i.checked?'1':'0'):i.value);
    try{JSON.parse(b.nearby);JSON.parse(b.helplines)}catch{return alert('Nearby / Helplines must be valid JSON')}
    await api('/api/admin/settings','PUT',b);$('#ok').textContent='Saved ✓'};
}};
let last=null;
function start(){ show();
  const tick=async()=>{ if(document.hidden) return;
    try{ const p=await api('/api/admin/pulse'); $('#live').textContent='● live'; counts.orders=p.oa; counts.requests=p.ro;
      if(last){ if(p.o>last.o||p.r>last.r){ beep(); document.title='🔔 New! Haritha Admin'; setTimeout(()=>document.title='Haritha Admin',4000); }
        const changed=['o','oa','ou','r','ro','s','so','f','v'].some(k=>p[k]!==last[k]);
        if(changed && !document.activeElement?.closest('input,textarea,select') && !['menu','settings','qr'].includes(tab)) show(); }
      last=p;
    }catch(e){ if(e.message!=='auth') $('#live').textContent='reconnecting…'; } };
  setInterval(tick,4000); tick(); }
pin?api('/api/admin/ping').then(start).catch(login):login();
