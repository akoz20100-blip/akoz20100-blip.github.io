import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SERVER_NAME, SERVER_VERSION } from "./config.js";
import { DataStore } from "./data/store.js";
import { dataOverview } from "./data/analytics.js";
import { registerTools } from "./tools.js";

const INSTRUCTIONS = `This server exposes the PSMMC military hospital pharmacy stock, reorder and expiry dashboard.

Use it to answer natural-language questions about pharmacy inventory:
- "top 10 medications withdrawn from the main store" -> top_withdrawn_medications
- "which planner has the most expired medication" -> planner_expiry_ranking
- "what is below reorder point" -> reorder_suggestions
- "what is expiring in 90 days" -> expiry_batches
- "how are issues split by department" -> withdrawals_breakdown

Call data_overview first to learn the available stores, planners and date range.
All monetary values are in Saudi Riyal (SAR). "Effective stock" excludes expired batches.`;

const DATA_DICTIONARY = `# PSMMC Pharmacy Dashboard — Data Dictionary

Entities:
- medication: id, code, genericName, brandName, form, strength, atcClass, unit, plannerId, unitCost (SAR)
- store: id, name, nameAr, isMain (the central "Main Store")
- planner: id, name, section (the buyer who owns a set of medications)
- stockBatch: medicationId, storeId, batchNo, qtyOnHand, expiryDate, unitCost
- reorderParam: medicationId, storeId, parLevel, reorderPoint, avgMonthlyConsumption, leadTimeDays
- withdrawal: date, medicationId, fromStoreId, toDept, qty  (stock issued from a store to a department)

Key concepts:
- Effective stock = sum of qtyOnHand across batches whose expiryDate >= today.
- Expired stock  = batches whose expiryDate < today (counted but not "effective").
- Below reorder  = effective on-hand <= reorderPoint for that (medication, store).
- Planner expiry exposure = total expired/expiring value or quantity for the medications a planner owns.

Currency: SAR.`;

export interface BuildServerOptions {
  store: DataStore;
}

/** Construct a fully-wired MCP server (tools + resources) over the dataset. */
export function buildServer({ store }: BuildServerOptions): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { instructions: INSTRUCTIONS },
  );

  registerTools(server, store);

  server.registerResource(
    "data-dictionary",
    "psmmc://schema",
    {
      title: "Data dictionary",
      description: "Entities, fields and key concepts of the PSMMC pharmacy dashboard.",
      mimeType: "text/markdown",
    },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: DATA_DICTIONARY }] }),
  );

  server.registerResource(
    "overview",
    "psmmc://overview",
    {
      title: "Live dashboard overview",
      description: "Current counts, stores, planners, date range, and stock value snapshot.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        { uri: uri.href, mimeType: "application/json", text: JSON.stringify(dataOverview(store), null, 2) },
      ],
    }),
  );

  return server;
}
