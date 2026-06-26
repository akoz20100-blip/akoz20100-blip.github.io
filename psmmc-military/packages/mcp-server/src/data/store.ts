import type {
  Dataset,
  Medication,
  Planner,
  ReorderParam,
  StockBatch,
  Store,
  Withdrawal,
} from "./schema.js";

/**
 * In-memory dataset with the indexes the analytics layer needs. Built once at
 * startup; all queries are pure reads against these maps and arrays.
 */
export class DataStore {
  readonly dataset: Dataset;

  readonly medicationById = new Map<string, Medication>();
  readonly storeById = new Map<string, Store>();
  readonly plannerById = new Map<string, Planner>();
  readonly batchById = new Map<string, StockBatch>();
  /** medicationId -> store reorder params keyed by storeId. */
  readonly reorderByMedStore = new Map<string, ReorderParam>();

  constructor(dataset: Dataset) {
    this.dataset = dataset;
    for (const m of dataset.medications) this.medicationById.set(m.id, m);
    for (const s of dataset.stores) this.storeById.set(s.id, s);
    for (const p of dataset.planners) this.plannerById.set(p.id, p);
    for (const b of dataset.batches) this.batchById.set(b.id, b);
    for (const r of dataset.reorder) {
      this.reorderByMedStore.set(reorderKey(r.medicationId, r.storeId), r);
    }
  }

  get medications(): Medication[] {
    return this.dataset.medications;
  }
  get stores(): Store[] {
    return this.dataset.stores;
  }
  get planners(): Planner[] {
    return this.dataset.planners;
  }
  get batches(): StockBatch[] {
    return this.dataset.batches;
  }
  get withdrawals(): Withdrawal[] {
    return this.dataset.withdrawals;
  }
  get reorder(): ReorderParam[] {
    return this.dataset.reorder;
  }

  /** The central / main store, or the first store if none is flagged. */
  mainStore(): Store {
    return this.stores.find((s) => s.isMain) ?? this.stores[0];
  }

  reorderParam(medicationId: string, storeId: string): ReorderParam | undefined {
    return this.reorderByMedStore.get(reorderKey(medicationId, storeId));
  }

  plannerOf(medicationId: string): Planner | undefined {
    const med = this.medicationById.get(medicationId);
    return med ? this.plannerById.get(med.plannerId) : undefined;
  }

  /**
   * Resolve a store by id, exact name, or case-insensitive partial name.
   * Returns undefined if nothing matches; throws on an ambiguous partial match.
   */
  resolveStore(ref?: string): Store | undefined {
    if (!ref) return undefined;
    const direct = this.storeById.get(ref);
    if (direct) return direct;
    const lower = ref.trim().toLowerCase();
    const exact = this.stores.filter(
      (s) => s.name.toLowerCase() === lower || s.nameAr?.toLowerCase() === lower,
    );
    if (exact.length === 1) return exact[0];
    const partial = this.stores.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        (s.nameAr ?? "").toLowerCase().includes(lower),
    );
    if (partial.length === 1) return partial[0];
    if (partial.length > 1) {
      throw new Error(
        `Store reference "${ref}" is ambiguous; matches: ${partial
          .map((s) => `${s.name} (${s.id})`)
          .join(", ")}`,
      );
    }
    return undefined;
  }

  /** Same resolution strategy for planners (id, name, partial). */
  resolvePlanner(ref?: string): Planner | undefined {
    if (!ref) return undefined;
    const direct = this.plannerById.get(ref);
    if (direct) return direct;
    const lower = ref.trim().toLowerCase();
    const matches = this.planners.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        (p.nameAr ?? "").toLowerCase().includes(lower) ||
        (p.section ?? "").toLowerCase().includes(lower),
    );
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) {
      throw new Error(
        `Planner reference "${ref}" is ambiguous; matches: ${matches
          .map((p) => `${p.name} (${p.id})`)
          .join(", ")}`,
      );
    }
    return undefined;
  }
}

export function reorderKey(medicationId: string, storeId: string): string {
  return `${medicationId}::${storeId}`;
}
