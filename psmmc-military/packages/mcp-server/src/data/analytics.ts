import type { StockBatch } from "./schema.js";
import { DataStore } from "./store.js";
import { daysBetween, todayISO, yearMonth } from "../util/dates.js";

/**
 * The analytics layer. Every function is a pure read over a DataStore and
 * returns plain JSON-serializable objects, ready to hand straight back to the
 * model as a tool result.
 */

const round2 = (n: number): number => Math.round(n * 100) / 100;
const batchValue = (b: StockBatch): number => b.qtyOnHand * (b.unitCost ?? 0);

export interface DateRange {
  from?: string;
  to?: string;
}

/** High-level snapshot so the model knows what data exists and over what window. */
export function dataOverview(store: DataStore, asOf = todayISO()) {
  const dates = store.withdrawals.map((w) => w.date).sort();
  const expired = store.batches.filter((b) => daysBetween(asOf, b.expiryDate) < 0);
  const onHandValue = store.batches
    .filter((b) => daysBetween(asOf, b.expiryDate) >= 0)
    .reduce((s, b) => s + batchValue(b), 0);
  return {
    asOf,
    counts: {
      medications: store.medications.length,
      stores: store.stores.length,
      planners: store.planners.length,
      stockBatches: store.batches.length,
      withdrawals: store.withdrawals.length,
    },
    withdrawalDateRange: { from: dates[0] ?? null, to: dates[dates.length - 1] ?? null },
    stores: store.stores.map((s) => ({ id: s.id, name: s.name, nameAr: s.nameAr, isMain: s.isMain })),
    planners: store.planners.map((p) => ({ id: p.id, name: p.name, section: p.section })),
    effectiveStockValueSAR: round2(onHandValue),
    expiredBatches: expired.length,
    expiredValueSAR: round2(expired.reduce((s, b) => s + batchValue(b), 0)),
    currency: "SAR",
  };
}

export interface TopWithdrawnOptions extends DateRange {
  storeRef?: string;
  limit?: number;
  /** Rank by total quantity issued (default) or by number of transactions. */
  by?: "quantity" | "transactions";
}

/** Top medications by withdrawal/issue volume, optionally for one store. */
export function topWithdrawnMedications(store: DataStore, opts: TopWithdrawnOptions = {}) {
  const target = store.resolveStore(opts.storeRef);
  const limit = clampLimit(opts.limit, 10);
  const by = opts.by ?? "quantity";

  const agg = new Map<string, { qty: number; txns: number }>();
  let scanned = 0;
  for (const w of store.withdrawals) {
    if (target && w.fromStoreId !== target.id) continue;
    if (opts.from && w.date < opts.from) continue;
    if (opts.to && w.date > opts.to) continue;
    scanned += 1;
    const cur = agg.get(w.medicationId) ?? { qty: 0, txns: 0 };
    cur.qty += w.qty;
    cur.txns += 1;
    agg.set(w.medicationId, cur);
  }

  const rows = [...agg.entries()]
    .map(([medicationId, v]) => {
      const med = store.medicationById.get(medicationId);
      const planner = store.plannerOf(medicationId);
      return {
        rank: 0,
        medicationId,
        code: med?.code,
        medication: med ? `${med.genericName}${med.strength ? " " + med.strength : ""}` : medicationId,
        form: med?.form,
        unit: med?.unit,
        totalQty: v.qty,
        transactions: v.txns,
        planner: planner?.name,
        plannerSection: planner?.section,
      };
    })
    .sort((a, b) => (by === "transactions" ? b.transactions - a.transactions : b.totalQty - a.totalQty))
    .slice(0, limit);
  rows.forEach((r, i) => (r.rank = i + 1));

  return {
    store: target ? { id: target.id, name: target.name } : "ALL_STORES",
    rankedBy: by,
    dateRange: { from: opts.from ?? null, to: opts.to ?? null },
    transactionsConsidered: scanned,
    results: rows,
  };
}

export interface ExpiryOptions {
  asOf?: string;
  storeRef?: string;
  /** Only consider batches expiring within this many days from asOf. */
  withinDays?: number;
  limit?: number;
  /** Rank planners by SAR value at risk (default) or by quantity. */
  metric?: "value" | "quantity";
  /** Include already-expired batches (default true). */
  includeExpired?: boolean;
}

/**
 * Rank planners by their expiry exposure — i.e. which planner owns the most
 * expired (or soon-to-expire) medication. Answers
 * "which planner has the most expired medication".
 */
