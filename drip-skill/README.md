# 🦞 DRIP × OpenClaw Skill

Connect your DRIP AI Fashion platform to any messaging channel (Telegram, WhatsApp, Zalo, Slack, Discord) using the [OpenClaw](https://github.com/openclaw/openclaw) personal AI assistant gateway.

## What this does

Your DRIP AI agent can now answer on the channels you use:

| You say | Agent does |
|---|---|
| "Top trends today?" | Fetches Trend Radar → top 5 by AI score |
| "Show factories with 48h lead time" | Lists factory network with capacity |
| "Status of my orders" | Shows recent Work Orders + ETA |
| "Order 100 blazers at Saigon Thread Co." | Creates Work Order in ERPNext |
| "/drip analytics" | 7-day revenue + performance stats |
| "Who are the top creators this week?" | Creator feed with engagement |

---

## Quick Setup

### 1. Install OpenClaw

```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

### 2. Start the DRIP Tool Server

```bash
cd drip-skill/
# Demo mode (mock data, no ERPNext needed)
npm run dev
# → 🦞 DRIP Tool Server running at http://127.0.0.1:3847
```

### 3. Add the Skill to OpenClaw

Open your OpenClaw workspace skills folder (default: `~/.openclaw/<workspace>/skills/`) and copy this skill:

```bash
cp -r drip-skill/ ~/.openclaw/skills/drip
```

Or add the skill directory in your `openclaw.json`:
```json
{
  "skills": {
    "load": {
      "extraDirs": ["/path/to/drip/drip-skill"]
    }
  }
}
```

### 4. Set Environment Variables

For **demo mode** (no ERPNext required):
```bash
export DRIP_DEMO_MODE=true
export DRIP_TOOL_SERVER=http://127.0.0.1:3847
```

For **live ERPNext** mode:
```bash
export DRIP_DEMO_MODE=false
export DRIP_ERP_URL=https://your-site.frappe.cloud
export DRIP_API_KEY=your_api_key
export DRIP_API_SECRET=your_api_secret
export DRIP_TOOL_SERVER=http://127.0.0.1:3847
```

### 5. Connect a Channel

```bash
# Telegram (easiest)
openclaw channel add telegram

# Zalo (Vietnam)
openclaw channel add zalo

# WhatsApp
openclaw channel add whatsapp
```

Then start chatting with your DRIP agent on the channel 🎉

---

## Slash Commands

Once connected, use these slash commands in any channel:

| Command | Description |
|---|---|
| `/drip trends [N]` | Top N trends (default: 5) |
| `/drip factories` | All factories + capacity |
| `/drip orders` | Recent orders |
| `/drip analytics` | 7-day revenue stats |
| `/drip creators` | Top creator drops |

Or just talk naturally — the agent understands Vietnamese and English!

---

## Architecture

```
Channel (Telegram / Zalo / WhatsApp)
    │
    ▼
OpenClaw Gateway (ws://127.0.0.1:18789)
    │  reads SKILL.md → injects system prompt + tool schemas
    ▼
Pi Agent (LLM — GPT-4o / Claude / Gemini)
    │  calls tools via HTTP POST
    ▼
tools.js (http://127.0.0.1:3847)
    │  demo: mock data
    │  live: ERPNext REST API
    ▼
ERPNext (Frappe Cloud / self-hosted)
```

---

## Tool Server API

The tool server listens on `http://127.0.0.1:3847` (or `DRIP_TOOL_PORT`).

### `POST /drip_get_trends`
```json
{ "limit": 5, "style": "Minimalist" }
```

### `POST /drip_get_factories`
```json
{ "min_capacity": 40, "specialization": "Denim", "max_lead_hours": 48 }
```

### `POST /drip_get_orders`
```json
{ "status": "production", "limit": 5 }
```

### `POST /drip_place_order`
```json
{ "item": "Oversized Linen Blazer", "qty": 100, "factory_name": "Saigon Thread Co.", "rush": false }
```

### `POST /drip_get_analytics`
```json
{ "period_days": 7 }
```

### `POST /drip_creator_feed`
```json
{ "style": "minimal", "status": "live", "limit": 5 }
```

### `GET /health`
```json
{ "ok": true, "service": "drip-openclaw-tools", "mode": "demo", "tools": [...] }
```

---

## Example Conversations

**Telegram session:**
```
You: What's trending in Vietnamese fashion right now?
DRIP: 🔥 Top Trends — Vietnamese Style:
  📊 Bamboo Silk Áo Dài Remix — AI Score: 76 | 1.2M views | +310/h
  📊 Linen Co-ord Set Earth Tones — AI Score: 88 | 2.4M views | +620/h
  Want to design a brief or place a factory order?

You: Order 50 pieces of the Áo Dài Remix at Hue Silk Atelier
DRIP: ✅ Order Confirmed!
  🆔 DRP-4821 | 🏭 Hue Silk Atelier | 50 pcs
  ⏱ ETA: 72h | Status: Confirmed
  Track this order anytime with /drip orders
```

---

## Supported LLMs

Works with any model supported by OpenClaw:
- OpenAI GPT-4o / GPT-4.1
- Anthropic Claude 3.5 / 3.7
- Google Gemini 2.0 Flash

---

## License

MIT — part of the DRIP Platform
