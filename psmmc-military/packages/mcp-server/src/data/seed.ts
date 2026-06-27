import type {
  Dataset,
  Medication,
  Planner,
  ReorderParam,
  StockBatch,
  Store,
  Withdrawal,
} from "./schema.js";
import { addDays, addMonths, toISODate, todayISO } from "../util/dates.js";

/**
 * Deterministic synthetic dataset generator for the PSMMC pharmacy dashboard.
 *
 * The data is fictional but shaped like the real thing so the demo answers the
 * questions management actually asks (top withdrawals, planner expiry exposure,
 * reorder pressure, expiry buckets). Given the same `seed` and `asOf` it always
 * produces byte-identical output, which keeps tests stable.
 */

export interface SeedOptions {
  /** Reference "today". Expiry buckets and withdrawal history are relative to this. */
  asOf?: string;
  /** PRNG seed. Change it for a different but still-deterministic dataset. */
  seed?: number;
  /** Number of withdrawal transactions to generate. */
  withdrawals?: number;
}

/** mulberry32 — tiny deterministic PRNG. */
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PLANNERS: Array<Omit<Planner, "id">> = [
  { name: "Abdullah Al-Qahtani", nameAr: "عبدالله القحطاني", section: "Antimicrobials" },
  { name: "Sara Al-Otaibi", nameAr: "سارة العتيبي", section: "Cardiovascular" },
  { name: "Mohammed Al-Harbi", nameAr: "محمد الحربي", section: "Oncology" },
  { name: "Fatimah Al-Zahrani", nameAr: "فاطمة الزهراني", section: "CNS & Analgesia" },
  { name: "Khalid Al-Dossari", nameAr: "خالد الدوسري", section: "Endocrine & Diabetes" },
  { name: "Noura Al-Shammari", nameAr: "نورة الشمري", section: "Respiratory" },
  { name: "Yousef Al-Mutairi", nameAr: "يوسف المطيري", section: "GI & Nutrition" },
  { name: "Hessa Al-Ghamdi", nameAr: "هصة الغامدي", section: "Fluids & Electrolytes" },
];

const STORES: Array<Omit<Store, "id">> = [
  { name: "Main Store", nameAr: "المستودع الرئيسي", isMain: true },
  { name: "Inpatient Pharmacy", nameAr: "صيدلية التنويم", isMain: false },
  { name: "Outpatient Pharmacy", nameAr: "صيدلية العيادات", isMain: false },
  { name: "Emergency Pharmacy", nameAr: "صيدلية الطوارئ", isMain: false },
  { name: "ICU Satellite", nameAr: "صيدلية العناية المركزة", isMain: false },
  { name: "OR Pharmacy", nameAr: "صيدلية العمليات", isMain: false },
];

const DEPARTMENTS = [
  "Medical Ward A",
  "Medical Ward B",
  "Surgical Ward",
  "ICU",
  "CCU",
  "Emergency Department",
  "Operating Theatre",
  "Oncology Day Care",
  "Dialysis Unit",
  "Outpatient Clinics",
  "Pediatrics",
];

