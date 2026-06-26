import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import Papa from "papaparse";
import { DatasetSchema, type Dataset } from "./schema.js";
import { generateDataset } from "./seed.js";
import { DataStore } from "./store.js";

export interface LoadResult {
  store: DataStore;
  source: string;
}

/**
 * Build the DataStore from the best available source, in priority order:
 *   1. `<dir>/dataset.json`            — a single normalized dataset file
 *   2. `<dir>/*.csv`                   — one CSV per entity (medications, stores, ...)
 *   3. synthetic fallback             — deterministic built-in demo dataset
 *
 * `dir` defaults to PSMMC_DATA_DIR, then `./data`.
 */
export function loadDataStore(dir?: string): LoadResult {
  const candidates = [dir, process.env.PSMMC_DATA_DIR, resolve(process.cwd(), "data")].filter(
    (d): d is string => Boolean(d),
  );

  for (const candidate of candidates) {
    const abs = resolve(candidate);
    if (!existsSync(abs)) continue;

    const jsonPath = join(abs, "dataset.json");
    if (existsSync(jsonPath)) {
      const raw = JSON.parse(readFileSync(jsonPath, "utf8"));
      const dataset = DatasetSchema.parse(raw);
      return { store: new DataStore(dataset), source: `json:${jsonPath}` };
    }

    const csvFiles = readdirSync(abs).filter((f) => f.toLowerCase().endsWith(".csv"));
    if (csvFiles.length > 0) {
      const dataset = loadFromCsv(abs);
      return { store: new DataStore(dataset), source: `csv:${abs}` };
    }
  }

  const dataset = generateDataset();
  return { store: new DataStore(dataset), source: "synthetic:built-in-demo" };
}

function readCsv<T>(dir: string, file: string): T[] {
  const path = join(dir, file);
  if (!existsSync(path)) return [];
  const parsed = Papa.parse<Record<string, string>>(readFileSync(path, "utf8"), {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });
  return parsed.data as unknown as T[];
}

const num = (v: unknown, d = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};
const bool = (v: unknown): boolean => String(v).trim().toLowerCase() === "true" || v === "1";
const str = (v: unknown): string | undefined => {
  const s = v == null ? "" : String(v).trim();
  return s.length ? s : undefined;
};

/** Parse one-CSV-per-entity exports into a validated Dataset. */
function loadFromCsv(dir: string): Dataset {
  const planners = readCsv<Record<string, string>>(dir, "planners.csv").map((r) => ({
    id: r.id,
    name: r.name,
    nameAr: str(r.nameAr),
    section: str(r.section),
  }));
  const stores = readCsv<Record<string, string>>(dir, "stores.csv").map((r) => ({
    id: r.id,
    name: r.name,
    nameAr: str(r.nameAr),
    isMain: bool(r.isMain),
  }));
  const medications = readCsv<Record<string, string>>(dir, "medications.csv").map((r) => ({
    id: r.id,
    code: r.code,
    genericName: r.genericName,
    brandName: str(r.brandName),
    form: r.form ?? "Tablet",
    strength: str(r.strength),
    atcClass: str(r.atcClass),
    unit: r.unit ?? "EA",
    plannerId: r.plannerId,
    unitCost: num(r.unitCost),
  }));
  const batches = readCsv<Record<string, string>>(dir, "batches.csv").map((r) => ({
    id: r.id,
    medicationId: r.medicationId,
    storeId: r.storeId,
    batchNo: r.batchNo,
    qtyOnHand: num(r.qtyOnHand),
    expiryDate: r.expiryDate,
    unitCost: r.unitCost != null && r.unitCost !== "" ? num(r.unitCost) : undefined,
  }));
  const reorder = readCsv<Record<string, string>>(dir, "reorder.csv").map((r) => ({
    medicationId: r.medicationId,
    storeId: r.storeId,
    parLevel: num(r.parLevel),
    reorderPoint: num(r.reorderPoint),
    avgMonthlyConsumption: num(r.avgMonthlyConsumption),
    leadTimeDays: num(r.leadTimeDays, 30),
  }));
  const withdrawals = readCsv<Record<string, string>>(dir, "withdrawals.csv").map((r) => ({
    id: r.id,
    date: r.date,
    medicationId: r.medicationId,
    fromStoreId: r.fromStoreId,
    toDept: r.toDept,
    qty: num(r.qty),
  }));

  return DatasetSchema.parse({ planners, stores, medications, batches, reorder, withdrawals });
}
