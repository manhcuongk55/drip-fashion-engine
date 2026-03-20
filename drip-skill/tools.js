#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════
   DRIP × OpenClaw — Tool Server
   ═══════════════════════════════════════════════════════════════════
   A lightweight HTTP server that exposes DRIP's actors as tools for
   the OpenClaw AI agent. Called via POST /{tool_name} with JSON body.

   Start: node tools.js
   Port : DRIP_TOOL_PORT (default: 3847)

   Config via environment variables:
     DRIP_ERP_URL     — ERPNext instance URL (e.g. https://site.frappe.cloud)
     DRIP_API_KEY     — ERPNext API Key
     DRIP_API_SECRET  — ERPNext API Secret
     DRIP_DEMO_MODE   — "true" = use mock data (default)
     DRIP_TOOL_PORT   — listening port (default: 3847)
═══════════════════════════════════════════════════════════════════ */

const http  = require('http');
const https = require('https');
const { URL } = require('url');

/* ── Config ──────────────────────────────────────────────────────── */
const CONFIG = {
  ERP_URL:    process.env.DRIP_ERP_URL    || '',
  API_KEY:    process.env.DRIP_API_KEY    || '',
  API_SECRET: process.env.DRIP_API_SECRET || '',
  DEMO_MODE:  (process.env.DRIP_DEMO_MODE || 'true') !== 'false',
  PORT:       parseInt(process.env.DRIP_TOOL_PORT || '3847', 10),
  COMPANY:        'DRIP Fashion',
  SUPPLIER_GROUP: 'DRIP Factory',
};

/* ═══════════════════════════════════════════════════════════════════
   MOCK DATA (used when DEMO_MODE = true)
═══════════════════════════════════════════════════════════════════ */
const MOCK_TRENDS = [
  { id:1, title:'Oversized Blazer + Silk Cami', style:'Minimalist', score:97, views:'4.2M', velocity:'+1.2k/h', tags:['#ootd','#minimal','#workwear'], heat:'🔥🔥🔥' },
  { id:2, title:'Y2K Butterfly Micro Dress',    style:'Y2K',        score:94, views:'3.8M', velocity:'+980/h',  tags:['#y2k','#butterfly','#partywear'], heat:'🔥🔥🔥' },
  { id:3, title:'Cargo Drop-Crotch Trousers',   style:'Streetwear', score:91, views:'2.9M', velocity:'+760/h',  tags:['#streetstyle','#cargo'], heat:'🔥🔥🔥' },
  { id:4, title:'Linen Co-ord Set Earth Tones', style:'Minimalist', score:88, views:'2.4M', velocity:'+620/h',  tags:['#linen','#coord','#capsule'], heat:'🔥🔥' },
  { id:5, title:'K-pop Idol Pastel Knit Set',   style:'K-Fashion',  score:85, views:'2.1M', velocity:'+540/h',  tags:['#kfashion','#kpop'], heat:'🔥🔥' },
  { id:6, title:'Sheer Organza Blouse Layer',   style:'Romantic',   score:82, views:'1.8M', velocity:'+410/h',  tags:['#sheer','#layering'], heat:'🔥🔥' },
  { id:7, title:'Denim Corset + Wide-Leg Jeans',style:'Y2K',        score:79, views:'1.5M', velocity:'+390/h',  tags:['#denim','#corset'], heat:'🔥🔥' },
  { id:8, title:'Bamboo Silk Áo Dài Remix',     style:'Vietnamese', score:76, views:'1.2M', velocity:'+310/h',  tags:['#aodai','#vietfashion'], heat:'🔥' },
  { id:9, title:'Cropped Moto Jacket in Red',   style:'Streetwear', score:73, views:'980k', velocity:'+280/h',  tags:['#moto','#red'], heat:'🔥' },
  { id:10,title:'Mesh Overlay Activewear Set',  style:'Techwear',   score:70, views:'860k', velocity:'+240/h',  tags:['#mesh','#activewear'], heat:'🔥' },
];

const MOCK_FACTORIES = [
  { id:'F001', name:'Saigon Thread Co.',   city:'Ho Chi Minh City', rating:4.9, orders:1243, lead_hours:36, capacity:78, special:['Woven','Knitwear','Co-ords'], verified:true, note:'Top Performer' },
  { id:'F002', name:'Hanoi Textile Hub',   city:'Hanoi',            rating:4.8, orders:987,  lead_hours:48, capacity:52, special:['Denim','Outerwear','Trousers'], verified:true, note:'Denim Expert' },
  { id:'F003', name:'Da Nang Fast Stitch', city:'Da Nang',          rating:4.7, orders:654,  lead_hours:48, capacity:65, special:['Casual','T-shirts','Activewear'], verified:true, note:'Rush Ready' },
  { id:'F004', name:'Binh Duong Apparel',  city:'Binh Duong',       rating:4.6, orders:1102, lead_hours:60, capacity:41, special:['Formal','Blazers','Suits'], verified:true, note:'Premium Quality' },
  { id:'F005', name:'Hue Silk Atelier',    city:'Hue',              rating:4.8, orders:432,  lead_hours:72, capacity:88, special:['Silk','Áo Dài','Heritage'], verified:true, note:'Heritage Specialist' },
  { id:'F006', name:'Vung Tau Stitch Lab', city:'Vung Tau',         rating:4.5, orders:321,  lead_hours:48, capacity:33, special:['Swimwear','Beachwear','Loungewear'], verified:false, note:'New Partner' },
];

const MOCK_ORDERS = [
  { id:'DRP-7821', factory:'Saigon Thread Co.',   product:'Oversized Linen Blazer Drop', qty:100, status:'shipping',    eta:'6h',  created:'Today 09:14' },
  { id:'DRP-7734', factory:'Hanoi Textile Hub',   product:'Y2K Butterfly Mini Dress',    qty:50,  status:'production',  eta:'18h', created:'Today 07:30' },
  { id:'DRP-7689', factory:'Da Nang Fast Stitch', product:'Cargo Drop-Crotch Trousers',  qty:200, status:'production',  eta:'32h', created:'Yesterday 22:10' },
  { id:'DRP-7541', factory:'Hue Silk Atelier',    product:'Áo Dài Remix Collection',     qty:50,  status:'delivered',   eta:'Done',created:'Mar 15' },
  { id:'DRP-7480', factory:'Binh Duong Apparel',  product:'Cropped Blazer Set',          qty:150, status:'delivered',   eta:'Done',created:'Mar 14' },
];

const MOCK_FEED = [
  { creator:'minhxinh.vn', handle:'@minhxinh', followers:'240K', drop:'Oversized Linen Blazer Set', style:'minimal', price:'380k', sold:47, stock:53, likes:'12.4K', score:97, status:'live' },
  { creator:'streetdropvn', handle:'@streetdropvn', followers:'180K', drop:'Cargo Bubble Skirt', style:'streetwear', price:'290k', sold:31, stock:69, likes:'8.7K', score:91, status:'live' },
  { creator:'kpop.drip', handle:'@kpopdrip', followers:'310K', drop:'Pastel Knit Co-ord', style:'kfashion', price:'450k', sold:88, stock:12, likes:'21.3K', score:85, status:'almost_sold' },
  { creator:'hanoicraft', handle:'@hanoicraft', followers:'95K', drop:'Áo Dài Remix Modern', style:'viet', price:'620k', sold:22, stock:78, likes:'5.2K', score:76, status:'live' },
  { creator:'y2kgirlvn', handle:'@y2kgirlvn', followers:'420K', drop:'Butterfly Micro Dress', style:'y2k', price:'320k', sold:0, stock:100, likes:'0', score:94, status:'upcoming' },
  { creator:'vogue.vn.edit', handle:'@voguevnedit', followers:'512K', drop:'Red Moto Jacket', style:'streetwear', price:'780k', sold:94, stock:6, likes:'34.1K', score:73, status:'almost_sold' },
];

/* ═══════════════════════════════════════════════════════════════════
   ERPNext HTTP helpers
═══════════════════════════════════════════════════════════════════ */
function erpFetch(path) {
  return new Promise((resolve, reject) => {
    const base = CONFIG.ERP_URL.replace(/\/+$/, '');
    const fullUrl = new URL(base + path);
    const mod = fullUrl.protocol === 'https:' ? https : http;
    const options = {
      hostname: fullUrl.hostname,
      port:     fullUrl.port || (fullUrl.protocol === 'https:' ? 443 : 80),
      path:     fullUrl.pathname + fullUrl.search,
      method:   'GET',
      headers: {
        'Authorization': `token ${CONFIG.API_KEY}:${CONFIG.API_SECRET}`,
        'Accept': 'application/json',
      }
    };
    const req = mod.request(options, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve(JSON.parse(body).data); }
        catch(e) { reject(new Error('ERPNext parse error: ' + e.message)); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function erpPost(path, data) {
  return new Promise((resolve, reject) => {
    const base = CONFIG.ERP_URL.replace(/\/+$/, '');
    const fullUrl = new URL(base + path);
    const body = JSON.stringify(data);
    const mod = fullUrl.protocol === 'https:' ? https : http;
    const options = {
      hostname: fullUrl.hostname,
      port:     fullUrl.port || (fullUrl.protocol === 'https:' ? 443 : 80),
      path:     fullUrl.pathname + fullUrl.search,
      method:   'POST',
      headers: {
        'Authorization': `token ${CONFIG.API_KEY}:${CONFIG.API_SECRET}`,
        'Content-Type':  'application/json',
        'Accept':        'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    };
    const req = mod.request(options, res => {
      let buf = '';
      res.on('data', d => buf += d);
      res.on('end', () => {
        try { resolve(JSON.parse(buf).data); }
        catch(e) { reject(new Error('ERPNext parse error: ' + e.message)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/* ═══════════════════════════════════════════════════════════════════
   TOOL HANDLERS
═══════════════════════════════════════════════════════════════════ */

async function drip_get_trends({ limit = 5, style } = {}) {
  if (CONFIG.DEMO_MODE) {
    let data = [...MOCK_TRENDS];
    if (style) data = data.filter(t => t.style.toLowerCase() === style.toLowerCase());
    return { ok: true, mode: 'demo', count: Math.min(limit, data.length), data: data.slice(0, limit) };
  }
  const fields = '["name","item_name","custom_trend_score","custom_style_category","custom_trend_source"]';
  const filters = style
    ? `[["custom_style_category","=","${style}"]]`
    : '[]';
  const raw = await erpFetch(`/api/resource/Item?fields=${fields}&filters=${filters}&limit_page_length=${limit}&order_by=custom_trend_score desc`);
  const data = raw.map(r => ({
    id: r.name, title: r.item_name, style: r.custom_style_category,
    score: r.custom_trend_score || 0, source: r.custom_trend_source || 'social'
  }));
  return { ok: true, mode: 'live', count: data.length, data };
}

async function drip_get_factories({ min_capacity = 0, specialization, max_lead_hours } = {}) {
  if (CONFIG.DEMO_MODE) {
    let data = [...MOCK_FACTORIES];
    if (min_capacity > 0) data = data.filter(f => f.capacity >= min_capacity);
    if (specialization) data = data.filter(f => f.special.some(s => s.toLowerCase().includes(specialization.toLowerCase())));
    if (max_lead_hours)  data = data.filter(f => f.lead_hours <= max_lead_hours);
    return { ok: true, mode: 'demo', count: data.length, data };
  }
  const filters = JSON.stringify([['supplier_group', '=', CONFIG.SUPPLIER_GROUP]]);
  const fields  = '["name","supplier_name","custom_city","custom_capacity_pct","custom_lead_time","custom_specializations","custom_verified","custom_rating","custom_total_orders","custom_note"]';
  const raw = await erpFetch(`/api/resource/Supplier?filters=${filters}&fields=${fields}&limit_page_length=50&order_by=custom_rating desc`);
  let data = raw.map(s => ({
    id: s.name, name: s.supplier_name, city: s.custom_city || '',
    rating: s.custom_rating || 4.5, orders: s.custom_total_orders || 0,
    lead_hours: s.custom_lead_time || 48, capacity: s.custom_capacity_pct || 50,
    special: (s.custom_specializations || '').split(',').map(x => x.trim()).filter(Boolean),
    verified: !!s.custom_verified, note: s.custom_note || ''
  }));
  if (min_capacity > 0)  data = data.filter(f => f.capacity >= min_capacity);
  if (specialization)    data = data.filter(f => f.special.some(s => s.toLowerCase().includes(specialization.toLowerCase())));
  if (max_lead_hours)    data = data.filter(f => f.lead_hours <= max_lead_hours);
  return { ok: true, mode: 'live', count: data.length, data };
}

async function drip_get_orders({ status, limit = 5 } = {}) {
  if (CONFIG.DEMO_MODE) {
    let data = [...MOCK_ORDERS];
    if (status) data = data.filter(o => o.status === status);
    return { ok: true, mode: 'demo', count: Math.min(limit, data.length), data: data.slice(0, limit) };
  }
  const STATUS_MAP = { confirmed:'Not Started', production:'In Process', delivered:'Completed', qc:'Stopped' };
  const fields = '["name","production_item","qty","status","expected_delivery_date","custom_factory_name","custom_drip_drop_id","custom_creator","creation"]';
  let filterStr = '';
  if (status && STATUS_MAP[status]) {
    filterStr = `&filters=[["status","=","${STATUS_MAP[status]}"]]`;
  }
  const raw = await erpFetch(`/api/resource/Work Order?fields=${fields}${filterStr}&limit_page_length=${limit}&order_by=creation desc`);
  const REVERSE = { 'Not Started':'confirmed', 'In Process':'production', 'Completed':'delivered', 'Stopped':'qc' };
  const now = Date.now();
  const data = raw.map(wo => {
    const etaMs = wo.expected_delivery_date ? new Date(wo.expected_delivery_date) - now : 0;
    const etaH  = Math.max(0, Math.ceil(etaMs / 3600000));
    return {
      id: wo.name, factory: wo.custom_factory_name || 'Factory',
      product: wo.production_item, qty: wo.qty,
      status: REVERSE[wo.status] || 'confirmed',
      eta: wo.status === 'Completed' ? 'Done' : (etaH > 24 ? Math.floor(etaH/24) + 'd' : etaH + 'h'),
      created: wo.creation
    };
  });
  return { ok: true, mode: 'live', count: data.length, data };
}

async function drip_place_order({ item, qty, factory_name, rush = false, drop_id = '' } = {}) {
  if (!item)         throw new Error('item is required');
  if (!qty)          throw new Error('qty is required');
  if (!factory_name) throw new Error('factory_name is required');

  if (CONFIG.DEMO_MODE) {
    const order = {
      id: 'DRP-' + Math.floor(Math.random() * 9000 + 1000),
      factory: factory_name, product: item, qty,
      status: 'confirmed', eta: rush ? '24h' : '48h',
      created: new Date().toLocaleString(),
      rush, drop_id
    };
    MOCK_ORDERS.unshift(order);
    return { ok: true, mode: 'demo', order };
  }

  // ensure Item exists
  try {
    await erpFetch('/api/resource/Item/' + encodeURIComponent(item));
  } catch {
    await erpPost('/api/resource/Item', {
      item_code: item, item_name: item, item_group: 'Products',
      stock_uom: 'Nos', is_stock_item: 1, company: CONFIG.COMPANY
    });
  }

  const body = {
    production_item: item, qty,
    company: CONFIG.COMPANY,
    custom_factory_name: factory_name,
    custom_drip_drop_id: drop_id,
    custom_rush: rush ? 1 : 0
  };
  const result = await erpPost('/api/resource/Work Order', body);
  return { ok: true, mode: 'live', order: { id: result.name, factory: factory_name, product: item, qty, status: 'confirmed', eta: rush ? '24h' : '48h' } };
}

async function drip_get_analytics({ period_days = 7 } = {}) {
  if (CONFIG.DEMO_MODE) {
    return {
      ok: true, mode: 'demo',
      period_days,
      total_revenue: '₫200M',
      drops_live: 23,
      sell_through: '76%',
      ai_accuracy: '94%',
      top_style: 'Minimalist',
      revenue_7d: [38, 52, 47, 91, 78, 114, 143],
      orders_7d: [4, 6, 5, 9, 7, 12, 15],
      summary: '7-day revenue up +34% vs prior week. Minimalist style leads. 3 orders in production.'
    };
  }
  const cutoff = new Date(Date.now() - period_days * 86400000).toISOString().split('T')[0];
  const raw = await erpFetch(`/api/resource/Sales Order?filters=[["creation",">=","${cutoff}"]]&fields=["grand_total","creation","status","custom_creator"]&limit_page_length=0`);
  const total = raw.reduce((s, o) => s + (o.grand_total || 0), 0);
  const active = raw.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
  return {
    ok: true, mode: 'live', period_days,
    total_revenue: total >= 1e6 ? `₫${Math.round(total/1e6)}M` : `₫${Math.round(total/1000)}k`,
    drops_live: active,
    total_orders: raw.length,
    sell_through: '–',
    ai_accuracy: '94%'
  };
}

async function drip_creator_feed({ style, status, limit = 5 } = {}) {
  if (CONFIG.DEMO_MODE) {
    let data = [...MOCK_FEED];
    if (style)  data = data.filter(p => p.style === style);
    if (status) data = data.filter(p => p.status === status);
    return { ok: true, mode: 'demo', count: Math.min(limit, data.length), data: data.slice(0, limit) };
  }
  // In live mode, query Sales Orders grouped by custom_creator
  const raw = await erpFetch(`/api/resource/Sales Order?fields=["custom_creator","grand_total","status","name"]&limit_page_length=100&order_by=grand_total desc`);
  const map = {};
  raw.forEach(o => {
    const c = o.custom_creator || 'unknown';
    if (!map[c]) map[c] = { creator: c, drops: 0, revenue: 0 };
    map[c].drops++;
    map[c].revenue += o.grand_total || 0;
  });
  const data = Object.values(map)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map(c => ({ ...c, revenue: `₫${Math.round(c.revenue/1e6)}M` }));
  return { ok: true, mode: 'live', count: data.length, data };
}

/* ═══════════════════════════════════════════════════════════════════
   HTTP SERVER
═══════════════════════════════════════════════════════════════════ */
const TOOLS = {
  drip_get_trends,
  drip_get_factories,
  drip_get_orders,
  drip_place_order,
  drip_get_analytics,
  drip_creator_feed,
};

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // Health check
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true, service: 'drip-openclaw-tools', mode: CONFIG.DEMO_MODE ? 'demo' : 'live', tools: Object.keys(TOOLS) }));
    return;
  }

  const toolName = req.url.replace(/^\//, '').split('?')[0];
  const handler  = TOOLS[toolName];

  if (!handler) {
    res.writeHead(404);
    res.end(JSON.stringify({ ok: false, error: `Unknown tool: ${toolName}`, available: Object.keys(TOOLS) }));
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end(JSON.stringify({ ok: false, error: 'Use POST with JSON body' }));
    return;
  }

  let body = '';
  req.on('data', d => body += d);
  req.on('end', async () => {
    let params = {};
    try { if (body.trim()) params = JSON.parse(body); } catch {}
    try {
      const result = await handler(params);
      res.writeHead(200);
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
  });
});

server.listen(CONFIG.PORT, '127.0.0.1', () => {
  const mode = CONFIG.DEMO_MODE ? '🎭 DEMO mode (mock data)' : `🟢 LIVE mode → ${CONFIG.ERP_URL}`;
  console.log(`\n🦞 DRIP × OpenClaw Tool Server`);
  console.log(`   Port : http://127.0.0.1:${CONFIG.PORT}`);
  console.log(`   Mode : ${mode}`);
  console.log(`   Tools: ${Object.keys(TOOLS).join(', ')}`);
  console.log(`\n   Set DRIP_DEMO_MODE=false + DRIP_ERP_URL/KEY/SECRET to go live.\n`);
});

process.on('SIGTERM', () => { server.close(); process.exit(0); });
process.on('SIGINT',  () => { server.close(); process.exit(0); });