/** Curated medication catalogue grouped by the planner section that owns it. */
const CATALOGUE: Record<string, Array<Partial<Medication> & { genericName: string }>> = {
  Antimicrobials: [
    { genericName: "Piperacillin/Tazobactam", form: "Injection", strength: "4.5 g", atcClass: "J01CR", unit: "VIAL", unitCost: 18 },
    { genericName: "Meropenem", form: "Injection", strength: "1 g", atcClass: "J01DH", unit: "VIAL", unitCost: 42 },
    { genericName: "Vancomycin", form: "Injection", strength: "500 mg", atcClass: "J01XA", unit: "VIAL", unitCost: 9 },
    { genericName: "Ceftriaxone", form: "Injection", strength: "1 g", atcClass: "J01DD", unit: "VIAL", unitCost: 6 },
    { genericName: "Azithromycin", form: "Tablet", strength: "500 mg", atcClass: "J01FA", unit: "TAB", unitCost: 2 },
    { genericName: "Fluconazole", form: "Capsule", strength: "150 mg", atcClass: "J02AC", unit: "CAP", unitCost: 3 },
    { genericName: "Amoxicillin/Clavulanate", form: "Tablet", strength: "625 mg", atcClass: "J01CR", unit: "TAB", unitCost: 1 },
    { genericName: "Ciprofloxacin", form: "Tablet", strength: "500 mg", atcClass: "J01MA", unit: "TAB", unitCost: 1 },
  ],
  Cardiovascular: [
    { genericName: "Atorvastatin", form: "Tablet", strength: "40 mg", atcClass: "C10AA", unit: "TAB", unitCost: 1 },
    { genericName: "Amlodipine", form: "Tablet", strength: "5 mg", atcClass: "C08CA", unit: "TAB", unitCost: 1 },
    { genericName: "Bisoprolol", form: "Tablet", strength: "5 mg", atcClass: "C07AB", unit: "TAB", unitCost: 1 },
    { genericName: "Enoxaparin", form: "Injection", strength: "40 mg/0.4ml", atcClass: "B01AB", unit: "SYR", unitCost: 12 },
    { genericName: "Furosemide", form: "Injection", strength: "20 mg/2ml", atcClass: "C03CA", unit: "AMP", unitCost: 1 },
    { genericName: "Noradrenaline", form: "Injection", strength: "4 mg/4ml", atcClass: "C01CA", unit: "AMP", unitCost: 5 },
    { genericName: "Clopidogrel", form: "Tablet", strength: "75 mg", atcClass: "B01AC", unit: "TAB", unitCost: 2 },
  ],
  Oncology: [
    { genericName: "Cisplatin", form: "Injection", strength: "50 mg/50ml", atcClass: "L01XA", unit: "VIAL", unitCost: 35 },
    { genericName: "Paclitaxel", form: "Injection", strength: "100 mg/16.7ml", atcClass: "L01CD", unit: "VIAL", unitCost: 120 },
    { genericName: "Rituximab", form: "Injection", strength: "500 mg/50ml", atcClass: "L01FA", unit: "VIAL", unitCost: 1850 },
    { genericName: "Filgrastim", form: "Injection", strength: "300 mcg", atcClass: "L03AA", unit: "SYR", unitCost: 95 },
    { genericName: "Ondansetron", form: "Injection", strength: "8 mg/4ml", atcClass: "A04AA", unit: "AMP", unitCost: 2 },
    { genericName: "Dexamethasone", form: "Injection", strength: "8 mg/2ml", atcClass: "H02AB", unit: "AMP", unitCost: 1 },
  ],
  "CNS & Analgesia": [
    { genericName: "Paracetamol", form: "Injection", strength: "1 g/100ml", atcClass: "N02BE", unit: "BAG", unitCost: 3 },
    { genericName: "Morphine", form: "Injection", strength: "10 mg/ml", atcClass: "N02AA", unit: "AMP", unitCost: 2 },
    { genericName: "Fentanyl", form: "Injection", strength: "100 mcg/2ml", atcClass: "N01AH", unit: "AMP", unitCost: 3 },
    { genericName: "Midazolam", form: "Injection", strength: "5 mg/5ml", atcClass: "N05CD", unit: "AMP", unitCost: 2 },
    { genericName: "Levetiracetam", form: "Tablet", strength: "500 mg", atcClass: "N03AX", unit: "TAB", unitCost: 2 },
    { genericName: "Pregabalin", form: "Capsule", strength: "75 mg", atcClass: "N03AX", unit: "CAP", unitCost: 1 },
  ],
  "Endocrine & Diabetes": [
    { genericName: "Insulin Glargine", form: "Injection", strength: "100 U/ml", atcClass: "A10AE", unit: "PEN", unitCost: 28 },
    { genericName: "Insulin Aspart", form: "Injection", strength: "100 U/ml", atcClass: "A10AB", unit: "PEN", unitCost: 22 },
    { genericName: "Metformin", form: "Tablet", strength: "850 mg", atcClass: "A10BA", unit: "TAB", unitCost: 1 },
    { genericName: "Levothyroxine", form: "Tablet", strength: "100 mcg", atcClass: "H03AA", unit: "TAB", unitCost: 1 },
    { genericName: "Hydrocortisone", form: "Injection", strength: "100 mg", atcClass: "H02AB", unit: "VIAL", unitCost: 2 },
  ],
  Respiratory: [
    { genericName: "Salbutamol", form: "Nebule", strength: "5 mg/2.5ml", atcClass: "R03AC", unit: "NEB", unitCost: 1 },
    { genericName: "Ipratropium", form: "Nebule", strength: "500 mcg/2ml", atcClass: "R03BB", unit: "NEB", unitCost: 1 },
    { genericName: "Budesonide/Formoterol", form: "Inhaler", strength: "160/4.5", atcClass: "R03AK", unit: "DEV", unitCost: 38 },
    { genericName: "Montelukast", form: "Tablet", strength: "10 mg", atcClass: "R03DC", unit: "TAB", unitCost: 1 },
  ],
  "GI & Nutrition": [
    { genericName: "Pantoprazole", form: "Injection", strength: "40 mg", atcClass: "A02BC", unit: "VIAL", unitCost: 2 },
    { genericName: "Omeprazole", form: "Capsule", strength: "20 mg", atcClass: "A02BC", unit: "CAP", unitCost: 1 },
    { genericName: "Metoclopramide", form: "Injection", strength: "10 mg/2ml", atcClass: "A03FA", unit: "AMP", unitCost: 1 },
    { genericName: "Lactulose", form: "Syrup", strength: "10 g/15ml", atcClass: "A06AD", unit: "BTL", unitCost: 3 },
    { genericName: "Total Parenteral Nutrition", form: "Bag", strength: "1500 ml", atcClass: "B05BA", unit: "BAG", unitCost: 65 },
  ],
  "Fluids & Electrolytes": [
    { genericName: "Sodium Chloride 0.9%", form: "Infusion", strength: "1000 ml", atcClass: "B05BB", unit: "BAG", unitCost: 2 },
    { genericName: "Ringer's Lactate", form: "Infusion", strength: "1000 ml", atcClass: "B05BB", unit: "BAG", unitCost: 2 },
    { genericName: "Dextrose 5%", form: "Infusion", strength: "500 ml", atcClass: "B05BA", unit: "BAG", unitCost: 2 },
    { genericName: "Potassium Chloride", form: "Injection", strength: "10 mmol/10ml", atcClass: "B05XA", unit: "AMP", unitCost: 1 },
    { genericName: "Albumin 20%", form: "Injection", strength: "100 ml", atcClass: "B05AA", unit: "VIAL", unitCost: 75 },
  ],
};

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function weightedStore(rng: () => number, stores: Store[]): Store {
  // Main store dominates issue volume (~45%), the rest split the remainder.
  const r = rng();
  if (r < 0.45) return stores.find((s) => s.isMain)!;
  const others = stores.filter((s) => !s.isMain);
  return others[Math.floor(rng() * others.length)];
}

