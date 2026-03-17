/* ═══════════════════════════════════════════════════════════
   ANALYTICS DASHBOARD
═══════════════════════════════════════════════════════════ */
const REV_DATA  = [38,52,47,91,78,114,143];
const ACC_DATA  = [72,78,81,85,83,89,94];
const DAYS      = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const TOP_DROPS = [
  { name:'Oversized Linen Blazer Set', creator:'@minhxinh',    style:'Minimalist', sold:100, revenue:'38M', margin:'28%', score:97 },
  { name:'Red Moto Jacket',            creator:'@voguevnedit', style:'Streetwear', sold:94,  revenue:'73M', margin:'22%', score:73 },
  { name:'Pastel Knit Co-ord',         creator:'@kpopdrip',    style:'K-Fashion',  sold:88,  revenue:'40M', margin:'29%', score:85 },
  { name:'Y2K Butterfly Mini Dress',   creator:'@y2kgirlvn',   style:'Y2K',        sold:88,  revenue:'28M', margin:'31%', score:94 },
  { name:'Cargo Bubble Skirt',         creator:'@streetdropvn',style:'Streetwear', sold:71,  revenue:'21M', margin:'25%', score:91 },
];
const TRAFFIC_SRC = [
  { label:'TikTok',    pct:54, color:'var(--accent-2)' },
  { label:'Instagram', pct:21, color:'var(--accent)' },
  { label:'Direct',    pct:12, color:'var(--accent-3)' },
  { label:'YouTube',   pct:8,  color:'var(--neon-green)' },
  { label:'Other',     pct:5,  color:'var(--text-muted)' },
];
const CAT_REV = [
  { label:'Streetwear', pct:34, color:'var(--accent-3)' },
  { label:'Minimalist', pct:26, color:'var(--accent)' },
  { label:'Y2K',        pct:18, color:'var(--accent-2)' },
  { label:'K-Fashion',  pct:14, color:'var(--neon-pink)' },
  { label:'Vietnamese', pct:8,  color:'var(--neon-green)' },
];

function renderAnalytics() {
  // KPIs
  document.getElementById('kpi-row').innerHTML = [
    { label:'Total Revenue', value:'200M', sub:'VND this week',  badge:'badge-green',  up:'↑ 34%' },
    { label:'Drops Live',    value:'23',   sub:'8 creators',     badge:'badge-cyan',   up:'↑ 5' },
    { label:'Sell-through',  value:'76%',  sub:'avg drops',      badge:'badge-purple', up:'↑ 12pts' },
    { label:'AI Accuracy',   value:'94%',  sub:'trend predict',  badge:'badge-pink',   up:'↑ 5pts' },
  ].map(k => `
    <div class="card" style="text-align:center;padding:22px 16px">
      <div class="stat-value" style="font-size:32px">${k.value}</div>
      <div style="font-size:13px;color:var(--text-secondary);margin:4px 0">${k.label}</div>
      <div style="font-size:11px;color:var(--text-muted)">${k.sub}</div>
      <div class="badge ${k.badge}" style="margin:10px auto 0;display:inline-flex">${k.up} vs last week</div>
    </div>`).join('');

  // Revenue bars
  const maxRev = Math.max(...REV_DATA);
  document.getElementById('rev-chart').innerHTML = REV_DATA.map((v,i) =>
    `<div class="bar ${v===maxRev?'peak':''}" style="height:${Math.round(v/maxRev*100)}%;position:relative" title="${v}M">
       <div style="position:absolute;bottom:calc(100%+2px);left:50%;transform:translateX(-50%);font-size:9px;color:var(--text-muted);white-space:nowrap">${v}M</div>
     </div>`).join('');
  document.getElementById('rev-labels').innerHTML = DAYS.map(d =>
    `<span style="flex:1;text-align:center;font-size:10px;color:var(--text-muted)">${d}</span>`).join('');

  // Accuracy bars
  const maxAcc = Math.max(...ACC_DATA);
  document.getElementById('acc-chart').innerHTML = ACC_DATA.map(v =>
    `<div class="bar ${v===maxAcc?'peak':''}" style="height:${Math.round(v/maxAcc*100)}%;background:linear-gradient(to top,var(--neon-green),var(--accent-3))" title="${v}%"></div>`).join('');

  // Table
  document.getElementById('drops-table').innerHTML = `
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 70px;font-size:11px;color:var(--text-muted);padding:0 16px 8px;border-bottom:1px solid var(--border);text-transform:uppercase;letter-spacing:1px">
      <span>Drop</span><span>Style</span><span style="text-align:right">Sold</span><span style="text-align:right">Revenue</span><span style="text-align:right">Margin</span><span style="text-align:right">AI</span>
    </div>
    ${TOP_DROPS.map(d => `
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 70px;padding:14px 16px;border-bottom:1px solid var(--border);align-items:center;cursor:pointer;transition:background 0.2s" onmouseover="this.style.background='var(--bg-card-hover)'" onmouseout="this.style.background=''" onclick="showToast('📊 Detail','${d.name}')">
      <div><div style="font-weight:600;font-size:13px">${d.name}</div><div style="font-size:11px;color:var(--text-muted)">${d.creator}</div></div>
      <div><span class="badge badge-purple" style="font-size:10px">${d.style}</span></div>
      <div style="text-align:right;font-weight:600">${d.sold}</div>
      <div style="text-align:right;font-weight:600;color:var(--neon-green)">${d.revenue}</div>
      <div style="text-align:right">${d.margin}</div>
      <div style="text-align:right;font-weight:700;font-size:13px;color:${d.score>=90?'var(--neon-green)':d.score>=80?'var(--accent-3)':'var(--accent)'}">${d.score}</div>
    </div>`).join('')}`;

  // Breakdowns
  const makeBar = arr => arr.map(s =>
    `<div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px"><span>${s.label}</span><span style="font-weight:600;color:${s.color}">${s.pct}%</span></div>
      <div class="progress-bar"><div style="height:100%;width:${s.pct}%;background:${s.color};border-radius:3px"></div></div>
     </div>`).join('');
  document.getElementById('traffic-breakdown').innerHTML  = makeBar(TRAFFIC_SRC);
  document.getElementById('category-breakdown').innerHTML = makeBar(CAT_REV);
}

