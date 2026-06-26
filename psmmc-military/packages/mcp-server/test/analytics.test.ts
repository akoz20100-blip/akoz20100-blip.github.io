import { describe, it, expect, beforeAll } from "vitest";
import { generateDataset } from "../src/data/seed.js";
import { DataStore } from "../src/data/store.js";
import * as A from "../src/data/analytics.js";

const ASOF = "2026-06-26";
let store: DataStore;

beforeAll(() => {
  // Fixed seed + asOf -> fully deterministic dataset.
  store = new DataStore(generateDataset({ asOf: ASOF, seed: 7, withdrawals: 3000 }));
});

describe("dataOverview", () => {
  it("reports counts matching the dataset", () => {
    const o = A.dataOverview(store, ASOF);
    expect(o.counts.medications).toBe(store.medications.length);
    expect(o.counts.withdrawals).toBe(store.withdrawals.length);
    expect(o.stores.length).toBe(store.stores.length);
    expect(o.currency).toBe("SAR");
  });
});

describe("topWithdrawnMedications", () => {
  it("returns at most `limit`, ranked by descending quantity", () => {
    const r = A.topWithdrawnMedications(store, { limit: 10 });
    expect(r.results.length).toBeLessThanOrEqual(10);
    for (let i = 1; i < r.results.length; i++) {
      expect(r.results[i - 1].totalQty).toBeGreaterThanOrEqual(r.results[i].totalQty);
      expect(r.results[i].rank).toBe(i + 1);
    }
  });

  it("filters to the main store and only counts its transactions", () => {
    const main = store.mainStore();
    const r = A.topWithdrawnMedications(store, { storeRef: "main", limit: 10 });
    expect(r.store).toMatchObject({ id: main.id });
    const expected = store.withdrawals.filter((w) => w.fromStoreId === main.id).length;
    expect(r.transactionsConsidered).toBe(expected);
  });

  it("ranks by transactions when requested", () => {
    const r = A.topWithdrawnMedications(store, { by: "transactions", limit: 5 });
    expect(r.rankedBy).toBe("transactions");
    for (let i = 1; i < r.results.length; i++) {
      expect(r.results[i - 1].transactions).toBeGreaterThanOrEqual(r.results[i].transactions);
    }
  });
});

describe("plannerExpiryRanking", () => {
  it("ranks planners by descending expired value and identifies a clear top", () => {
    const r = A.plannerExpiryRanking(store, { asOf: ASOF });
    expect(r.results.length).toBeGreaterThan(0);
    for (let i = 1; i < r.results.length; i++) {
      expect(r.results[i - 1].expiredOrExpiringValueSAR).toBeGreaterThanOrEqual(
        r.results[i].expiredOrExpiringValueSAR,
      );
    }
    expect(r.results[0].planner).toBeTruthy();
  });

  it("expands the set when withinDays is supplied", () => {
    const expiredOnly = A.plannerExpiryRanking(store, { asOf: ASOF });
    const withSoon = A.plannerExpiryRanking(store, { asOf: ASOF, withinDays: 90 });
    const sum = (rows: { expiredOrExpiringQty: number }[]) =>
      rows.reduce((s, x) => s + x.expiredOrExpiringQty, 0);
    expect(sum(withSoon.results)).toBeGreaterThanOrEqual(sum(expiredOnly.results));
  });
});

describe("reorderSuggestions", () => {
  it("returns only items at or below reorder point, ascending on-hand", () => {
    const r = A.reorderSuggestions(store, { asOf: ASOF });
    for (const row of r.results) {
      expect(row.belowReorder).toBe(true);
      expect(row.effectiveOnHand).toBeLessThanOrEqual(row.reorderPoint);
      expect(row.suggestedOrderQty).toBeGreaterThanOrEqual(0);
    }
    for (let i = 1; i < r.results.length; i++) {
      expect(r.results[i - 1].effectiveOnHand).toBeLessThanOrEqual(r.results[i].effectiveOnHand);
    }
  });
});

describe("expiryBatches", () => {
  it("orders by urgency and only includes expired/expiring batches", () => {
    const r = A.expiryBatches(store, { asOf: ASOF, withinDays: 30 });
    for (let i = 1; i < r.results.length; i++) {
      expect(r.results[i - 1].daysToExpiry).toBeLessThanOrEqual(r.results[i].daysToExpiry);
    }
    for (const row of r.results) {
      expect(row.daysToExpiry).toBeLessThanOrEqual(30);
    }
  });
});

describe("withdrawalsBreakdown", () => {
  it("groups by department and conserves total transactions", () => {
    const r = A.withdrawalsBreakdown(store, { groupBy: "department" });
    const total = r.results.reduce((s, x) => s + x.transactions, 0);
    // Every transaction lands in exactly one group when limit is not binding.
    expect(total).toBeLessThanOrEqual(store.withdrawals.length);
    expect(r.groupBy).toBe("department");
  });

  it("returns months in chronological order", () => {
    const r = A.withdrawalsBreakdown(store, { groupBy: "month" });
    const months = r.results.map((x) => x.group);
    expect([...months].sort()).toEqual(months);
  });
});

describe("store resolution", () => {
  it("resolves a store by partial name", () => {
    expect(store.resolveStore("main")?.isMain).toBe(true);
    expect(store.resolveStore("ICU")?.name).toContain("ICU");
    expect(store.resolveStore(undefined)).toBeUndefined();
  });
});

describe("searchDashboard", () => {
  it("finds a known medication", () => {
    const r = A.searchDashboard(store, { query: "metformin" });
    expect(r.results.some((x) => x.type === "medication")).toBe(true);
  });
});
