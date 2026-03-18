/* ═══════════════════════════════════════════════════════════
   DRIP × ERPNext — Configuration
   ═══════════════════════════════════════════════════════════
   Toggle DEMO_MODE to switch between mock data and live ERPNext.
   When DEMO_MODE = true, the app uses built-in mock data (default).
   When DEMO_MODE = false, the app calls your ERPNext REST API.
═══════════════════════════════════════════════════════════ */

const DRIP_CONFIG = {
  // ── ERPNext Connection ────────────────────────────────
  ERP_URL:     '',   // e.g. 'https://your-site.frappe.cloud'
  API_KEY:     '',   // ERPNext API Key
  API_SECRET:  '',   // ERPNext API Secret

  // ── Mode ──────────────────────────────────────────────
  DEMO_MODE:   true, // true = mock data, false = live ERPNext

  // ── Defaults ──────────────────────────────────────────
  COMPANY:        'DRIP Fashion',
  SUPPLIER_GROUP: 'DRIP Factory',
  WAREHOUSE:      'Finished Goods - DF',
  CURRENCY:       'VND',

  // ── Frappe Doctype Names ──────────────────────────────
  DOCTYPE: {
    ITEM:           'Item',
    SUPPLIER:       'Supplier',
    CUSTOMER:       'Customer',
    SALES_ORDER:    'Sales Order',
    PURCHASE_ORDER: 'Purchase Order',
    WORK_ORDER:     'Work Order',
    STOCK_ENTRY:    'Stock Entry',
    BOM:            'BOM',
  }
};

/* ── Load saved config from localStorage if available ──── */
(function loadSavedConfig() {
  try {
    const saved = localStorage.getItem('drip_erp_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.ERP_URL)    DRIP_CONFIG.ERP_URL    = parsed.ERP_URL;
      if (parsed.API_KEY)    DRIP_CONFIG.API_KEY    = parsed.API_KEY;
      if (parsed.API_SECRET) DRIP_CONFIG.API_SECRET = parsed.API_SECRET;
      if (typeof parsed.DEMO_MODE === 'boolean') DRIP_CONFIG.DEMO_MODE = parsed.DEMO_MODE;
    }
  } catch(e) { /* ignore */ }
})();

function saveConfig() {
  localStorage.setItem('drip_erp_config', JSON.stringify({
    ERP_URL:    DRIP_CONFIG.ERP_URL,
    API_KEY:    DRIP_CONFIG.API_KEY,
    API_SECRET: DRIP_CONFIG.API_SECRET,
    DEMO_MODE:  DRIP_CONFIG.DEMO_MODE,
  }));
}