/* ═══════════════════════════════════════════════════════════
   CREATOR UPLOAD — 3-STEP WIZARD
═══════════════════════════════════════════════════════════ */
let uploadState = { style: null, timing: 'now' };

function simulateUpload() {
  const zone = document.getElementById('drop-zone');
  zone.innerHTML = '<div style="font-size:36px;margin-bottom:12px">⏳</div><div style="font-weight:600">Analyzing video with AI...</div>';
  zone.style.borderColor = 'var(--accent)';
  setTimeout(() => {
    zone.innerHTML = '<div style="font-size:36px;margin-bottom:12px">🎬</div><div style="font-weight:600;color:var(--neon-green);margin-bottom:6px">✓ Analyzed!</div><div style="font-size:13px;color:var(--text-muted)">AI: Minimalist · 18-28F · Score 89</div>';
    zone.style.borderColor = 'var(--neon-green)';
    var cap = document.getElementById('upload-caption');
    if (!cap.value) { cap.value = 'Clean aesthetic drop mới 🤍 Linen cao cấp!'; updateCharCount(cap); }
    showToast('🤖 AI Done', 'Score 89 · Minimalist · 100 pcs recommended');
  }, 2000);
}

function updateCharCount(el) {
  document.getElementById('char-count').textContent = el.value.length + ' / 280';
}

function selectStyle(el, style) {
  document.getElementById('style-selector').querySelectorAll('.tag').forEach(function(t){ t.classList.remove('active'); });
  el.classList.add('active');
  uploadState.style = style;
}

function setTiming(el, timing) {
  el.closest('div').querySelectorAll('button').forEach(function(b){ b.className = 'btn btn-secondary btn-sm'; });
  el.className = 'btn btn-primary btn-sm';
  uploadState.timing = timing;
}

function calcMargin() {
  var price = parseFloat(document.getElementById('sell-price').value) || 350000;
  var qty   = parseFloat(document.getElementById('batch-size').value) || 100;
  var pct   = parseFloat(document.getElementById('margin-pct').value) || 25;
  var earn  = price * qty * pct / 100;
  document.getElementById('earn-calc').textContent = (earn >= 1e6 ? (earn/1e6).toFixed(1)+'M' : Math.round(earn/1000)+'k') + ' VND';
}

