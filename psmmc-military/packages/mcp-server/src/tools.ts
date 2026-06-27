import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataStore } from "./data/store.js";
import * as A from "./data/analytics.js";

/** Wrap any analytics result as a standard MCP text result carrying JSON. */
function jsonResult(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

/** Map the tool-facing `store` field onto the analytics-facing `storeRef` field. */
function remap<T extends { store?: string }>(args: T): T & { storeRef: string | undefined } {
  return { ...args, storeRef: args.store };
}

/** Run an analytic, converting thrown errors (e.g. ambiguous store) into tool errors. */
function guard(fn: () => unknown) {
  try {
    return jsonResult(fn());
  } catch (err) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: `Error: ${(err as Error).message}` }],
    };
  }
}

const storeRef = z
  .string()
  .optional()
  .describe('Store filter: id ("ST-1"), full name, or partial name (e.g. "main"). Omit for all stores.');
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .describe("ISO date YYYY-MM-DD.");

/**
 * Register all PSMMC dashboard tools on an MCP server. Descriptions are written
 * for the model: they say exactly when to reach for each tool.
 */
export function registerTools(server: McpServer, store: DataStore): void {
  server.registerTool(
    "data_overview",
    {
      title: "Dashboard overview",
      description:
        "Start here. Returns the shape of the PSMMC pharmacy dashboard: record counts, the list of stores and planners, the withdrawal date range, total effective stock value and expired value. Use it to learn what can be asked before calling other tools.",
      inputSchema: {},
    },
    async () => guard(() => A.dataOverview(store)),
  );

  server.registerTool(
    "search_dashboard",
    {
      title: "Search the dashboard",
      description:
        "Free-text search across medications (by name, code, brand, ATC class), stores and planners. Use it to resolve a name the user mentioned into ids before a more specific query.",
      inputSchema: {
        query: z.string().describe("Text to search for, e.g. 'meropenem', 'oncology', 'ER'."),
        limit: z.number().int().positive().max(100).optional(),
      },
    },
    async ({ query, limit }) => guard(() => A.searchDashboard(store, { query, limit })),
  );

  server.registerTool(
    "top_withdrawn_medications",
    {
      title: "Top withdrawn medications",
      description:
        "Ranks medications by how much was withdrawn / issued, optionally for a single store and date range. Answers questions like 'top 10 medications withdrawn from the main store'.",
      inputSchema: {
        store: storeRef,
        from: isoDate,
        to: isoDate,
        limit: z.number().int().positive().max(200).optional().describe("How many to return (default 10)."),
        by: z
          .enum(["quantity", "transactions"])
          .optional()
          .describe("Rank by total quantity issued (default) or by number of transactions."),
      },
    },
    async (args) => guard(() => A.topWithdrawnMedications(store, remap(args))),
  );

  server.registerTool(
    "planner_expiry_ranking",
    {
      title: "Planner expiry ranking",
      description:
        "Ranks planners by their expiry exposure — who owns the most expired (or soon-to-expire) medication, by SAR value or quantity. Answers 'which planner has the most expired medication'.",
      inputSchema: {
        store: storeRef,
        withinDays: z
          .number()
          .int()
          .positive()
          .max(3650)
          .optional()
          .describe("Also include stock expiring within this many days (in addition to already-expired)."),
        includeExpired: z.boolean().optional().describe("Include already-expired stock (default true)."),
        metric: z.enum(["value", "quantity"]).optional().describe("Rank by SAR value (default) or quantity."),
        limit: z.number().int().positive().max(100).optional(),
      },
    },
    async (args) => guard(() => A.plannerExpiryRanking(store, remap(args))),
  );

  server.registerTool(
    "expiry_batches",
    {
      title: "Expired / expiring batches",
      description:
        "Lists individual stock batches that are expired or expiring soon, most urgent first, with quantity and SAR value at risk. Use for 'what is expiring in the next 90 days' style questions.",
      inputSchema: {
        store: storeRef,
        withinDays: z.number().int().positive().max(3650).optional().describe("Include batches expiring within N days."),
        includeExpired: z.boolean().optional().describe("Include already-expired batches (default true)."),
        limit: z.number().int().positive().max(500).optional(),
      },
    },
    async (args) => guard(() => A.expiryBatches(store, remap(args))),
  );

  server.registerTool(
    "reorder_suggestions",
    {
      title: "Reorder suggestions",
      description:
        "Items at or below their reorder point based on effective (non-expired) stock, with a suggested order quantity to reach par level. Answers 'what needs reordering' / 'what is below reorder point'.",
      inputSchema: {
        store: storeRef,
        limit: z.number().int().positive().max(500).optional(),
      },
    },
    async (args) => guard(() => A.reorderSuggestions(store, remap(args))),
  );

  server.registerTool(
    "stock_status",
    {
      title: "Stock status for a medication",
      description:
        "Effective on-hand, expired on-hand, reorder point and par level for one medication, broken down by store. Use when the user asks about a specific drug's stock position.",
      inputSchema: {
        medication: z.string().describe("Medication name, code, or id (e.g. 'meropenem', 'PH10009')."),
        store: storeRef,
      },
    },
    async ({ medication, store: s }) =>
      guard(() => A.stockStatus(store, { medicationRef: medication, storeRef: s })),
  );

  server.registerTool(
    "consumption_trend",
    {
      title: "Monthly consumption trend",
      description:
        "Monthly withdrawal quantity for one medication over the last N months (default 12), optionally for a single store. Use for trend / seasonality questions about a specific drug.",
      inputSchema: {
        medication: z.string().describe("Medication name, code, or id."),
        store: storeRef,
        months: z.number().int().positive().max(36).optional(),
      },
    },
    async ({ medication, store: s, months }) =>
      guard(() => A.consumptionTrend(store, { medicationRef: medication, storeRef: s, months })),
  );

  server.registerTool(
    "stock_valuation",
    {
      title: "Stock valuation",
      description:
        "Total SAR value of effective (non-expired) stock, grouped by store, planner, or ATC class. Use for 'how much inventory value' questions.",
      inputSchema: {
        store: storeRef,
        groupBy: z.enum(["store", "planner", "atcClass"]).optional().describe("Grouping dimension (default store)."),
      },
    },
    async (args) => guard(() => A.stockValuation(store, remap(args))),
  );

  server.registerTool(
    "withdrawals_breakdown",
    {
      title: "Withdrawals breakdown",
      description:
        "Flexible aggregation of withdrawal volume by department, store, planner, ATC class, medication, or month. The general-purpose tool for ad-hoc 'group the issues by X' questions.",
      inputSchema: {
        groupBy: z
          .enum(["department", "store", "planner", "atcClass", "medication", "month"])
          .describe("Dimension to group withdrawals by."),
        store: storeRef,
        from: isoDate,
        to: isoDate,
        limit: z.number().int().positive().max(200).optional(),
      },
    },
    async (args) => guard(() => A.withdrawalsBreakdown(store, remap(args))),
  );

  server.registerTool(
    "list_stores",
    {
      title: "List stores",
      description: "Lists every store / pharmacy location with its id, English and Arabic name, and whether it is the main store.",
      inputSchema: {},
    },
    async () => jsonResult(store.stores),
  );

  server.registerTool(
    "list_planners",
    {
      title: "List planners",
      description: "Lists every planner / buyer with the section they own.",
      inputSchema: {},
    },
    async () => jsonResult(store.planners),
  );
}