export function plannerExpiryRanking(store: DataStore, opts: ExpiryOptions = {}) {
  const asOf = opts.asOf ?? todayISO();
  const target = store.resolveStore(opts.storeRef);
  const metric = opts.metric ?? "value";
  const includeExpired = opts.includeExpired ?? true;
  const limit = clampLimit(opts.limit, store.planners.length);

  const agg = new Map<string, { qty: number; value: number; batches: number; items: Set<string> }>();
  for (const b of store.batches) {
    if (target && b.storeId !== target.id) continue;
    const days = daysBetween(asOf, b.expiryDate);
    const isExpired = days < 0;
    const isExpiringSoon = opts.withinDays != null && days >= 0 && days <= opts.withinDays;
    if (!((includeExpired && isExpired) || isExpiringSoon)) continue;

    const med = store.medicationById.get(b.medicationId);
    if (!med) continue;
    const cur = agg.get(med.plannerId) ?? { qty: 0, value: 0, batches: 0, items: new Set<string>() };
    cur.qty += b.qtyOnHand;
    cur.value += batchValue(b);
    cur.batches += 1;
    cur.items.add(b.medicationId);
    agg.set(med.plannerId, cur);
  }

  const rows = [...agg.entries()]
    .map(([plannerId, v]) => {
      const planner = store.plannerById.get(plannerId);
      return {
        rank: 0,
        plannerId,
        planner: planner?.name,
        section: planner?.section,
        expiredOrExpiringValueSAR: round2(v.value),
        expiredOrExpiringQty: v.qty,
        affectedBatches: v.batches,
        affectedItems: v.items.size,
      };
    })
    .sort((a, b) =>
      metric === "quantity"
        ? b.expiredOrExpiringQty - a.expiredOrExpiringQty
        : b.expiredOrExpiringValueSAR - a.expiredOrExpiringValueSAR,
    )
    .slice(0, limit);
  rows.forEach((r, i) => (r.rank = i + 1));

  return {
    asOf,
    store: target ? { id: target.id, name: target.name } : "ALL_STORES",
    window: opts.withinDays != null ? `expired + expiring within ${opts.withinDays} days` : "already expired",
    rankedBy: metric,
    results: rows,
  };
}

/** Individual batches that are expired or expiring soon, most-urgent first. */
export function expiryBatches(store: DataStore, opts: ExpiryOptions = {}) {
  const asOf = opts.asOf ?? todayISO();
  const target = store.resolveStore(opts.storeRef);
  const limit = clampLimit(opts.limit, 50);
  const includeExpired = opts.includeExpired ?? true;

  const rows = store.batches
    .filter((b) => {
      if (target && b.storeId !== target.id) return false;
      const days = daysBetween(asOf, b.expiryDate);
      const isExpired = days < 0;
      const isExpiringSoon = opts.withinDays != null && days >= 0 && days <= opts.withinDays;
      return (includeExpired && isExpired) || isExpiringSoon;
    })
    .map((b) => {
      const med = store.medicationById.get(b.medicationId);
      const days = daysBetween(asOf, b.expiryDate);
      return {
        batchNo: b.batchNo,
        medicationId: b.medicationId,
        medication: med ? `${med.genericName}${med.strength ? " " + med.strength : ""}` : b.medicationId,
        store: store.storeById.get(b.storeId)?.name,
        planner: store.plannerOf(b.medicationId)?.name,
        qtyOnHand: b.qtyOnHand,
        expiryDate: b.expiryDate,
        daysToExpiry: days,
        status: days < 0 ? "EXPIRED" : "EXPIRING",
        valueSAR: round2(batchValue(b)),
      };
    })
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry)
    .slice(0, limit);

  return {
    asOf,
    store: target ? { id: target.id, name: target.name } : "ALL_STORES",
    window: opts.withinDays != null ? `expired + expiring within ${opts.withinDays} days` : "already expired",
    totalValueSAR: round2(rows.reduce((s, r) => s + r.valueSAR, 0)),
    results: rows,
  };
}

export interface ReorderOptions {
  storeRef?: string;
  asOf?: string;
  limit?: number;
}

/**
 * Items at or below their reorder point (using effective, non-expired stock),
 * with a suggested order quantity to bring them back to par.
 */