export function generateDataset(opts: SeedOptions = {}): Dataset {
  const asOf = opts.asOf ?? todayISO();
  const rng = makeRng(opts.seed ?? 42);
  const targetWithdrawals = opts.withdrawals ?? 6500;

  const planners: Planner[] = PLANNERS.map((p, i) => ({ id: `PL-${i + 1}`, ...p }));
  const plannerBySection = new Map(planners.map((p) => [p.section, p]));
  const stores: Store[] = STORES.map((s, i) => ({ id: `ST-${i + 1}`, ...s }));

  // Medications
  const medications: Medication[] = [];
  let medCounter = 0;
  for (const [section, items] of Object.entries(CATALOGUE)) {
    const planner = plannerBySection.get(section) ?? planners[0];
    for (const item of items) {
      medCounter += 1;
      medications.push({
        id: `MED-${String(medCounter).padStart(4, "0")}`,
        code: `PH${String(10000 + medCounter)}`,
        genericName: item.genericName,
        brandName: item.brandName,
        form: item.form ?? "Tablet",
        strength: item.strength,
        atcClass: item.atcClass,
        unit: item.unit ?? "EA",
        plannerId: planner.id,
        unitCost: item.unitCost ?? 1,
      });
    }
  }

  // Stock batches + reorder params.
  // Each medication is stocked in the main store plus a random subset of others.
  const batches: StockBatch[] = [];
  const reorder: ReorderParam[] = [];
  let batchCounter = 0;

  for (const med of medications) {
    const stockedStores: Store[] = [stores.find((s) => s.isMain)!];
    for (const s of stores) {
      if (!s.isMain && rng() < 0.45) stockedStores.push(s);
    }

    for (const store of stockedStores) {
      const avgMonthly = Math.round(20 + rng() * 400);
      const reorderPoint = Math.round(avgMonthly * (0.5 + rng()));
      const parLevel = Math.round(reorderPoint * (1.8 + rng()));
      reorder.push({
        medicationId: med.id,
        storeId: store.id,
        parLevel,
        reorderPoint,
        avgMonthlyConsumption: avgMonthly,
        leadTimeDays: pick(rng, [21, 30, 45, 60]),
      });

      // 1–3 batches with a spread of expiry dates. We bias a minority toward
      // already-expired / near-expiry so the expiry analytics have signal, and
      // we concentrate that exposure on a couple of planners.
      const nBatches = 1 + Math.floor(rng() * 3);
      const plannerIndex = planners.findIndex((p) => p.id === med.plannerId);
      // Oncology (index 2) and Antimicrobials (index 0) carry heavier expiry exposure.
      const expiryProne = plannerIndex === 2 ? 0.55 : plannerIndex === 0 ? 0.4 : 0.18;

      for (let b = 0; b < nBatches; b++) {
        batchCounter += 1;
        let offsetDays: number;
        const roll = rng();
        if (roll < expiryProne * 0.5) {
          offsetDays = -Math.floor(rng() * 120) - 1; // already expired (1–120 days ago)
        } else if (roll < expiryProne) {
          offsetDays = Math.floor(rng() * 60); // expiring within 60 days
        } else if (roll < expiryProne + 0.2) {
          offsetDays = 60 + Math.floor(rng() * 120); // 2–6 months
        } else {
          offsetDays = 180 + Math.floor(rng() * 540); // 6–24 months
        }
        const qty = Math.round(10 + rng() * (store.isMain ? 900 : 200));
        batches.push({
          id: `BAT-${String(batchCounter).padStart(5, "0")}`,
          medicationId: med.id,
          storeId: store.id,
          batchNo: `B${med.code.slice(2)}-${1000 + batchCounter}`,
          qtyOnHand: qty,
          expiryDate: addDays(asOf, offsetDays),
          unitCost: med.unitCost,
        });
      }
    }
  }

  // Withdrawals across the trailing 12 months.
  const withdrawals: Withdrawal[] = [];
  const startDate = addMonths(asOf, -12);
  const startMs = new Date(startDate).getTime();
  const spanMs = new Date(asOf).getTime() - startMs;

  // Give each medication a baseline popularity so rankings are stable & realistic.
  const popularity = new Map<string, number>();
  for (const med of medications) popularity.set(med.id, 0.2 + rng() * rng() * 3);
  const popTotal = [...popularity.values()].reduce((a, b) => a + b, 0);

  for (let i = 0; i < targetWithdrawals; i++) {
    // Weighted medication choice by popularity.
    let r = rng() * popTotal;
    let chosen = medications[0];
    for (const med of medications) {
      r -= popularity.get(med.id)!;
      if (r <= 0) {
        chosen = med;
        break;
      }
    }
    const store = weightedStore(rng, stores);
    const dayMs = startMs + Math.floor(rng() * spanMs);
    const date = toISODate(new Date(dayMs));
    const baseQty = chosen.unit === "TAB" || chosen.unit === "CAP" ? 30 : 5;
    const qty = Math.max(1, Math.round(baseQty * (0.3 + rng() * 2)));
    withdrawals.push({
      id: `WD-${String(i + 1).padStart(6, "0")}`,
      date,
      medicationId: chosen.id,
      fromStoreId: store.id,
      toDept: pick(rng, DEPARTMENTS),
      qty,
    });
  }

  return {
    generatedAt: asOf,
    planners,
    stores,
    medications,
    batches,
    reorder,
    withdrawals,
  };
}