function goUploadStep(step) {
  [1,2,3].forEach(function(s){
    document.getElementById('upload-panel-'+s).style.display = (s===step) ? 'flex' : 'none';
  });
  document.querySelectorAll('.upload-step').forEach(function(el){
    var active = parseInt(el.dataset.step) === step;
    el.style.background  = active ? 'rgba(110,0,255,0.12)' : 'var(--bg-card)';
    el.style.borderColor = active ? 'var(--accent)' : 'var(--border)';
    el.querySelector('div').style.color = active ? 'var(--accent)' : 'var(--text-muted)';
  });
  if (step === 3) buildLaunchPreview();
  if (step === 2) calcMargin();
}

function buildLaunchPreview() {
  var caption = document.getElementById('upload-caption').value || 'New drop!';
  var price   = parseInt(document.getElementById('sell-price').value) || 350000;
  var qty     = document.getElementById('batch-size').value || '100';
  var style   = uploadState.style || 'Minimalist';
  var timingMap = { now:'🔴 Live now', tonight:'🕘 Tonight 9PM', tomorrow:'📆 Tomorrow 8PM', weekend:'🎉 This weekend' };
  document.getElementById('launch-preview').innerHTML =
    '<div class="eyebrow" style="margin-bottom:12px">Drop Preview</div>' +
    '<h3 style="margin-bottom:16px">Ready to launch 🚀</h3>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">' +
      '<div style="background:rgba(255,255,255,0.03);border-radius:var(--radius-sm);padding:12px"><div style="font-size:11px;color:var(--text-muted);margin-bottom:2px">Caption</div><div style="font-size:13px">' + caption.slice(0,70) + (caption.length>70?'...':'') + '</div></div>' +
      '<div style="background:rgba(255,255,255,0.03);border-radius:var(--radius-sm);padding:12px"><div style="font-size:11px;color:var(--text-muted);margin-bottom:2px">Style · Batch · Price</div><div style="font-size:13px;font-weight:600">' + style + ' · ' + qty + ' pcs · ' + price.toLocaleString() + ' VND</div></div>' +
    '</div>' +
    '<div style="padding:14px;background:rgba(0,255,136,0.05);border:1px solid rgba(0,255,136,0.15);border-radius:var(--radius-sm)">' +
      '<div style="font-size:13px;color:var(--neon-green);font-weight:600">✓ ' + (timingMap[uploadState.timing]||'Live') + ' · Factory: Saigon Thread Co. · ETA 36h</div>' +
      '<div style="font-size:12px;color:var(--text-muted);margin-top:2px">Drop appears live in Creator Feed immediately after launch</div>' +
    '</div>';
}

function launchDrop() {
  var caption = document.getElementById('upload-caption').value || 'New drop!';
  var price   = document.getElementById('sell-price').value || '350000';
  var qty     = parseInt(document.getElementById('batch-size').value) || 100;
  var style   = uploadState.style || 'Minimalist';
  var post = {
    id:'p_'+Date.now(), creator:'your.brand', handle:'@yourbrand', followers:'1K',
    avatar:'🌟', verified:false, drop:'New Drop — '+style,
    style: style.toLowerCase().replace('-',''),
    badge:'badge-purple', badgeLabel:style,
    price: (Math.round(parseInt(price)/1000))+'k',
    sold:0, stock:qty, likes:'0', comments:'0', shares:'0',
    trendScore:89, color:'#6e00ff',
    status: uploadState.timing==='now' ? 'live' : 'upcoming',
    caption: caption
  };
  FEED_POSTS.unshift(post);
  showToast('🚀 Drop Launched!', 'Live in Creator Feed NOW!');
  setTimeout(function(){ activeFeedFilter='all'; showPage('feed'); renderFeed(); }, 1200);
}

/* ── Patch showPage to trigger analytics render on tab ───── */
(function(){
  var _origSP = showPage;
  window.showPage = function(id) { _origSP(id); if (id==='analytics') renderAnalytics(); };
})();