export function reorderSuggestions(store: DataStore, opts: ReorderOptions = {}) {
  const asOf = opts.asOf ?? todayISO();
  const target = store.resolveStore(opts.storeRef);
  const limit = clampLimit(opts.limit, 50);

  // Effective on-hand per (med, store): non-expired batch quantity.
  const onHand = new Map<string, number>();
  for (const b of store.batches) {
    if (daysBetween(asOf, b.expiryDate) < 0) continue;
    const key = `${b.medicationId}::${b.storeId}`;
    onHand.set(key, (onHand.get(key) ?? 0) + b.qtyOnHand);
  }

  const rows = store.reorder
    .filter((r) => !target || r.storeId === target.id)
    .map((r) => {
      const effective = onHand.get(`${r.medicationId}::${r.storeId}`) ?? 0;
      const med = store.medicationById.get(r.medicationId);
      const suggestedQty = Math.max(0, Math.round(r.parLevel - effective));
      return {
        medicationId: r.medicationId,
        code: med?.code,
        medication: med ? `${med.genericName}${med.strength ? " " + med.strength : ""}` : r.medicationId,
        store: store.storeById.get(r.storeId)?.name,
        planner: store.plannerOf(r.medicationId)?.name,
        effectiveOnHand: effective,
        reorderPoint: r.reorderPoint,
        parLevel: r.parLevel,
        avgMonthlyConsumption: r.avgMonthlyConsumption,
        suggestedOrderQty: suggestedQty,
        belowReorder: effective <= r.reorderPoint,
        stockedOut: effective === 0,
      };
    })
    .filter((r) => r.belowReorder)
    .sort((a, b) => a.effectiveOnHand - b.effectiveOnHand)
    .slice(0, limit);

  return {
    asOf,
    store: target ? { id: target.id, name: target.name } : "ALL_STORES",
    itemsBelowReorder: rows.length,
    results: rows,
  };
}

/** Effective stock position for one medication (optionally at one store). */
export function stockStatus(
  store: DataStore,
  opts: { medicationRef: string; storeRef?: string; asOf?: string },
) {
  const asOf = opts.asOf ?? todayISO();
  const med = resolveMedication(store, opts.medicationRef);
  if (!med) {
    return { error: `No medication matched "${opts.medicationRef}".` };
  }
  const target = store.resolveStore(opts.storeRef);

  const perStore = new Map<string, { effective: number; expired: number }>();
  for (const b of store.batches) {
    if (b.medicationId !== med.id) continue;
    if (target && b.storeId !== target.id) continue;
    const cur = perStore.get(b.storeId) ?? { effective: 0, expired: 0 };
    if (daysBetween(asOf, b.expiryDate) < 0) cur.expired += b.qtyOnHand;
    else cur.effective += b.qtyOnHand;
    perStore.set(b.storeId, cur);
  }

  return {
    asOf,
    medication: {
      id: med.id,
      code: med.code,
      name: `${med.genericName}${med.strength ? " " + med.strength : ""}`,
      form: med.form,
      unit: med.unit,
      planner: store.plannerById.get(med.plannerId)?.name,
      unitCostSAR: med.unitCost,
    },
    byStore: [...perStore.entries()].map(([storeId, v]) => {
      const r = store.reorderParam(med.id, storeId);
      return {
        store: store.storeById.get(storeId)?.name,
        effectiveOnHand: v.effective,
        expiredOnHand: v.expired,
        reorderPoint: r?.reorderPoint ?? null,
        parLevel: r?.parLevel ?? null,
        belowReorder: r ? v.effective <= r.reorderPoint : null,
      };
    }),
  };
}

/** Monthly issue trend for one medication over the last N months. */
export function consumptionTrend(
  store: DataStore,
  opts: { medicationRef: string; storeRef?: string; months?: number; asOf?: string },
) {
  const med = resolveMedication(store, opts.medicationRef);
  if (!med) return { error: `No medication matched "${opts.medicationRef}".` };
  const target = store.resolveStore(opts.storeRef);
  const months = clampLimit(opts.months, 12, 36);

  const byMonth = new Map<string, number>();
  for (const w of store.withdrawals) {
    if (w.medicationId !== med.id) continue;
    if (target && w.fromStoreId !== target.id) continue;
    const ym = yearMonth(w.date);
    byMonth.set(ym, (byMonth.get(ym) ?? 0) + w.qty);
  }
  const series = [...byMonth.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-months)
    .map(([month, qty]) => ({ month, totalQty: qty }));

  return {
    medication: `${med.genericName}${med.strength ? " " + med.strength : ""}`,
    store: target ? target.name : "ALL_STORES",
    monthly: series,
    totalQty: series.reduce((s, p) => s + p.totalQty, 0),
  };
}

/** Inventory valuation of effective (non-expired) stock, grouped. */
export function stockValuation(
  store: DataStore,
  opts: { storeRef?: string; groupBy?: "store" | "planner" | "atcClass"; asOf?: string } = {},
) {
  const asOf = opts.asOf ?? todayISO();
  const target = store.resolveStore(opts.storeRef);
  const groupBy = opts.groupBy ?? "store";

  const agg = new Map<string, number>();
  let total = 0;
  for (const b of store.batches) {
    if (target && b.storeId !== target.id) continue;
    if (daysBetween(asOf, b.expiryDate) < 0) continue;
    const med = store.medicationById.get(b.medicationId);
    let key: string;
    if (groupBy === "planner") key = store.plannerById.get(med?.plannerId ?? "")?.name ?? "Unknown";
    else if (groupBy === "atcClass") key = med?.atcClass ?? "Unknown";
    else key = store.storeById.get(b.storeId)?.name ?? b.storeId;
    const v = batchValue(b);
    agg.set(key, (agg.get(key) ?? 0) + v);
    total += v;
  }

  return {
    asOf,
    store: target ? { id: target.id, name: target.name } : "ALL_STORES",
    groupBy,
    totalValueSAR: round2(total),
    breakdown: [...agg.entries()]
      .map(([group, value]) => ({ group, valueSAR: round2(value) }))
      .sort((a, b) => b.valueSAR - a.valueSAR),
  };
}

