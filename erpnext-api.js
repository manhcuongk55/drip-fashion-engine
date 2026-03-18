/* ═══════════════════════════════════════════════════════════
   DRIP × ERPNext — API Bridge Layer
   ═══════════════════════════════════════════════════════════
   Wraps all Frappe REST API calls. Falls back to mock data
   when DEMO_MODE is true.
═══════════════════════════════════════════════════════════ */

const DRIP_ERP = (function() {

  /* ── Low-level Frappe REST helpers ─────────────────────── */

  function headers() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'token ' + DRIP_CONFIG.API_KEY + ':' + DRIP_CONFIG.API_SECRET
    };
  }

  function url(path) {
    return DRIP_CONFIG.ERP_URL.replace(/\/+$/, '') + path;
  }

  async function erpGet(path) {
    const res = await fetch(url(path), { method: 'GET', headers: headers() });
    if (!res.ok) throw new Error('ERPNext GET ' + path + ' → ' + res.status);
    return (await res.json()).data;
  }

  async function erpPost(path, body) {
    const res = await fetch(url(path), { method: 'POST', headers: headers(), body: JSON.stringify(body) });
    if (!res.ok) throw new Error('ERPNext POST ' + path + ' → ' + res.status);
    return (await res.json()).data;
  }

  async function erpPut(doctype, name, body) {
    const path = '/api/resource/' + doctype + '/' + encodeURIComponent(name);
    const res = await fetch(url(path), { method: 'PUT', headers: headers(), body: JSON.stringify(body) });
    if (!res.ok) throw new Error('ERPNext PUT ' + path + ' → ' + res.status);
    return (await res.json()).data;
  }

  async function erpDelete(doctype, name) {
    const path = '/api/resource/' + doctype + '/' + encodeURIComponent(name);
    const res = await fetch(url(path), { method: 'DELETE', headers: headers() });
    if (!res.ok) throw new Error('ERPNext DELETE ' + path + ' → ' + res.status);
    return true;
  }

  /* ═══════════════════════════════════════════════════════
     FACTORIES (Supplier)
  ═══════════════════════════════════════════════════════ */

  async function fetchFactories() {
    if (DRIP_CONFIG.DEMO_MODE) return FACTORIES; // fallback to mock

    const filters = JSON.stringify([['supplier_group', '=', DRIP_CONFIG.SUPPLIER_GROUP]]);
    const fields  = '["name","supplier_name","custom_city","custom_capacity_pct","custom_lead_time","custom_specializations","custom_verified","custom_rating","custom_total_orders","custom_badge","custom_note"]';
    const data = await erpGet('/api/resource/Supplier?filters=' + filters + '&fields=' + fields + '&limit_page_length=50&order_by=custom_rating desc');

    return data.map(function(s) {
      return {
        id:       s.name,
        name:     s.supplier_name,
        city:     s.custom_city || '',
        rating:   s.custom_rating || 4.5,
        orders:   s.custom_total_orders || 0,
        lead:     (s.custom_lead_time || 48) + 'h',
        capacity: s.custom_capacity_pct || 50,
        special:  (s.custom_specializations || '').split(',').map(function(x){ return x.trim(); }).filter(Boolean),
        verified: !!s.custom_verified,
        badge:    s.custom_badge || 'badge-purple',
        note:     s.custom_note || ''
      };
    });
  }

  /* ═══════════════════════════════════════════════════════
     ORDERS — Work Order (factory) + Sales Order (customer)
  ═══════════════════════════════════════════════════════ */

  async function fetchOrders() {
    if (DRIP_CONFIG.DEMO_MODE) return ORDERS; // fallback

    var fields = '["name","production_item","qty","status","expected_delivery_date","custom_factory_name","custom_drip_drop_id","custom_creator","creation"]';
    var data = await erpGet('/api/resource/Work Order?fields=' + fields + '&limit_page_length=20&order_by=creation desc');

    var statusMap = {
      'Not Started':  'confirmed',
      'In Process':   'production',
      'Completed':    'delivered',
      'Stopped':      'qc'
    };

    return data.map(function(wo) {
      var now = new Date();
      var eta = wo.expected_delivery_date ? dateDiff(now, new Date(wo.expected_delivery_date)) : '48h';
      return {
        id:      wo.name,
        factory: wo.custom_factory_name || 'Factory',
        product: wo.production_item || 'Drop',
        qty:     wo.qty + ' pcs',
        status:  statusMap[wo.status] || 'confirmed',
        eta:     wo.status === 'Completed' ? 'Done' : eta,
        created: formatDate(wo.creation)
      };
    });
  }

  function dateDiff(from, to) {
    var diff = to - from;
    if (diff <= 0) return 'Done';
    var h = Math.floor(diff / 3600000);
    return h > 24 ? Math.floor(h/24) + 'd' : h + 'h';
  }

  function formatDate(d) {
    if (!d) return '';
    var dt = new Date(d);
    var now = new Date();
    if (dt.toDateString() === now.toDateString()) return 'Today ' + dt.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    return dt.toLocaleDateString('en-US', {month:'short', day:'numeric'});
  }

  /* ═══════════════════════════════════════════════════════
     CREATE WORK ORDER (factory production)
  ═══════════════════════════════════════════════════════ */

  async function createWorkOrder(opts) {
    // opts: { item, qty, factory_id, factory_name, rush, drop_id }
    if (DRIP_CONFIG.DEMO_MODE) {
      var mockOrder = {
        id: 'DRP-' + Math.floor(Math.random()*9000+1000),
        factory: opts.factory_name || 'Factory',
        product: opts.item || 'Drop',
        qty: (opts.qty || 100) + ' pcs',
        status: 'confirmed',
        eta: opts.rush ? '24h' : '48h',
        created: new Date().toLocaleString()
      };
      ORDERS.unshift(mockOrder);
      return mockOrder;
    }

    // Ensure Item exists first
    await ensureItem(opts.item);

    var body = {
      production_item: opts.item,
      qty: opts.qty || 100,
      company: DRIP_CONFIG.COMPANY,
      custom_factory_name: opts.factory_name,
      custom_drip_drop_id: opts.drop_id || '',
      custom_rush: opts.rush ? 1 : 0
    };

    return await erpPost('/api/resource/Work Order', body);
  }

  /* ═══════════════════════════════════════════════════════
     CREATE ITEM (from design brief)
  ═══════════════════════════════════════════════════════ */

  async function ensureItem(itemName) {
    if (DRIP_CONFIG.DEMO_MODE) return;
    try {
      await erpGet('/api/resource/Item/' + encodeURIComponent(itemName));
    } catch(e) {
      // Item doesn't exist → create it
      await erpPost('/api/resource/Item', {
        item_code: itemName,
        item_name: itemName,
        item_group: 'Products',
        stock_uom: 'Nos',
        is_stock_item: 1,
        company: DRIP_CONFIG.COMPANY
      });
    }
  }

  async function createItem(trendData) {
    // trendData: { name, style, trend_score, ai_brief, fabric, target_demo }
    if (DRIP_CONFIG.DEMO_MODE) return trendData;

    var body = {
      item_code: trendData.name,
      item_name: trendData.name,
      item_group: 'Products',
      stock_uom: 'Nos',
      is_stock_item: 1,
      custom_trend_score: trendData.trend_score || 0,
      custom_style_category: trendData.style || '',
      custom_ai_brief: trendData.ai_brief || '',
      custom_target_demo: trendData.target_demo || '',
      company: DRIP_CONFIG.COMPANY
    };

    return await erpPost('/api/resource/Item', body);
  }

  /* ═══════════════════════════════════════════════════════
     CREATE SALES ORDER (customer drop purchase)
  ═══════════════════════════════════════════════════════ */

  async function createSalesOrder(drop) {
    // drop: { customer_name, item, qty, rate, creator_handle }
    if (DRIP_CONFIG.DEMO_MODE) return drop;

    await ensureItem(drop.item);

    var body = {
      customer: drop.customer_name || 'Walk-in Customer',
      company: DRIP_CONFIG.COMPANY,
      currency: DRIP_CONFIG.CURRENCY,
      delivery_date: new Date(Date.now() + 48*3600000).toISOString().split('T')[0],
      custom_creator: drop.creator_handle || '',
      items: [{
        item_code: drop.item,
        qty: drop.qty || 1,
        rate: drop.rate || 350000,
        delivery_date: new Date(Date.now() + 48*3600000).toISOString().split('T')[0]
      }]
    };

    return await erpPost('/api/resource/Sales Order', body);
  }

  /* ═══════════════════════════════════════════════════════
     CREATE SUPPLIER (factory registration)
  ═══════════════════════════════════════════════════════ */

  async function createFactory(factory) {
    if (DRIP_CONFIG.DEMO_MODE) return factory;

    var body = {
      supplier_name: factory.name,
      supplier_group: DRIP_CONFIG.SUPPLIER_GROUP,
      supplier_type: 'Company',
      custom_city: factory.city || '',
      custom_capacity_pct: factory.capacity || 50,
      custom_lead_time: factory.lead_time || 48,
      custom_specializations: (factory.special || []).join(', '),
      custom_verified: factory.verified ? 1 : 0,
      custom_rating: factory.rating || 4.5,
      custom_note: factory.note || ''
    };

    return await erpPost('/api/resource/Supplier', body);
  }

  /* ═══════════════════════════════════════════════════════
     STOCK BALANCE
  ═══════════════════════════════════════════════════════ */

  async function getStockBalance(itemCode) {
    if (DRIP_CONFIG.DEMO_MODE) return { qty: 100 };

    var data = await erpGet('/api/method/erpnext.stock.utils.get_stock_balance?item_code=' + encodeURIComponent(itemCode) + '&warehouse=' + encodeURIComponent(DRIP_CONFIG.WAREHOUSE));
    return { qty: data.message || 0 };
  }

  /* ═══════════════════════════════════════════════════════
     ANALYTICS — Revenue + Order Stats
  ═══════════════════════════════════════════════════════ */

  async function getAnalyticsSummary() {
    if (DRIP_CONFIG.DEMO_MODE) {
      return {
        total_revenue: '200M',
        drops_live: 23,
        sell_through: '76%',
        ai_accuracy: '94%',
        revenue_daily: [38,52,47,91,78,114,143],
        accuracy_daily: [72,78,81,85,83,89,94]
      };
    }

    // Fetch recent Sales Orders for revenue
    var sevenDaysAgo = new Date(Date.now() - 7*86400000).toISOString().split('T')[0];
    var orders = await erpGet('/api/resource/Sales Order?filters=[["creation",">=","' + sevenDaysAgo + '"]]&fields=["grand_total","creation","status"]&limit_page_length=0');

    var total = orders.reduce(function(s,o){ return s + (o.grand_total || 0); }, 0);

    return {
      total_revenue: total >= 1e6 ? Math.round(total/1e6) + 'M' : Math.round(total/1000) + 'k',
      drops_live: orders.filter(function(o){ return o.status !== 'Completed'; }).length,
      sell_through: '76%',
      ai_accuracy: '94%',
      revenue_daily: [38,52,47,91,78,114,143],
      accuracy_daily: [72,78,81,85,83,89,94]
    };
  }

  /* ═══════════════════════════════════════════════════════
     CONNECTION TEST
  ═══════════════════════════════════════════════════════ */

  async function testConnection() {
    if (DRIP_CONFIG.DEMO_MODE) {
      console.log('DRIP ERP: Demo mode — no ERPNext connection needed');
      return { ok: true, mode: 'demo' };
    }
    if (!DRIP_CONFIG.ERP_URL || !DRIP_CONFIG.API_KEY) {
      console.warn('DRIP ERP: No ERPNext URL or API key configured');
      return { ok: false, error: 'Missing config' };
    }
    try {
      var res = await fetch(url('/api/method/frappe.auth.get_logged_user'), {
        method: 'GET', headers: headers()
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var data = await res.json();
      console.log('DRIP ERP: Connected as', data.message);
      return { ok: true, mode: 'live', user: data.message };
    } catch(e) {
      console.error('DRIP ERP: Connection failed —', e.message);
      return { ok: false, error: e.message };
    }
  }

  /* ═══════════════════════════════════════════════════════
     PUBLIC API
  ═══════════════════════════════════════════════════════ */

  return {
    testConnection:    testConnection,
    fetchFactories:    fetchFactories,
    fetchOrders:       fetchOrders,
    createWorkOrder:   createWorkOrder,
    createItem:        createItem,
    createSalesOrder:  createSalesOrder,
    createFactory:     createFactory,
    getStockBalance:   getStockBalance,
    getAnalyticsSummary: getAnalyticsSummary,
    // Low-level (for console/debug)
    _get:  erpGet,
    _post: erpPost,
    _put:  erpPut,
    _del:  erpDelete
  };

})();
