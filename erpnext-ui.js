/* ═══════════════════════════════════════════════════════════
   DRIP × ERPNext — UI Controller (Settings Modal)
═══════════════════════════════════════════════════════════ */

/* ── Settings Modal ──────────────────────────────────────── */

function openSettings() {
  document.getElementById('settings-modal').classList.add('open');
  // populate fields from config
  document.getElementById('cfg-url').value    = DRIP_CONFIG.ERP_URL;
  document.getElementById('cfg-key').value    = DRIP_CONFIG.API_KEY;
  document.getElementById('cfg-secret').value = DRIP_CONFIG.API_SECRET;
  var dt = document.getElementById('demo-toggle');
  if (DRIP_CONFIG.DEMO_MODE) { dt.classList.add('on'); } else { dt.classList.remove('on'); }
  document.getElementById('conn-result').style.display = 'none';
}

function closeSettings() {
  document.getElementById('settings-modal').classList.remove('open');
}

function toggleDemo(el) {
  el.classList.toggle('on');
}

async function testERPConnection() {
  var result = document.getElementById('conn-result');
  result.style.display = 'block';
  result.style.background = 'rgba(255,255,255,0.03)';
  result.style.border = '1px solid var(--border)';
  result.style.color = 'var(--text-secondary)';
  result.textContent = '⏳ Testing connection...';

  // temporarily apply fields
  var origUrl = DRIP_CONFIG.ERP_URL;
  var origKey = DRIP_CONFIG.API_KEY;
  var origSec = DRIP_CONFIG.API_SECRET;
  var origDemo = DRIP_CONFIG.DEMO_MODE;

  DRIP_CONFIG.ERP_URL    = document.getElementById('cfg-url').value.trim();
  DRIP_CONFIG.API_KEY    = document.getElementById('cfg-key').value.trim();
  DRIP_CONFIG.API_SECRET = document.getElementById('cfg-secret').value.trim();
  DRIP_CONFIG.DEMO_MODE  = document.getElementById('demo-toggle').classList.contains('on');

  var res = await DRIP_ERP.testConnection();

  if (res.ok) {
    if (res.mode === 'demo') {
      result.style.background = 'rgba(0,255,136,0.06)';
      result.style.border = '1px solid rgba(0,255,136,0.2)';
      result.style.color = 'var(--neon-green)';
      result.textContent = '✅ Demo mode active — using mock data';
    } else {
      result.style.background = 'rgba(0,255,136,0.06)';
      result.style.border = '1px solid rgba(0,255,136,0.2)';
      result.style.color = 'var(--neon-green)';
      result.textContent = '✅ Connected to ERPNext as ' + (res.user || 'API user');
    }
  } else {
    result.style.background = 'rgba(255,0,122,0.06)';
    result.style.border = '1px solid rgba(255,0,122,0.2)';
    result.style.color = 'var(--neon-pink)';
    result.textContent = '❌ Connection failed: ' + (res.error || 'Unknown error');
  }

  // restore (don't persist until Save)
  DRIP_CONFIG.ERP_URL    = origUrl;
  DRIP_CONFIG.API_KEY    = origKey;
  DRIP_CONFIG.API_SECRET = origSec;
  DRIP_CONFIG.DEMO_MODE  = origDemo;
}

function saveERPSettings() {
  DRIP_CONFIG.ERP_URL    = document.getElementById('cfg-url').value.trim();
  DRIP_CONFIG.API_KEY    = document.getElementById('cfg-key').value.trim();
  DRIP_CONFIG.API_SECRET = document.getElementById('cfg-secret').value.trim();
  DRIP_CONFIG.DEMO_MODE  = document.getElementById('demo-toggle').classList.contains('on');

  saveConfig(); // persist to localStorage
  updateERPIndicator();
  closeSettings();
  showToast('💾 Settings Saved', DRIP_CONFIG.DEMO_MODE ? 'Demo mode — using mock data' : 'Live mode — connected to ERPNext');

  // re-render data-driven pages
  if (typeof renderFactories === 'function') reloadFactories();
  if (typeof renderOrders === 'function') reloadOrders();
}

/* ── Nav Indicator (green/red dot) ───────────────────────── */

function updateERPIndicator() {
  var dot   = document.getElementById('erp-dot');
  var label = document.getElementById('erp-label');
  if (DRIP_CONFIG.DEMO_MODE) {
    dot.style.background = 'var(--neon-green)';
    label.textContent = 'Demo';
  } else if (DRIP_CONFIG.ERP_URL) {
    dot.style.background = 'var(--accent)';
    label.textContent = 'ERPNext';
  } else {
    dot.style.background = 'var(--neon-pink)';
    label.textContent = 'No ERP';
  }
}

/* ── Async data reload helpers ───────────────────────────── */

async function reloadFactories() {
  try {
    var data = await DRIP_ERP.fetchFactories();
    if (!DRIP_CONFIG.DEMO_MODE && data.length) {
      // replace the mock FACTORIES array with live data
      FACTORIES.length = 0;
      data.forEach(function(f) { FACTORIES.push(f); });
    }
    renderFactories();
  } catch(e) {
    showToast('⚠️ Factory Load Error', e.message);
    renderFactories(); // fallback to existing mock
  }
}

async function reloadOrders() {
  try {
    var data = await DRIP_ERP.fetchOrders();
    if (!DRIP_CONFIG.DEMO_MODE && data.length) {
      ORDERS.length = 0;
      data.forEach(function(o) { ORDERS.push(o); });
    }
    renderOrders();
  } catch(e) {
    showToast('⚠️ Orders Load Error', e.message);
    renderOrders();
  }
}

/* ── Init ────────────────────────────────────────────────── */
updateERPIndicator();

// Close modal on overlay click
document.getElementById('settings-modal').addEventListener('click', function(e) {
  if (e.target === this) closeSettings();
});
