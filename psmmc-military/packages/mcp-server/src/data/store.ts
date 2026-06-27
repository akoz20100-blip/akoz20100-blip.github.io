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
    return resolveByTiers(this.stores, ref, (s) => [s.name, s.nameAr], (s) => `${s.name} (${s.id})`, "Store");
  }

  /** Same resolution strategy for planners (id, name, section). */
  resolvePlanner(ref?: string): Planner | undefined {
    if (!ref) return undefined;
    const direct = this.plannerById.get(ref);
    if (direct) return direct;
    return resolveByTiers(
      this.planners,
      ref,
      (p) => [p.name, p.nameAr, p.section],
      (p) => `${p.name} (${p.id})`,
      "Planner",
    );
  }
}

/** Split a label into lowercase word tokens (Latin + Arabic). */
function tokenize(s: string): string[] {
  // Split on anything that is not a Latin letter/digit or an Arabic-block char.
  return s
    .toLowerCase()
    .split(/[^a-z0-9\u0600-\u06ff]+/i)
    .filter(Boolean);
}

/**
 * Resolve a free-text reference against a list using increasingly loose tiers:
 * exact field equality -> whole-word token match -> substring. The first tier
 * that yields any candidate decides; a single candidate resolves, multiple
 * throw an ambiguity error, zero falls through to the next tier. Preferring
 * whole-word over substring avoids mid-word false positives.
 */
function resolveByTiers<T>(
  items: T[],
  ref: string,
  fieldsOf: (x: T) => (string | undefined)[],
  describe: (x: T) => string,
  kind: string,
): T | undefined {
  const lower = ref.trim().toLowerCase();
  const fields = (x: T) => fieldsOf(x).filter((v): v is string => Boolean(v));

  const tiers: Array<(x: T) => boolean> = [
    (x) => fields(x).some((v) => v.toLowerCase() === lower),
    (x) => fields(x).some((v) => tokenize(v).includes(lower)),
    (x) => fields(x).some((v) => v.toLowerCase().includes(lower)),
  ];

  for (const test of tiers) {
    const hits = items.filter(test);
    if (hits.length === 1) return hits[0];
    if (hits.length > 1) {
      throw new Error(
        `${kind} reference "${ref}" is ambiguous; matches: ${hits.map(describe).join(", ")}`,
      );
    }
  }
  return undefined;
}

export function reorderKey(medicationId: string, storeId: string): string {
  return `${medicationId}::${storeId}`;
}
