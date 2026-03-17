/* ── Navigation ─────────────────────────────────────────── */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  const btn = document.getElementById('nav-' + id);
  if (btn) btn.classList.add('active');
  window.scrollTo(0,0);
}

/* ── Toast ───────────────────────────────────────────────── */
function showToast(title, msg, duration = 3500) {
  const t = document.getElementById('toast');
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

/* ── Filter toggle ───────────────────────────────────────── */
function filterToggle(el) {
  el.parentElement.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

/* ── Add style chip to textarea ──────────────────────────── */
function addStyle(el, style) {
  const ta = document.getElementById('trend-desc');
  ta.value += (ta.value ? ', ' : '') + style;
  el.classList.toggle('active');
}

/* ── Rush toggle ─────────────────────────────────────────── */
function toggleRush(el) { el.classList.toggle('on'); }

/* ═══════════════════════════════════════════════════════════
   TREND RADAR DATA + RENDER
═══════════════════════════════════════════════════════════ */
const TRENDS = [
  { id:1, title:'Oversized Blazer + Silk Cami', style:'Minimalist', score:97, views:'4.2M', velocity:'+1.2k/h', tags:['#ootd','#minimal','#workwear'], heat:'🔥🔥🔥', color:'#6e00ff' },
  { id:2, title:'Y2K Butterfly Micro Dress', style:'Y2K', score:94, views:'3.8M', velocity:'+980/h', tags:['#y2k','#butterfly','#partywear'], heat:'🔥🔥🔥', color:'#ff007a' },
  { id:3, title:'Cargo Drop-Crotch Trousers', style:'Streetwear', score:91, views:'2.9M', velocity:'+760/h', tags:['#streetstyle','#cargo','#techwear'], heat:'🔥🔥🔥', color:'#00e5ff' },
  { id:4, title:'Linen Co-ord Set Earth Tones', style:'Minimalist', score:88, views:'2.4M', velocity:'+620/h', tags:['#linen','#coord','#capsule'], heat:'🔥🔥', color:'#6e00ff' },
  { id:5, title:'K-pop Idol Pastel Knit Set', style:'K-Fashion', score:85, views:'2.1M', velocity:'+540/h', tags:['#kfashion','#kpop','#pastel'], heat:'🔥🔥', color:'#ff007a' },
  { id:6, title:'Sheer Organza Blouse Layer', style:'Romantic', score:82, views:'1.8M', velocity:'+410/h', tags:['#sheer','#layering','#feminine'], heat:'🔥🔥', color:'#00e5ff' },
  { id:7, title:'Denim Corset + Wide-Leg Jeans', style:'Y2K', score:79, views:'1.5M', velocity:'+390/h', tags:['#denim','#corset','#jeans'], heat:'🔥🔥', color:'#6e00ff' },
  { id:8, title:'Bamboo Silk Áo Dài Remix', style:'Vietnamese', score:76, views:'1.2M', velocity:'+310/h', tags:['#aodai','#vietfashion','#heritage'], heat:'🔥', color:'#ff007a' },
  { id:9, title:'Cropped Moto Jacket in Red', style:'Streetwear', score:73, views:'980k', velocity:'+280/h', tags:['#moto','#red','#jacket'], heat:'🔥', color:'#ff2d78' },
  { id:10,title:'Mesh Overlay Activewear Set', style:'Techwear', score:70, views:'860k', velocity:'+240/h', tags:['#mesh','#activewear','#gym'], heat:'🔥', color:'#00e5ff' },
];

function scoreColor(s) {
  if (s >= 90) return '#00ff88';
  if (s >= 80) return '#00e5ff';
  if (s >= 70) return '#ff007a';
  return '#9090b8';
}

function renderTrends() {
  const grid = document.getElementById('trend-grid');
  grid.innerHTML = TRENDS.map(t => `
    <div class="trend-card" onclick="launchTrend(${t.id})">
      <div class="trend-score" style="color:${scoreColor(t.score)}">${t.score}</div>
      <div style="height:55%;background:linear-gradient(135deg,${t.color}33,rgba(0,0,0,0.8));display:flex;align-items:center;justify-content:center;font-size:40px">
        ${t.heat}
      </div>
      <div class="trend-card-body">
        <div class="badge badge-purple" style="margin-bottom:8px;font-size:10px">${t.style}</div>
        <div style="font-size:14px;font-weight:600;line-height:1.3;margin-bottom:8px">${t.title}</div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted)">
          <span>👁 ${t.views}</span>
          <span style="color:var(--neon-green)">${t.velocity}</span>
        </div>
        <div style="margin-top:10px">
          <div class="progress-bar">
            <div class="progress-fill" style="width:${t.score}%;background:linear-gradient(90deg,${t.color},${t.color}99)"></div>
          </div>
        </div>
        <div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap">
          ${t.tags.map(tg=>`<span style="font-size:10px;color:var(--text-muted)">${tg}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

function launchTrend(id) {
  const t = TRENDS.find(x => x.id === id);
  showPage('studio');
  document.getElementById('trend-desc').value = t.title + ' — ' + t.style + ' aesthetic. Tags: ' + t.tags.join(', ');
  showToast('🎯 Trend Loaded', t.title + ' ready to design');
}

/* ═══════════════════════════════════════════════════════════
   DESIGN STUDIO
═══════════════════════════════════════════════════════════ */
const PALETTES = {
  Minimalist: ['#F5F0E8','#D4C9B8','#8B7355','#4A3728','#2C1810'],
  Streetwear: ['#1A1A2E','#16213E','#E94560','#FFFFFF','#F5A623'],
  'K-Fashion': ['#FFB3D9','#FF69B4','#E91E8C','#FFFFFF','#4A0028'],
  Y2K:        ['#FF6EC7','#A855F7','#06B6D4','#F59E0B','#FFFFFF'],
  Vietnamese: ['#8B0000','#FFD700','#228B22','#F5F5DC','#4A0000'],
  Default:    ['#6e00ff','#ff007a','#00e5ff','#FFFFFF','#0c0c14'],
};

function analyzeURL() {
  const url = document.getElementById('trend-url').value.trim();
  if (!url) { showToast('⚠️ No URL', 'Paste a TikTok or Instagram link first'); return; }
  const fakeStyle = ['Minimalist','Y2K','Streetwear','K-Fashion'][Math.floor(Math.random()*4)];
  document.getElementById('trend-desc').value = `Trending look detected from video: oversized silhouettes with layered textures — ${fakeStyle} aesthetic with bold color blocking. High engagement from 18–25F demographic.`;
  showToast('📹 Video Analyzed', 'Trend extracted — ' + fakeStyle + ' style detected');
}

let isGenerating = false;
function generateDesign() {
  if (isGenerating) return;
  const desc = document.getElementById('trend-desc').value.trim();
  if (!desc) { showToast('⚠️ Empty', 'Describe a trend or paste a URL first'); return; }

  isGenerating = true;
  const btn = document.getElementById('gen-btn-text');
  btn.innerHTML = '<span class="loader"></span> Generating...';

  const qty = document.getElementById('qty').value;
  const budget = document.getElementById('budget').value;
  const rush = document.getElementById('rush-toggle').classList.contains('on');
  const styleKey = Object.keys(PALETTES).find(k => desc.toLowerCase().includes(k.toLowerCase())) || 'Default';
  const palette = PALETTES[styleKey] || PALETTES.Default;

  setTimeout(() => {
    const brief = generateBrief(desc, qty, budget, rush, palette, styleKey);
    document.getElementById('studio-output').innerHTML = brief;
    isGenerating = false;
    btn.textContent = '✨ Generate Design Brief';
    showToast('✅ Design Ready', 'Brief generated — send to factory?');
  }, 2200);
}

function generateBrief(desc, qty, budget, rush, palette, style) {
  const leadTime = rush ? '24 hours' : '48 hours';
  const premium  = rush ? '<span class="badge badge-red">⚡ Rush</span>' : '<span class="badge badge-green">Standard</span>';
  const colorDots = palette.map(c=>`<div title="${c}" style="width:28px;height:28px;border-radius:50%;background:${c};border:2px solid rgba(255,255,255,0.15);cursor:pointer" onclick="navigator.clipboard&&navigator.clipboard.writeText('${c}')"></div>`).join('');

  return `
  <div class="card fade-in-up" style="background:linear-gradient(135deg,rgba(110,0,255,0.08),rgba(255,0,122,0.05))">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
      <div>
        <div class="eyebrow" style="margin-bottom:4px">AI Design Brief</div>
        <h3 style="font-size:18px">${style} Drop #${Math.floor(Math.random()*900+100)}</h3>
      </div>
      <div style="display:flex;gap:8px">${premium}<span class="badge badge-cyan">AI Confidence: ${Math.floor(Math.random()*10+88)}%</span></div>
    </div>

    <!-- Concept summary -->
    <div style="background:rgba(255,255,255,0.03);border-radius:var(--radius-sm);padding:16px;margin-bottom:20px;border-left:3px solid var(--accent)">
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Concept</div>
      <div style="font-size:14px;line-height:1.6">${desc}</div>
    </div>

    <!-- Specs grid -->
    <div class="grid-2" style="gap:12px;margin-bottom:20px">
      <div style="background:rgba(255,255,255,0.03);border-radius:var(--radius-sm);padding:14px">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">SILHOUETTE</div>
        <div style="font-size:14px;font-weight:600">Relaxed / Oversized</div>
      </div>
      <div style="background:rgba(255,255,255,0.03);border-radius:var(--radius-sm);padding:14px">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">PRIMARY FABRIC</div>
        <div style="font-size:14px;font-weight:600">Linen-Viscose Blend</div>
      </div>
      <div style="background:rgba(255,255,255,0.03);border-radius:var(--radius-sm);padding:14px">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">TARGET DEMO</div>
        <div style="font-size:14px;font-weight:600">18–28F · Trendy Urban</div>
      </div>
      <div style="background:rgba(255,255,255,0.03);border-radius:var(--radius-sm);padding:14px">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">SIZE RANGE</div>
        <div style="font-size:14px;font-weight:600">XS–XL (5 sizes)</div>
      </div>
    </div>

    <!-- Color palette -->
    <div style="margin-bottom:20px">
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:1px">AI Color Palette</div>
      <div style="display:flex;gap:10px;align-items:center">${colorDots}<span style="font-size:11px;color:var(--text-muted)">Click to copy hex</span></div>
    </div>

    <!-- Production info -->
    <div style="padding:16px;background:rgba(0,255,136,0.05);border:1px solid rgba(0,255,136,0.15);border-radius:var(--radius-sm);margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--neon-green)">⚡ Lead time: ${leadTime}</div>
          <div style="font-size:12px;color:var(--text-muted)">Batch: ${qty} · Budget: ${budget}</div>
        </div>
        <div style="font-size:20px;font-weight:700">~${budget.includes('150k') ? '420k' : budget.includes('300k') ? '780k' : '1.1M'} VND <span style="font-size:12px;font-weight:400;color:var(--text-muted)">/ piece</span></div>
      </div>
    </div>

    <!-- CTA -->
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="sendToFactory()">🏭 Send to Factory</button>
      <button class="btn btn-secondary" onclick="copyBrief()">📋 Copy Brief</button>
      <button class="btn btn-secondary" onclick="showPage('factory')">View Factories →</button>
    </div>
  </div>`;
}

function sendToFactory() {
  showPage('factory');
  showToast('📤 Brief Sent', 'Matching optimal factory for your drop...');
}
function copyBrief() { showToast('📋 Copied', 'Design brief copied to clipboard'); }

/* ═══════════════════════════════════════════════════════════
   FACTORY NETWORK
═══════════════════════════════════════════════════════════ */
const FACTORIES = [
  { id:'F001', name:'Saigon Thread Co.', city:'Ho Chi Minh City', rating:4.9, orders:1243, lead:'36h', capacity:78, special:['Woven','Knitwear','Co-ords'], verified:true, badge:'badge-green', note:'Top Performer' },
  { id:'F002', name:'Hanoi Textile Hub', city:'Hanoi', rating:4.8, orders:987, lead:'48h', capacity:52, special:['Denim','Outerwear','Trousers'], verified:true, badge:'badge-cyan', note:'Denim Expert' },
  { id:'F003', name:'Da Nang Fast Stitch', city:'Da Nang', rating:4.7, orders:654, lead:'48h', capacity:65, special:['Casual','T-shirts','Activewear'], verified:true, badge:'badge-purple', note:'Rush Ready' },
  { id:'F004', name:'Binh Duong Apparel', city:'Binh Duong', rating:4.6, orders:1102, lead:'60h', capacity:41, special:['Formal','Blazers','Suits'], verified:true, badge:'badge-pink', note:'Premium Quality' },
  { id:'F005', name:'Hue Silk Atelier', city:'Hue', rating:4.8, orders:432, lead:'72h', capacity:88, special:['Silk','Áo Dài','Heritage'], verified:true, badge:'badge-green', note:'Heritage Specialist' },
  { id:'F006', name:'Vung Tau Stitch Lab', city:'Vung Tau', rating:4.5, orders:321, lead:'48h', capacity:33, special:['Swimwear','Beachwear','Loungewear'], verified:false, badge:'badge-purple', note:'New Partner' },
];

function renderFactories() {
  const list = document.getElementById('factory-list');
  list.innerHTML = FACTORIES.map(f => `
    <div class="factory-card" id="fc-${f.id}" onclick="selectFactory('${f.id}')">
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <div style="width:48px;height:48px;border-radius:var(--radius-sm);background:linear-gradient(135deg,var(--accent),var(--accent-2));display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">🏭</div>
        <div style="flex:1;min-width:180px">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span style="font-weight:600;font-size:16px">${f.name}</span>
            ${f.verified ? '<span style="font-size:12px;color:var(--neon-green)">✓ Verified</span>' : ''}
            <span class="badge ${f.badge}">${f.note}</span>
          </div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:2px">📍 ${f.city} · ⚡ ${f.lead} lead · ⭐ ${f.rating} · ${f.orders} orders</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
            ${f.special.map(s=>`<span class="tag" style="font-size:11px">${s}</span>`).join('')}
          </div>
          <div style="margin-top:10px;max-width:240px">
            <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:4px">
              <span>Capacity</span><span style="color:${f.capacity>70?'var(--neon-green)':f.capacity>40?'var(--accent-3)':'var(--accent-2)'}">${f.capacity}% available</span>
            </div>
            <div class="capacity-bar">
              <div class="capacity-fill" style="width:${f.capacity}%"></div>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-direction:column;align-items:flex-end">
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();placeOrder('${f.id}','${f.name}')">Place Order</button>
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();showToast('📞 Connecting','Messaging ${f.name}...')">Message</button>
        </div>
      </div>
    </div>
  `).join('');
}

function selectFactory(id) {
  document.querySelectorAll('.factory-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('fc-'+id).classList.add('selected');
}

function placeOrder(id, name) {
  const order = {
    id: 'DRP-' + Math.floor(Math.random()*9000+1000),
    factory: name,
    product: 'Drop #' + Math.floor(Math.random()*900+100),
    qty: '100 pcs',
    status: 'confirmed',
    eta: '48h',
    created: new Date().toLocaleString()
  };
  ORDERS.unshift(order);
  renderOrders();
  showToast('✅ Order Placed!', order.id + ' → ' + name + ' · ETA ' + order.eta);
  setTimeout(() => showPage('orders'), 1500);
}

/* ═══════════════════════════════════════════════════════════
   ORDERS
═══════════════════════════════════════════════════════════ */
const ORDERS = [
  { id:'DRP-7821', factory:'Saigon Thread Co.', product:'Oversized Linen Blazer Drop', qty:'100 pcs', status:'shipping', eta:'6h', created:'Today 09:14' },
  { id:'DRP-7734', factory:'Hanoi Textile Hub', product:'Y2K Butterfly Mini Dress', qty:'50 pcs', status:'production', eta:'18h', created:'Today 07:30' },
  { id:'DRP-7689', factory:'Da Nang Fast Stitch', product:'Cargo Drop-Crotch Trousers', qty:'200 pcs', status:'production', eta:'32h', created:'Yesterday 22:10' },
  { id:'DRP-7541', factory:'Hue Silk Atelier', product:'Áo Dài Remix Collection', qty:'50 pcs', status:'delivered', eta:'Done', created:'Mar 15' },
  { id:'DRP-7480', factory:'Binh Duong Apparel', product:'Cropped Blazer Set', qty:'150 pcs', status:'delivered', eta:'Done', created:'Mar 14' },
];

const STATUS_CONFIG = {
  confirmed:  { label:'Confirmed',  color:'badge-cyan',   icon:'✅', prog:15 },
  production: { label:'Production', color:'badge-purple', icon:'⚙️', prog:55 },
  qc:         { label:'QC Check',   color:'badge-pink',   icon:'🔍', prog:75 },
  shipping:   { label:'Shipping',   color:'badge-green',  icon:'🚚', prog:90 },
  delivered:  { label:'Delivered',  color:'badge-green',  icon:'📦', prog:100 },
};

function renderOrders() {
  const list = document.getElementById('orders-list');
  list.innerHTML = ORDERS.map(o => {
    const st = STATUS_CONFIG[o.status] || STATUS_CONFIG.confirmed;
    return `
    <div class="card fade-in-up">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:20px">
        <div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:4px">
            <span style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:var(--text-muted)">${o.id}</span>
            <span class="badge ${st.color}">${st.icon} ${st.label}</span>
          </div>
          <h3 style="font-size:17px;margin-bottom:2px">${o.product}</h3>
          <div style="font-size:13px;color:var(--text-muted)">🏭 ${o.factory} · ${o.qty} · Created: ${o.created}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:22px;font-weight:700;color:${o.status==='delivered'?'var(--neon-green)':'var(--accent-3)'}">ETA ${o.eta}</div>
          ${o.status !== 'delivered' ? '<button class="btn btn-ghost btn-sm" onclick="showToast(\'📍 Tracking\',\'Live factory feed opened\')">Track Live →</button>' : '<div class="badge badge-green" style="margin-top:4px">✓ Complete</div>'}
        </div>
      </div>

      <!-- Progress bar with steps -->
      <div style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;margin-bottom:10px">
          ${['Design','Factory','Production','QC','Ship','Delivered'].map((step,i)=>{
            const done = st.prog >= (i+1)*16;
            return `<div style="text-align:center;flex:1">
              <div style="width:24px;height:24px;border-radius:50%;border:2px solid ${done?'var(--accent)':'var(--border)'};background:${done?'rgba(110,0,255,0.2)':'transparent'};margin:0 auto 4px;display:flex;align-items:center;justify-content:center;font-size:10px">${done?'✓':''}</div>
              <div style="font-size:10px;color:${done?'var(--text-secondary)':'var(--text-muted)'}">${step}</div>
            </div>`;
          }).join('')}
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${st.prog}%"></div>
        </div>
      </div>

      <!-- Timeline -->
      ${o.status !== 'delivered' ? `
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-secondary btn-sm" onclick="showToast('📹 Factory Cam','Live feed: cutting room — ${o.factory}')">📹 Live Feed</button>
        <button class="btn btn-secondary btn-sm" onclick="showToast('📊 Quality','QC score: ${88+Math.floor(Math.random()*10)}% — all specs met')">🔍 QC Report</button>
        <button class="btn btn-secondary btn-sm" onclick="showToast('📬 Update Sent','Factory notified of priority change')">⚡ Notify Factory</button>
      </div>` : `<div style="color:var(--text-muted);font-size:13px">✅ All ${o.qty} delivered successfully. <a href="#" style="color:var(--accent);text-decoration:none" onclick="showToast('📊 Analytics','Drop revenue +320% vs baseline')">View analytics →</a></div>`}
    </div>`;
  }).join('');
}

/* ═══════════════════════════════════════════════════════════
   LIVE SCANNER SIMULATION
═══════════════════════════════════════════════════════════ */
const LIVE_ALERTS = [
  ['🔥 New Trend', 'Sheer maxi dress spotted — 890k views in 2h'],
  ['⚡ Velocity Spike', '"Cargo bubble skirt" +340% engagement last 30min'],
  ['🤖 AI Prediction', 'Cream monochrome set likely to hit 1M views by tonight'],
  ['🏭 Factory Alert', 'Saigon Thread Co. has 24h rush slot open'],
  ['📈 Trending Now', 'Mesh overlay tops up 180% — 3 factories available'],
];
let alertIdx = 0;
setInterval(() => {
  const [title, msg] = LIVE_ALERTS[alertIdx % LIVE_ALERTS.length];
  showToast(title, msg);
  alertIdx++;
}, 12000);

/* ── INIT ────────────────────────────────────────────────── */
renderTrends();
renderFactories();
renderOrders();

/* ═══════════════════════════════════════════════════════════
   INFLUENCER FEED
═══════════════════════════════════════════════════════════ */
const FEED_POSTS = [
  { id:'p1', creator:'minhxinh.vn', handle:'@minhxinh', followers:'240K', avatar:'👩', verified:true,
    drop:'Oversized Linen Blazer Set', style:'minimal', badge:'badge-purple', badgeLabel:'Minimalist',
    price:'380k', sold:47, stock:53, likes:'12.4K', comments:'386', shares:'2.1K',
    trendScore:97, color:'#6e00ff', status:'live', caption:'Clean girl aesthetic đã lên rồi 🤍 Drop chỉ còn 53 cái!' },
  { id:'p2', creator:'streetdropvn', handle:'@streetdropvn', followers:'180K', avatar:'🧑', verified:true,
    drop:'Cargo Bubble Skirt', style:'streetwear', badge:'badge-cyan', badgeLabel:'Streetwear',
    price:'290k', sold:31, stock:69, likes:'8.7K', comments:'241', shares:'1.4K',
    trendScore:91, color:'#00e5ff', status:'live', caption:'Cái này từ trend TikTok ra lò chỉ 36h 🔥 Còn 69 cái nha!' },
  { id:'p3', creator:'kpop.drip', handle:'@kpopdrip', followers:'310K', avatar:'👸', verified:true,
    drop:'Pastel Knit Co-ord', style:'kfashion', badge:'badge-pink', badgeLabel:'K-Fashion',
    price:'450k', sold:88, stock:12, likes:'21.3K', comments:'892', shares:'5.6K',
    trendScore:85, color:'#ff007a', status:'almost_sold', caption:'Idol look với giá bình dân 🌸 Chỉ còn 12 cái cuối!' },
  { id:'p4', creator:'hanoicraft', handle:'@hanoicraft', followers:'95K', avatar:'🧵', verified:false,
    drop:'Áo Dài Remix Modern', style:'viet', badge:'badge-green', badgeLabel:'🇻🇳 Vietnamese',
    price:'620k', sold:22, stock:78, likes:'5.2K', comments:'178', shares:'920',
    trendScore:76, color:'#00ff88', status:'live', caption:'Áo dài phiên bản hiện đại cho Gen Z 🪷 Thủ công 100%' },
  { id:'p5', creator:'y2kgirlvn', handle:'@y2kgirlvn', followers:'420K', avatar:'💅', verified:true,
    drop:'Butterfly Micro Dress', style:'y2k', badge:'badge-purple', badgeLabel:'Y2K',
    price:'320k', sold:0, stock:100, likes:'0', comments:'0', shares:'0',
    trendScore:94, color:'#a855f7', status:'upcoming', caption:'DROP MAI LÚC 8PM ⚡ Set reminder ngay!', countdown: Date.now() + 3600*8*1000 },
  { id:'p6', creator:'saigon.ootd', handle:'@saigonootd', followers:'155K', avatar:'✨', verified:true,
    drop:'Sheer Organza Layer Set', style:'minimal', badge:'badge-cyan', badgeLabel:'Minimalist',
    price:'410k', sold:56, stock:44, likes:'9.1K', comments:'312', shares:'1.8K',
    trendScore:82, color:'#00e5ff', status:'live', caption:'Layering game đỉnh chưa 🤍 Còn 44 cái!' },
  { id:'p7', creator:'techwear.hcm', handle:'@techwearhcm', followers:'67K', avatar:'🤖', verified:false,
    drop:'Mesh Activewear Drop', style:'streetwear', badge:'badge-purple', badgeLabel:'Techwear',
    price:'260k', sold:71, stock:29, likes:'4.3K', comments:'154', shares:'670',
    trendScore:70, color:'#6e00ff', status:'live', caption:'Gym meets street 💪 Gần hết hàng rồi!' },
  { id:'p8', creator:'denim.lab.vn', handle:'@denimlabvn', followers:'203K', avatar:'👖', verified:true,
    drop:'Corset Denim Set', style:'y2k', badge:'badge-pink', badgeLabel:'Y2K',
    price:'490k', sold:0, stock:100, likes:'0', comments:'0', shares:'0',
    trendScore:79, color:'#ff007a', status:'upcoming', caption:'Denim corset trend đang cháy 🔥 Drop tối nay 9PM!', countdown: Date.now() + 3600*5*1000 },
  { id:'p9', creator:'vogue.vn.edit', handle:'@voguevnedit', followers:'512K', avatar:'🌹', verified:true,
    drop:'Red Moto Jacket', style:'streetwear', badge:'badge-red', badgeLabel:'Hot Drop',
    price:'780k', sold:94, stock:6, likes:'34.1K', comments:'1.4K', shares:'8.2K',
    trendScore:73, color:'#ff2d78', status:'almost_sold', caption:'Statement piece của mùa này 🌹 Chỉ còn 6 cái CUỐI CÙNG!' },
];

const CREATORS = [
  { name:'minhxinh.vn', handle:'@minhxinh', followers:'240K', drops:18, revenue:'42M', avatar:'👩', verified:true, badge:'badge-purple', rank:1 },
  { name:'y2kgirlvn',   handle:'@y2kgirlvn', followers:'420K', drops:31, revenue:'87M', avatar:'💅', verified:true, badge:'badge-pink',   rank:2 },
  { name:'kpop.drip',   handle:'@kpopdrip',  followers:'310K', drops:24, revenue:'61M', avatar:'👸', verified:true, badge:'badge-cyan',   rank:3 },
  { name:'saigon.ootd', handle:'@saigonootd',followers:'155K', drops:14, revenue:'28M', avatar:'✨', verified:true, badge:'badge-green',  rank:4 },
  { name:'vogue.vn.edit',handle:'@voguevnedit',followers:'512K',drops:42, revenue:'120M',avatar:'🌹',verified:true, badge:'badge-red',    rank:5 },
];

let activeFeedFilter = 'all';

function filterFeed(el, cat) {
  el.closest('div').querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  activeFeedFilter = cat;
  renderFeed();
}

function renderFeed() {
  const posts = activeFeedFilter === 'all'
    ? FEED_POSTS
    : FEED_POSTS.filter(p => p.style === activeFeedFilter);

  const grid = document.getElementById('feed-grid');
  grid.innerHTML = posts.map((p, i) => {
    const isUpcoming = p.status === 'upcoming';
    const isSoldOut  = p.stock === 0 && !isUpcoming;
    const isAlmost   = p.status === 'almost_sold';
    const soldPct    = Math.round((p.sold/(p.sold+p.stock))*100);

    const stockBadge = isUpcoming
      ? `<span class="badge badge-purple">⏰ Upcoming</span>`
      : isAlmost
      ? `<span class="badge badge-red"><span class="pulse-dot"></span> Almost Gone</span>`
      : `<span class="badge badge-green"><span class="pulse-dot"></span> Live</span>`;

    const ctaBtn = isUpcoming
      ? `<button class="btn btn-secondary" style="flex:1;justify-content:center;font-size:13px" onclick="setAlert('${p.id}','${p.drop}')">🔔 Set Alert</button>`
      : isSoldOut
      ? `<button class="btn btn-ghost" style="flex:1;justify-content:center;font-size:13px" disabled>Sold Out</button>`
      : `<button class="btn btn-primary" style="flex:1;justify-content:center;font-size:13px" onclick="buyDrop('${p.id}','${p.drop}','${p.price}')">🛒 Buy — ${p.price}</button>`;

    const countdownHtml = isUpcoming && p.countdown
      ? `<div id="cd-${p.id}" style="font-size:12px;color:var(--accent);font-family:var(--font-mono);margin-bottom:8px">⏱ Loading...</div>`
      : '';

    // stagger card heights slightly for masonry feel
    const extraPad = i % 3 === 1 ? 'margin-top:28px' : '';

    return `
    <div class="card fade-in-up" style="padding:0;overflow:hidden;${extraPad}">
      <!-- Video thumbnail placeholder -->
      <div style="height:220px;background:linear-gradient(135deg,${p.color}44,rgba(0,0,0,0.9));position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="showToast('📹 Video','Playing @${p.handle.replace('@','')} drop preview...')">
        <div style="font-size:60px">${p.avatar}</div>
        <div style="position:absolute;top:12px;left:12px">${stockBadge}</div>
        <div style="position:absolute;top:12px;right:12px;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);padding:4px 10px;border-radius:100px;font-size:12px;font-weight:700;color:var(--neon-green);border:1px solid rgba(0,255,136,0.2)">AI ${p.trendScore}</div>
        <div style="position:absolute;bottom:12px;left:12px;right:12px;">
          <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:4px">Trend match</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${p.trendScore}%;background:linear-gradient(90deg,${p.color},${p.color}99)"></div></div>
        </div>
        <!-- play icon -->
        <div style="position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.15);backdrop-filter:blur(4px);border:2px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-size:18px">▶</div>
      </div>

      <div style="padding:16px">
        <!-- Creator row -->
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,${p.color},${p.color}88);display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid ${p.color}44">${p.avatar}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600">${p.name} ${p.verified ? '<span style="color:var(--accent);font-size:10px">✓</span>' : ''}</div>
            <div style="font-size:11px;color:var(--text-muted)">${p.handle} · ${p.followers} followers</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="showToast('👤 Following','Now following ${p.handle}')">Follow</button>
        </div>

        <!-- Drop name & caption -->
        <div style="font-weight:600;font-size:15px;margin-bottom:4px">${p.drop}</div>
        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;line-height:1.5">${p.caption}</div>

        <!-- Countdown if upcoming -->
        ${countdownHtml}

        <!-- Stock bar -->
        ${!isUpcoming ? `
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:4px">
            <span>${p.sold} sold</span>
            <span style="color:${p.stock<20?'var(--neon-pink)':'var(--text-muted)'}">${p.stock} left</span>
          </div>
          <div class="progress-bar">
            <div style="height:100%;width:${soldPct}%;background:${soldPct>80?'linear-gradient(90deg,var(--accent-2),var(--neon-pink))':'linear-gradient(90deg,var(--accent),var(--accent-2))'};border-radius:3px;transition:width 1s ease"></div>
          </div>
        </div>` : ''}

        <!-- Engagement -->
        <div style="display:flex;gap:16px;margin-bottom:14px;font-size:12px;color:var(--text-muted)">
          <span onclick="showToast('❤️ Liked','Added to your saved drops')" style="cursor:pointer;transition:color 0.2s" onmouseover="this.style.color='#ff007a'" onmouseout="this.style.color='var(--text-muted)'">❤️ ${p.likes}</span>
          <span onclick="showToast('💬 Comments','Opening comments...')" style="cursor:pointer">💬 ${p.comments}</span>
          <span onclick="showToast('↗️ Shared','Link copied to clipboard')" style="cursor:pointer">↗️ ${p.shares}</span>
          <span style="margin-left:auto" class="badge ${p.badge}" style="font-size:10px">${p.badgeLabel}</span>
        </div>

        <!-- CTA -->
        <div style="display:flex;gap:8px">
          ${ctaBtn}
          <button class="btn btn-secondary btn-sm" onclick="showToast('🔗 Shared','Drop link copied!')">↗️</button>
        </div>
      </div>
    </div>`;
  }).join('');

  // start countdowns
  posts.filter(p => p.countdown).forEach(p => startCountdown(p.id, p.countdown));
}

function startCountdown(id, target) {
  const el = document.getElementById('cd-' + id);
  if (!el) return;
  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) { el.textContent = '🚀 DROP IS LIVE'; el.style.color = 'var(--neon-green)'; return; }
    const h = Math.floor(diff/3600000);
    const m = Math.floor((diff%3600000)/60000);
    const s = Math.floor((diff%60000)/1000);
    el.textContent = `⏱ Drop in ${h}h ${m}m ${s}s`;
    setTimeout(tick, 1000);
  };
  tick();
}

function buyDrop(id, name, price) {
  showToast('🛒 Added to cart', name + ' · ' + price + ' VND');
  const post = FEED_POSTS.find(p => p.id === id);
  if (post && post.stock > 0) { post.sold++; post.stock--; }
  setTimeout(renderFeed, 400);
}

function setAlert(id, name) {
  showToast('🔔 Alert Set!', 'We\'ll notify you when "' + name + '" goes live');
}

function renderCreators() {
  const row = document.getElementById('creators-row');
  row.innerHTML = CREATORS.map(c => `
    <div class="card" style="padding:20px;text-align:center;cursor:pointer" onclick="showToast('👤 Profile','Opening ${c.handle} profile...')">
      <div style="font-size:36px;margin-bottom:8px">${c.avatar}</div>
      <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-2));color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:-14px auto 8px;border:2px solid var(--bg-dark)">#${c.rank}</div>
      <div style="font-weight:600;font-size:14px">${c.name} ${c.verified?'<span style="color:var(--accent);font-size:10px">✓</span>':''}</div>
      <div style="font-size:12px;color:var(--text-muted);margin:2px 0 10px">${c.handle}</div>
      <div class="badge ${c.badge}" style="margin:0 auto 12px;display:inline-flex">${c.followers} followers</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
        <div style="background:rgba(255,255,255,0.03);border-radius:var(--radius-sm);padding:8px">
          <div style="font-size:16px;font-weight:700">${c.drops}</div>
          <div style="font-size:10px;color:var(--text-muted)">Drops</div>
        </div>
        <div style="background:rgba(255,255,255,0.03);border-radius:var(--radius-sm);padding:8px">
          <div style="font-size:16px;font-weight:700">${c.revenue}</div>
          <div style="font-size:10px;color:var(--text-muted)">Revenue</div>
        </div>
      </div>
      <button class="btn btn-secondary btn-sm" style="width:100%;justify-content:center;margin-top:12px" onclick="event.stopPropagation();showToast('✉️ Invite Sent','Collab invite sent to ${c.handle}')">+ Collab</button>
    </div>
  `).join('');
}

renderFeed();
renderCreators();