export interface BreakdownOptions extends DateRange {
  groupBy: "department" | "store" | "planner" | "atcClass" | "medication" | "month";
  storeRef?: string;
  limit?: number;
}

/**
 * Flexible aggregation of withdrawal volume by any dimension — the escape hatch
 * for ad-hoc management questions ("issues by department", "by ATC class", ...).
 */
export function withdrawalsBreakdown(store: DataStore, opts: BreakdownOptions) {
  const target = store.resolveStore(opts.storeRef);
  const limit = clampLimit(opts.limit, 25);

  const agg = new Map<string, { qty: number; txns: number }>();
  let scanned = 0;
  for (const w of store.withdrawals) {
    if (target && w.fromStoreId !== target.id) continue;
    if (opts.from && w.date < opts.from) continue;
    if (opts.to && w.date > opts.to) continue;
    const med = store.medicationById.get(w.medicationId);
    let key: string;
    switch (opts.groupBy) {
      case "department":
        key = w.toDept;
        break;
      case "store":
        key = store.storeById.get(w.fromStoreId)?.name ?? w.fromStoreId;
        break;
      case "planner":
        key = store.plannerById.get(med?.plannerId ?? "")?.name ?? "Unknown";
        break;
      case "atcClass":
        key = med?.atcClass ?? "Unknown";
        break;
      case "month":
        key = yearMonth(w.date);
        break;
      default:
        key = med ? `${med.genericName}${med.strength ? " " + med.strength : ""}` : w.medicationId;
    }
    const cur = agg.get(key) ?? { qty: 0, txns: 0 };
    cur.qty += w.qty;
    cur.txns += 1;
    agg.set(key, cur);
    scanned += 1;
  }

  const sorted = [...agg.entries()]
    .map(([group, v]) => ({ group, totalQty: v.qty, transactions: v.txns }))
    .sort((a, b) =>
      opts.groupBy === "month" ? a.group.localeCompare(b.group) : b.totalQty - a.totalQty,
    )
    .slice(0, limit);

  return {
    store: target ? { id: target.id, name: target.name } : "ALL_STORES",
    groupBy: opts.groupBy,
    dateRange: { from: opts.from ?? null, to: opts.to ?? null },
    transactionsConsidered: scanned,
    results: sorted,
  };
}

/** Free-text search across medications, stores and planners. */
export function searchDashboard(store: DataStore, opts: { query: string; limit?: number }) {
  const q = opts.query.trim().toLowerCase();
  const limit = clampLimit(opts.limit, 20);
  if (!q) return { query: opts.query, results: [] };

  const meds = store.medications
    .filter((m) =>
      [m.code, m.genericName, m.brandName, m.atcClass, m.form, m.strength]
        .filter(Boolean)
        .some((f) => f!.toLowerCase().includes(q)),
    )
    .slice(0, limit)
    .map((m) => ({
      type: "medication" as const,
      id: m.id,
      code: m.code,
      name: `${m.genericName}${m.strength ? " " + m.strength : ""}`,
      form: m.form,
      planner: store.plannerById.get(m.plannerId)?.name,
    }));

  const planners = store.planners
    .filter((p) => [p.name, p.nameAr, p.section].filter(Boolean).some((f) => f!.toLowerCase().includes(q)))
    .map((p) => ({ type: "planner" as const, id: p.id, name: p.name, section: p.section }));

  const stores = store.stores
    .filter((s) => [s.name, s.nameAr].filter(Boolean).some((f) => f!.toLowerCase().includes(q)))
    .map((s) => ({ type: "store" as const, id: s.id, name: s.name }));

  return { query: opts.query, results: [...meds, ...planners, ...stores] };
}

// --- helpers ---------------------------------------------------------------

function resolveMedication(store: DataStore, ref: string) {
  const direct = store.medicationById.get(ref);
  if (direct) return direct;
  const lower = ref.trim().toLowerCase();
  const byCode = store.medications.find((m) => m.code.toLowerCase() === lower);
  if (byCode) return byCode;
  const matches = store.medications.filter(
    (m) =>
      m.genericName.toLowerCase().includes(lower) ||
      (m.brandName ?? "").toLowerCase().includes(lower),
  );
  return matches[0];
}

function clampLimit(value: number | undefined, fallback: number, max = 1000): number {
  if (value == null || Number.isNaN(value)) return fallback;
  return Math.max(1, Math.min(max, Math.floor(value)));
}
