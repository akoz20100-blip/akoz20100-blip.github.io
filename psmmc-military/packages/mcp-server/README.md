# PSMMC Pharmacy Dashboard — Remote MCP Server

خادم **MCP** عن بُعد لـ **لوحة مخزون وصرف وانتهاء صلاحية الأدوية** في مستشفى قوى الأمن الطبي (PSMMC).
يتيح لأي شخص لديه **Claude** (على الكمبيوتر أو الجوال) أن يسأل أسئلة بلغة طبيعية عن بيانات اللوحة — بدون أي برمجة.

A remote **Model Context Protocol (MCP)** server that turns the PSMMC pharmacy stock /
reorder / expiry dashboard into something you can **talk to** from Claude on desktop or phone.
Share one link with your customer and they can ask questions like:

| Question | Tool used |
|----------|-----------|
| “Top 10 medications withdrawn from the main store” | `top_withdrawn_medications` |
| “Which planner has the most expired medication?” | `planner_expiry_ranking` |
| “What is below reorder point in the ICU pharmacy?” | `reorder_suggestions` |
| “What is expiring in the next 90 days, by value?” | `expiry_batches` |
| “Break the issues down by department this quarter” | `withdrawals_breakdown` |
| “Stock status of meropenem” | `stock_status` |

---

## 1. Quick start / البدء السريع

```bash
cd psmmc-military/packages/mcp-server
npm install && npm run build && npm test && npm run seed
```

- `npm run build` — compiles TypeScript to `dist/`.
- `npm test` — 25 tests covering the analytics and the MCP wiring.
- `npm run seed` — writes the bundled **synthetic demo dataset** to `data/` (safe to publish; no real patient data).

The server already works with the demo data. To use your **real** dashboard export, see [§5](#5-using-your-real-data--استخدام-بياناتك-الحقيقية).

---

## 2. 💻 Computer — Claude Desktop (stdio)

Add this block to your **`claude_desktop_config.json`**
(`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS,
`%APPDATA%\Claude\claude_desktop_config.json` on Windows), then restart Claude Desktop:

```json
{
  "mcpServers": {
    "psmmc": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/psmmc-military/packages/mcp-server/dist/index.js",
        "--stdio"
      ]
    }
  }
}
```

> Replace `/ABSOLUTE/PATH/TO/...` with the real path on your machine (run `pwd` inside the
> `mcp-server` folder to get it). No token is needed for the local stdio connection.

Once restarted, ask Claude Desktop: *“Using psmmc, what are the top 10 withdrawn medications from the main store?”*

---

## 3. 📱 Phone / Web — Claude custom connector (remote HTTP)

To use it from the **Claude mobile app** or **claude.ai**, the server must be reachable over the
internet. Deploy it once ([§4](#4-deploy-the-remote-server--نشر-الخادم)), then:

1. Pick a strong token and start the HTTP transport:
   ```bash
   PSMMC_MCP_TOKEN=your-long-random-secret npm run start:http
   ```
   On startup it prints your ready-to-share URL.
2. In Claude → **Settings → Connectors → Add custom connector**.
3. Paste the connector URL — the token is embedded in the path so it is a single URL:
   ```
   https://YOUR-HOST/your-long-random-secret/mcp
   ```
   (Equivalently, use `https://YOUR-HOST/mcp` and send the token as an `Authorization: Bearer` header.)
4. Save. Now ask from your phone: *“Which planner has the most expired medication?”*

> 🔐 Anyone with that URL/token can read the dashboard. Treat it like a password; rotate it by
> changing `PSMMC_MCP_TOKEN` and restarting.

---

## 4. Deploy the remote server / نشر الخادم

Any host that runs Node 18+ works. The endpoint is **stateless Streamable HTTP**, so it scales fine.

### Option A — Docker (any VM / Render / Railway / Fly)
```bash
docker build -t psmmc-mcp .
docker run -p 8787:8787 -e PSMMC_MCP_TOKEN=your-long-random-secret psmmc-mcp
# connector URL: https://your-host/your-long-random-secret/mcp
```

### Option B — Vercel
`vercel.json` and `api/index.ts` are included. From this folder:
```bash
npm i -g vercel
vercel deploy --prod
# set the env var in the Vercel dashboard or:
vercel env add PSMMC_MCP_TOKEN
```
Vercel gives you `https://<project>.vercel.app`; the connector URL is
`https://<project>.vercel.app/<token>/mcp`.

### Option C — plain Node host
```bash
npm install && npm run build && npm run seed
PSMMC_MCP_TOKEN=your-long-random-secret PORT=8787 npm run start:http
```
Put it behind any HTTPS reverse proxy (nginx/Caddy) or a tunnel (`cloudflared`, `ngrok`) for a public URL.

---

## 5. Using your real data / استخدام بياناتك الحقيقية

The server loads data in this priority order:

1. `dataset.json` in the data directory (a single normalized file).
2. one CSV per entity in the data directory: `medications.csv`, `stores.csv`, `planners.csv`,
   `batches.csv`, `reorder.csv`, `withdrawals.csv` (same columns the seed writes — open the files in
   `data/` to see the exact headers).
3. the built-in synthetic demo dataset (fallback).

To plug in the **real PSMMC export** without committing patient data:

```bash
mkdir -p data/private          # git-ignored
# copy your real CSV/JSON exports into data/private/
PSMMC_DATA_DIR=./data/private PSMMC_MCP_TOKEN=your-secret npm run start:http
```

The schema is defined in [`src/data/schema.ts`](src/data/schema.ts). Match those columns and the
analytics, search and connector all work unchanged.

---

## 6. Tools exposed to Claude / الأدوات

| Tool | What it answers |
|------|-----------------|
| `data_overview` | Counts, stores, planners, date range, stock & expired value. **Start here.** |
| `search_dashboard` | Free-text search over medications / stores / planners. |
| `top_withdrawn_medications` | Ranked withdrawals, by store and date range. |
| `planner_expiry_ranking` | Which planner owns the most expired / expiring stock. |
| `expiry_batches` | Individual expired / expiring batches, most urgent first. |
| `reorder_suggestions` | Items at/below reorder point + suggested order quantity. |
| `stock_status` | Effective vs. expired on-hand for one medication, by store. |
| `consumption_trend` | Monthly issue trend for one medication. |
| `stock_valuation` | SAR value of effective stock by store / planner / ATC class. |
| `withdrawals_breakdown` | Ad-hoc grouping of issues by department / store / planner / ATC / medication / month. |
| `list_stores`, `list_planners` | Reference lists. |

Resources: `psmmc://schema` (data dictionary) and `psmmc://overview` (live snapshot).

---

## 7. Notes / ملاحظات

- All monetary values are in **SAR**. “Effective stock” excludes expired batches.
- The bundled demo data is **synthetic** (fictional names, generated quantities) and safe to share.
- `data/private/` is git-ignored — keep any real Protected Health Information there, never in git.
- Local stdio needs no token; the remote HTTP endpoint **requires** `PSMMC_MCP_TOKEN`.

### Commands recap
```bash
npm run build        # compile
npm test             # run the test suite
npm run seed         # (re)generate the demo dataset into data/
npm run start:stdio  # local transport for Claude Desktop
npm run start:http   # remote transport for the custom connector
npm run dev          # http transport with hot reload
```
