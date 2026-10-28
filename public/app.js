const T = {
 en:{home:'Home',menu:'Menu',cart:'Cart',help:'Services',info:'Info',room:'Room',welcome:'Welcome',checkedin:'Checked in',stay:'Stay so far',checkout:'Check-out',
  wifi:'Wi-Fi',pass:'Password',copy:'Copy',copied:'Copied',food:'Food',bar:'Bar',barnote:'Bar items cannot be ordered to the room. Please visit the bar counter.',
  add:'Add',soldout:'Sold out',empty:'Your cart is empty',subtotal:'Subtotal',gst:'GST',total:'Total',place:'Place order',notes:'Cooking notes (optional)',name:'Your name',
  payhow:'How would you like to pay?',payonline:'Pay online (UPI / Card / Wallet)',payupi:'Pay by UPI app',payroom:'Pay at room / add to bill',
  ordered:'Order placed!',track:'Track my orders',noorders:'No orders yet',new:'Received',preparing:'Preparing',ready:'On the way',delivered:'Delivered',cancelled:'Cancelled',paid:'Paid',unpaid:'Pay on delivery',
  reception:'Call Reception',housekeeping:'Housekeeping',towels:'Extra towels',laundry:'Laundry',taxi:'Taxi / transport',maintenance:'Maintenance',water:'Drinking water',other:'Other request',
  sent:'Request sent. Staff will reach you shortly.',already:'Already requested, staff has been notified.',myreq:'My requests',open:'Pending',done:'Done',
  guidelines:'Guidelines',nearby:'Nearby places',helplines:'Emergency & helplines',hours:'Restaurant hours',callus:'Call',noroom:'Enter your room number',go:'Continue',
  confirmpay:'Pay now',upiopen:'Open UPI app',upinote:'After paying, show the payment screen to the staff when the order arrives.',err:'Something went wrong, please try again.'},
 te:{home:'హోమ్',menu:'మెనూ',cart:'కార్ట్',help:'సేవలు',info:'సమాచారం',room:'గది',welcome:'స్వాగతం',checkedin:'చెక్-ఇన్',stay:'ఇప్పటివరకు బస',checkout:'చెక్-అవుట్',
  wifi:'వై-ఫై',pass:'పాస్‌వర్డ్',copy:'కాపీ',copied:'కాపీ అయింది',food:'ఆహారం',bar:'బార్',barnote:'బార్ ఐటమ్స్ గదికి ఆర్డర్ చేయలేరు. దయచేసి బార్ కౌంటర్‌కు రండి.',
  add:'జోడించు',soldout:'అయిపోయింది',empty:'కార్ట్ ఖాళీగా ఉంది',subtotal:'ఉప మొత్తం',gst:'జీఎస్టీ',total:'మొత్తం',place:'ఆర్డర్ చేయండి',notes:'వంట సూచనలు (ఐచ్ఛికం)',name:'మీ పేరు',
  payhow:'ఎలా చెల్లిస్తారు?',payonline:'ఆన్‌లైన్ (UPI / కార్డ్ / వాలెట్)',payupi:'UPI యాప్ ద్వారా',payroom:'గదిలో / బిల్లులో చేర్చండి',
  ordered:'ఆర్డర్ అందింది!',track:'నా ఆర్డర్లు',noorders:'ఆర్డర్లు లేవు',new:'అందింది',preparing:'తయారవుతోంది',ready:'వస్తోంది',delivered:'డెలివరీ అయింది',cancelled:'రద్దు',paid:'చెల్లించబడింది',unpaid:'డెలివరీ సమయంలో చెల్లింపు',
  reception:'రిసెప్షన్‌ను పిలవండి',housekeeping:'హౌస్‌కీపింగ్',towels:'అదనపు టవల్స్',laundry:'లాండ్రీ',taxi:'టాక్సీ',maintenance:'మరమ్మతు',water:'తాగునీరు',other:'ఇతర అభ్యర్థన',
  sent:'అభ్యర్థన పంపబడింది.',already:'ఇప్పటికే పంపబడింది.',myreq:'నా అభ్యర్థనలు',open:'పెండింగ్',done:'పూర్తి',
  guidelines:'మార్గదర్శకాలు',nearby:'సమీప ప్రదేశాలు',helplines:'అత్యవసర నంబర్లు',hours:'రెస్టారెంట్ సమయాలు',callus:'కాల్',noroom:'మీ గది నంబర్ ఇవ్వండి',go:'కొనసాగండి',
  confirmpay:'ఇప్పుడే చెల్లించు',upiopen:'UPI యాప్ తెరవండి',upinote:'చెల్లించిన తర్వాత సిబ్బందికి చూపించండి.',err:'ఏదో తప్పు జరిగింది.'},
 hi:{home:'होम',menu:'मेन्यू',cart:'कार्ट',help:'सेवाएँ',info:'जानकारी',room:'कमरा',welcome:'स्वागत है',checkedin:'चेक-इन',stay:'अब तक ठहराव',checkout:'चेक-आउट',
  wifi:'वाई-फाई',pass:'पासवर्ड',copy:'कॉपी',copied:'कॉपी हो गया',food:'खाना',bar:'बार',barnote:'बार आइटम कमरे में ऑर्डर नहीं किए जा सकते। कृपया बार काउंटर पर आएँ।',
  add:'जोड़ें',soldout:'उपलब्ध नहीं',empty:'कार्ट खाली है',subtotal:'उप-योग',gst:'जीएसटी',total:'कुल',place:'ऑर्डर करें',notes:'पकाने के निर्देश (वैकल्पिक)',name:'आपका नाम',
  payhow:'भुगतान कैसे करेंगे?',payonline:'ऑनलाइन (UPI / कार्ड / वॉलेट)',payupi:'UPI ऐप से',payroom:'कमरे में / बिल में जोड़ें',
  ordered:'ऑर्डर मिल गया!',track:'मेरे ऑर्डर',noorders:'कोई ऑर्डर नहीं',new:'प्राप्त',preparing:'बन रहा है',ready:'आ रहा है',delivered:'पहुँच गया',cancelled:'रद्द',paid:'भुगतान हुआ',unpaid:'डिलीवरी पर भुगतान',
  reception:'रिसेप्शन बुलाएँ',housekeeping:'हाउसकीपिंग',towels:'अतिरिक्त तौलिए',laundry:'लॉन्ड्री',taxi:'टैक्सी',maintenance:'मरम्मत',water:'पीने का पानी',other:'अन्य अनुरोध',
  sent:'अनुरोध भेज दिया गया।',already:'पहले से भेजा जा चुका है।',myreq:'मेरे अनुरोध',open:'लंबित',done:'पूरा',
  guidelines:'दिशानिर्देश',nearby:'आस-पास के स्थान',helplines:'आपातकालीन नंबर',hours:'रेस्तरां समय',callus:'कॉल',noroom:'अपना कमरा नंबर डालें',go:'आगे बढ़ें',
  confirmpay:'अभी भुगतान करें',upiopen:'UPI ऐप खोलें',upinote:'भुगतान के बाद स्टाफ को दिखाएँ।',err:'कुछ गलत हुआ।'},
 ml:{home:'ഹോം',menu:'മെനു',cart:'കാർട്ട്',help:'സേവനങ്ങൾ',info:'വിവരങ്ങൾ',room:'മുറി',welcome:'സ്വാഗതം',checkedin:'ചെക്ക്-ഇൻ',stay:'ഇതുവരെയുള്ള താമസം',checkout:'ചെക്ക്-ഔട്ട്',
  wifi:'വൈ-ഫൈ',pass:'പാസ്‌വേഡ്',copy:'പകർത്തുക',copied:'പകർത്തി',food:'ഭക്ഷണം',bar:'ബാർ',barnote:'ബാർ ഇനങ്ങൾ മുറിയിൽ ഓർഡർ ചെയ്യാനാവില്ല. ബാർ കൗണ്ടറിൽ വരൂ.',
  add:'ചേർക്കുക',soldout:'തീർന്നു',empty:'കാർട്ട് ശൂന്യമാണ്',subtotal:'ഉപമൊത്തം',gst:'ജിഎസ്ടി',total:'ആകെ',place:'ഓർഡർ ചെയ്യുക',notes:'പാചക നിർദ്ദേശം (ഓപ്ഷണൽ)',name:'നിങ്ങളുടെ പേര്',
  payhow:'എങ്ങനെ പണമടയ്ക്കും?',payonline:'ഓൺലൈൻ (UPI / കാർഡ്)',payupi:'UPI ആപ്പ്',payroom:'മുറിയിൽ / ബില്ലിൽ ചേർക്കുക',
  ordered:'ഓർഡർ ലഭിച്ചു!',track:'എന്റെ ഓർഡറുകൾ',noorders:'ഓർഡറുകളില്ല',new:'ലഭിച്ചു',preparing:'തയ്യാറാക്കുന്നു',ready:'വരുന്നു',delivered:'എത്തിച്ചു',cancelled:'റദ്ദാക്കി',paid:'അടച്ചു',unpaid:'ഡെലിവറിയിൽ അടയ്ക്കാം',
  reception:'റിസപ്ഷൻ വിളിക്കുക',housekeeping:'ഹൗസ്കീപ്പിംഗ്',towels:'അധിക ടവൽ',laundry:'അലക്ക്',taxi:'ടാക്സി',maintenance:'അറ്റകുറ്റപ്പണി',water:'കുടിവെള്ളം',other:'മറ്റ് അഭ്യർത്ഥന',
  sent:'അഭ്യർത്ഥന അയച്ചു.',already:'ഇതിനകം അയച്ചു.',myreq:'എന്റെ അഭ്യർത്ഥനകൾ',open:'തീർപ്പാക്കാനുണ്ട്',done:'പൂർത്തിയായി',
  guidelines:'മാർഗ്ഗനിർദ്ദേശങ്ങൾ',nearby:'സമീപ സ്ഥലങ്ങൾ',helplines:'അടിയന്തര നമ്പറുകൾ',hours:'റെസ്റ്റോറന്റ് സമയം',callus:'വിളിക്കുക',noroom:'മുറി നമ്പർ നൽകുക',go:'തുടരുക',
  confirmpay:'ഇപ്പോൾ അടയ്ക്കുക',upiopen:'UPI ആപ്പ് തുറക്കുക',upinote:'അടച്ച ശേഷം ജീവനക്കാരെ കാണിക്കുക.',err:'എന്തോ പിഴച്ചു.'}
};
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store = { get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}, set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}} };
const qp = new URLSearchParams(location.search);
if (qp.get('room')) store.set('room', qp.get('room'));
let st = { lang: store.get('lang','en'), room: store.get('room',''), tab:'home', cat:null, cfg:null, menu:[], cart:store.get('cart',{}), name:store.get('gname',''), orders:[], reqs:[], stay:null, pay:'room' };
const t = k => (T[st.lang]||T.en)[k] ?? T.en[k] ?? k;
const money = n => '₹' + (Math.round(n*100)/100).toLocaleString('en-IN');
const lname = m => (st.lang==='hi'&&m.name_hi)||(st.lang==='ml'&&m.name_ml)||m.name;
const api = async (u, o) => { const r = await fetch(u, o && {method:o.method||'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(o.body)}); const j = await r.json().catch(()=>({})); if(!r.ok) throw new Error(j.error||t('err')); return j; };
function toast(m){ const d=document.createElement('div'); d.className='toast'; d.textContent=m; document.body.append(d); setTimeout(()=>d.remove(),2600); }
const cartCount = () => Object.values(st.cart).reduce((a,b)=>a+b,0);

async function loadAll(){
  [st.cfg, st.menu] = await Promise.all([api('/api/config'), api('/api/menu')]);
  $('#rn').textContent = st.cfg.resort_name; $('#rl').textContent = st.cfg.tagline; document.title = st.cfg.resort_name;
  await refreshRoom(); render();
}
async function refreshRoom(){
  if(!st.room) return;
  const e = encodeURIComponent(st.room);
  [st.orders, st.reqs, st.stay] = await Promise.all([api(`/api/rooms/${e}/orders`), api(`/api/rooms/${e}/requests`), api(`/api/stay/${e}`)]);
}
function fmtDur(ms){ const m=Math.max(0,Math.floor(ms/60000)), d=Math.floor(m/1440), h=Math.floor(m%1440/60); return (d?d+'d ':'')+h+'h '+(m%60)+'m'; }
const utc = s => new Date(s.includes('T')?s:s.replace(' ','T')+'Z');

function renderTabs(){
  const tabs=[['home','🏠',t('home')],['menu','🍽️',t('menu')],['cart','🛒',t('cart')],['help','🛎️',t('help')],['info','ℹ️',t('info')]];
  $('#tabs').innerHTML = tabs.map(([k,i,l])=>`<button data-t="${k}" class="${st.tab===k?'on':''}"><span>${i}</span>${l}${k==='cart'&&cartCount()?`<b class="badge">${cartCount()}</b>`:''}</button>`).join('');
  $('#tabs').onclick = e => { const b=e.target.closest('button'); if(b){ st.tab=b.dataset.t; render(); scrollTo(0,0);} };
}
function roomGate(){
  $('#view').innerHTML = `<div class="card"><h3>${t('welcome')}</h3><label>${t('noroom')}</label><input id="rin" inputmode="numeric" autofocus><br><br><button class="big" id="rgo">${t('go')}</button></div>`;
  $('#rgo').onclick = async()=>{ const v=$('#rin').value.trim(); if(!v) return; st.room=v; store.set('room',v); await refreshRoom(); render(); };
}
function render(){
  renderTabs(); document.documentElement.lang = st.lang;
  if(!st.cfg) return;
  if(!st.room){ roomGate(); return; }
  ({home:vHome,menu:vMenu,cart:vCart,help:vHelp,info:vInfo})[st.tab]();
}
function vHome(){
  const s=st.stay, c=st.cfg;
  const stayHtml = s ? `<div class="hero"><small>${t('room')} ${esc(st.room)} · ${t('checkedin')}</small><big>${t('welcome')}, ${esc(s.guest_name)}</big>
     <div>${t('checkedin')}: ${utc(s.checkin_at).toLocaleString([], {dateStyle:'medium', timeStyle:'short'})}</div>
     <div>⏱ ${t('stay')}: <b id="run">${fmtDur(Date.now()-utc(s.checkin_at))}</b></div>
     <div>${t('checkout')}: ${s.expected_checkout_at?utc(s.expected_checkout_at).toLocaleString([], {dateStyle:'medium', timeStyle:'short'}):c.checkout_time}</div></div>`
   : `<div class="hero"><small>${t('room')} ${esc(st.room)}</small><big>${t('welcome')}</big><div>${t('checkout')}: ${esc(c.checkout_time)}</div></div>`;
  $('#view').innerHTML = stayHtml + `
   <div class="card"><h3>📶 ${t('wifi')}</h3><div class="muted">${esc(c.wifi_name)}</div><div class="wifi" id="wp">${esc(c.wifi_password)}</div> <button class="alt" id="cp">${t('copy')}</button></div>
   <div class="grid"><button id="gm">🍽️ ${t('menu')}</button><button class="amber" id="gr">🛎️ ${t('reception')}</button></div><br>
   <div class="card"><h3>${t('track')}</h3>${ordersHtml()}</div>
   <div class="card"><h3>${t('myreq')}</h3>${st.reqs.length?st.reqs.map(r=>`<div class="item"><div class="n">${t(r.type)}</div><span class="pill ${r.status}">${r.status==='open'?t('open'):t('done')}</span></div>`).join(''):`<span class="muted">—</span>`}</div>`;
  $('#cp').onclick = ()=>{ navigator.clipboard?.writeText(c.wifi_password); toast(t('copied')); };
  $('#gm').onclick = ()=>{ st.tab='menu'; render(); };
  $('#gr').onclick = ()=>sendReq('reception');
}
function ordersHtml(){
  if(!st.orders.length) return `<span class="muted">${t('noorders')}</span>`;
  return st.orders.map(o=>`<div class="item"><div class="n"><b>#${o.id} · ${money(o.total)}</b><span class="muted">${o.items.map(i=>`${i.qty}× ${esc(i.name)}`).join(', ')}</span></div>
    <div style="text-align:right"><span class="pill ${o.status}">${t(o.status)}</span><br><span class="muted">${o.pay_status==='paid'?t('paid'):t('unpaid')}</span></div></div>`).join('');
}
function vMenu(){
  const kind = st.kindTab||'food';
  const items = st.menu.filter(m=>m.kind===kind);
  const cats = [...new Set(items.map(m=>m.category))];
  if(!cats.includes(st.cat)) st.cat = null;
  const shown = items.filter(m=>!st.cat||m.category===st.cat);
  $('#view').innerHTML = `<div class="chips"><button data-k="food" class="${kind==='food'?'on':''}">🍽️ ${t('food')}</button><button data-k="bar" class="${kind==='bar'?'on':''}">🍺 ${t('bar')}</button></div>
   ${kind==='bar'?`<div class="card muted">🚫 ${t('barnote')}</div>`:''}
   <div class="chips"><button data-c="" class="${!st.cat?'on':''}">All</button>${cats.map(c=>`<button data-c="${esc(c)}" class="${st.cat===c?'on':''}">${esc(c)}</button>`).join('')}</div>
   <div class="card">${shown.map(m=>`<div class="item ${m.available?'':'sold'}"><span class="dot ${m.veg?'veg':'nv'}"></span><div class="n"><b>${esc(lname(m))}</b><span class="muted">${esc(m.description)}</span></div>
     ${m.price>0?`<span class="price">${money(m.price)}</span>`:''}
     ${kind==='food'?(m.available?qtyCtl(m.id):`<span class="pill cancelled">${t('soldout')}</span>`):''}</div>`).join('')}</div>`;
  $('#view').onclick = e => {
    const b=e.target.closest('button'); if(!b) return;
    if(b.dataset.k){ st.kindTab=b.dataset.k; st.cat=null; return vMenu(); }
    if('c' in b.dataset){ st.cat=b.dataset.c||null; return vMenu(); }
    if(b.dataset.q){ const id=b.dataset.id, d=+b.dataset.q; const n=(st.cart[id]||0)+d; if(n<=0) delete st.cart[id]; else st.cart[id]=n; store.set('cart',st.cart); renderTabs(); return vMenu(); }
  };
}
const qtyCtl = id => st.cart[id] ? `<div class="qty"><button data-q="-1" data-id="${id}">−</button><b>${st.cart[id]}</b><button data-q="1" data-id="${id}">+</button></div>` : `<button data-q="1" data-id="${id}">${t('add')}</button>`;
function totals(){ let sub=0; for(const [id,q] of Object.entries(st.cart)){ const m=st.menu.find(x=>x.id==id); if(m) sub+=m.price*q; } const tax=Math.round(sub*st.cfg.gst_percent)/100; return {sub,tax,total:Math.round((sub+tax)*100)/100}; }
function vCart(){
  const ids=Object.keys(st.cart).filter(id=>st.menu.find(m=>m.id==id));
  if(!ids.length){ $('#view').innerHTML=`<div class="card"><h3>${t('cart')}</h3><span class="muted">${t('empty')}</span></div>`; return; }
  const {sub,tax,total}=totals(), p=st.cfg.pay;
  const opts=[]; if(p.razorpay) opts.push(['razorpay',t('payonline')]); if(p.upi_id) opts.push(['upi',t('payupi')]); if(p.cash) opts.push(['room',t('payroom')]);
  if(!opts.find(o=>o[0]===st.pay)) st.pay=opts[0]?.[0]||'room';
  $('#view').innerHTML = `<div class="card">${ids.map(id=>{const m=st.menu.find(x=>x.id==id);return `<div class="item"><div class="n"><b>${esc(lname(m))}</b><span class="muted">${money(m.price)}</span></div>${qtyCtl(m.id)}<span class="price">${money(m.price*st.cart[id])}</span></div>`}).join('')}
    <table><tr><td>${t('subtotal')}</td><td style="text-align:right">${money(sub)}</td></tr><tr><td>${t('gst')} (${st.cfg.gst_percent}%)</td><td style="text-align:right">${money(tax)}</td></tr><tr><td><b>${t('total')}</b></td><td style="text-align:right"><b>${money(total)}</b></td></tr></table></div>
   <div class="card"><label>${t('name')}</label><input id="gn" value="${esc(st.name||st.stay?.guest_name||'')}"><label>${t('notes')}</label><textarea id="nt" rows="2"></textarea>
   <label>${t('payhow')}</label>${opts.map(([k,l])=>`<label style="color:var(--t)"><input type="radio" name="pm" value="${k}" ${st.pay===k?'checked':''} style="width:auto"> ${l}</label>`).join('')}</div>
   <button class="big" id="po">${t('place')} · ${money(total)}</button>`;
  $('#view').onclick = e => { const b=e.target.closest('button[data-q]'); if(!b) return; const id=b.dataset.id,n=(st.cart[id]||0)+ +b.dataset.q; if(n<=0) delete st.cart[id]; else st.cart[id]=n; store.set('cart',st.cart); render(); };
  document.querySelectorAll('[name=pm]').forEach(r=>r.onchange=()=>st.pay=r.value);
  $('#po').onclick = placeOrder;
}
async function placeOrder(){
  const btn=$('#po'); btn.disabled=true;
  try{
    st.name=$('#gn').value; store.set('gname',st.name);
    const items=Object.entries(st.cart).map(([id,qty])=>({id:+id,qty}));
    const r=await api('/api/orders',{body:{room:st.room,guest_name:st.name,notes:$('#nt').value,items,pay_method:st.pay}});
    if(st.pay==='razorpay'){ await payRazorpay(r); }
    else if(st.pay==='upi'){ upiScreen(r); return finishOrder(true); }
    finishOrder();
  }catch(e){ toast(e.message||t('err')); btn.disabled=false; }
}
function finishOrder(keepView){ st.cart={}; store.set('cart',{}); refreshRoom().then(()=>{ if(!keepView){ st.tab='home'; render(); toast('✅ '+t('ordered')); } else renderTabs(); }); }
function upiScreen(r){
  const c=st.cfg.pay, uri=`upi://pay?pa=${encodeURIComponent(c.upi_id)}&pn=${encodeURIComponent(c.upi_name)}&am=${r.total.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Order #'+r.id+' Room '+st.room)}`;
  $('#view').innerHTML=`<div class="card"><h3>✅ ${t('ordered')} #${r.id}</h3><p>${t('total')}: <b>${money(r.total)}</b></p><a class="btn big" style="text-align:center" href="${uri}">${t('upiopen')}</a><p class="muted">${t('upinote')}</p><br><button class="alt big" id="bk">${t('home')}</button></div>`;
  $('#bk').onclick=()=>{ st.tab='home'; render(); };
}
function loadScript(src){ return new Promise((ok,no)=>{ const s=document.createElement('script'); s.src=src; s.onload=ok; s.onerror=no; document.head.append(s); }); }
async function payRazorpay(r){
  await loadScript('https://checkout.razorpay.com/v1/checkout.js');
  await new Promise((resolve,reject)=>{
    new Razorpay({ key:st.cfg.pay.razorpay_key, amount:r.rzp.amount, currency:'INR', order_id:r.rzp.order_id, name:st.cfg.resort_name, description:`Room ${st.room} · Order #${r.id}`, theme:{color:'#0b6e4f'},
      handler: async resp => { try{ await api(`/api/orders/${r.id}/verify`,{body:resp}); resolve(); }catch(e){ reject(e); } },
      modal:{ ondismiss:()=>reject(new Error('Payment cancelled')) } }).open();
  });
}
async function sendReq(type){
  try{ const r=await api('/api/requests',{body:{room:st.room,type}}); toast(r.duplicate?t('already'):t('sent')); await refreshRoom(); if(st.tab==='home'||st.tab==='help') render(); }catch(e){ toast(e.message); }
}
function vHelp(){
  const types=['reception','housekeeping','towels','laundry','taxi','maintenance','water','other'], ic={reception:'🔔',housekeeping:'🧹',towels:'🧺',laundry:'👕',taxi:'🚕',maintenance:'🔧',water:'💧',other:'✋'};
  $('#view').innerHTML=`<div class="grid">${types.map(k=>`<button class="${k==='reception'||k==='housekeeping'?'amber':'alt'}" data-r="${k}">${ic[k]}<br>${t(k)}</button>`).join('')}</div><br>
   <div class="card"><h3>${t('myreq')}</h3>${st.reqs.length?st.reqs.map(r=>`<div class="item"><div class="n">${t(r.type)}</div><span class="pill ${r.status}">${r.status==='open'?t('open'):t('done')}</span></div>`).join(''):'<span class="muted">—</span>'}</div>
   ${st.cfg.reception_phone?`<a class="btn big" style="text-align:center" href="tel:${esc(st.cfg.reception_phone)}">📞 ${t('callus')} ${t('reception')}</a>`:''}`;
  $('#view').onclick=e=>{ const b=e.target.closest('[data-r]'); if(b) sendReq(b.dataset.r); };
}
function vInfo(){
  const c=st.cfg;
  $('#view').innerHTML=`<div class="card"><h3>📶 ${t('wifi')}</h3>${esc(c.wifi_name)}<br><span class="wifi">${esc(c.wifi_password)}</span></div>
   <div class="card"><h3>🕒 ${t('hours')}</h3>${esc(c.restaurant_hours)}<br><span class="muted">${t('checkout')}: ${esc(c.checkout_time)}</span></div>
   <div class="card"><h3>📋 ${t('guidelines')}</h3>${esc(c.guidelines).split('\n').map(l=>`<div>• ${l}</div>`).join('')}</div>
   <div class="card"><h3>📍 ${t('nearby')}</h3>${c.nearby.map(n=>`<div class="item"><div class="n"><b>${esc(n.name)}</b><span class="muted">${esc(n.note)}</span></div><span class="pill">${esc(n.dist)}</span></div>`).join('')}</div>
   <div class="card"><h3>🚨 ${t('helplines')}</h3>${c.helplines.map(h=>`<div class="item"><div class="n">${esc(h.name)}</div><a class="btn" href="tel:${esc(h.number)}">${esc(h.number)}</a></div>`).join('')}</div>
   <p class="muted" style="text-align:center">${t('room')} ${esc(st.room)} · <a href="#" id="chg">change</a></p>`;
  $('#chg').onclick=e=>{ e.preventDefault(); st.room=''; store.set('room',''); render(); };
}

$('#lang').value=st.lang;
$('#lang').onchange=e=>{ st.lang=e.target.value; store.set('lang',st.lang); render(); };
setInterval(()=>{ const r=$('#run'); if(r&&st.stay) r.textContent=fmtDur(Date.now()-utc(st.stay.checkin_at)); },30000);
// Polling (works on serverless hosting). One tiny query per room every 6s, paused while the tab is hidden.
let lastPulse=null;
async function pulse(){
  if(document.hidden||!st.cfg||!st.room) return;
  try{
    const p=await api(`/api/rooms/${encodeURIComponent(st.room)}/pulse`);
    if(lastPulse){
      if(p.v!==lastPulse.v){ [st.cfg,st.menu]=await Promise.all([api('/api/config'),api('/api/menu')]); if(st.tab!=='cart') render(); }
      if(p.o!==lastPulse.o||p.r!==lastPulse.r||p.s!==lastPulse.s){ await refreshRoom(); if(st.tab==='home'||st.tab==='help') render(); }
    }
    lastPulse=p;
  }catch{}
}
setInterval(pulse,6000);
document.addEventListener('visibilitychange',()=>{ if(!document.hidden) pulse(); });
loadAll().catch(e=>{ $('#view').innerHTML='<div class="card">'+esc(e.message)+'</div>'; });
