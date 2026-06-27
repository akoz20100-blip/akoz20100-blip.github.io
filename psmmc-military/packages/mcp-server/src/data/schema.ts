import { z } from "zod";

/**
 * Domain model for the PSMMC pharmacy stock / reorder / expiry dashboard.
 *
 * The model mirrors the concepts the dashboard already computes:
 *  - effective stock (on-hand minus expired)
 *  - reorder intelligence (reorder point / par level vs. on-hand)
 *  - expiry intelligence (batches expiring / already expired)
 *  - planner ownership (each medication is owned by a planner / buyer)
 *
 * All quantities are in the medication's stock-keeping unit unless noted.
 */

export const ISODate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "expected an ISO date (YYYY-MM-DD)");

/** A person responsible for planning / purchasing a set of medications. */
export const PlannerSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameAr: z.string().optional(),
  section: z.string().optional(),
});
export type Planner = z.infer<typeof PlannerSchema>;

/** A physical store / pharmacy location that holds and issues stock. */
export const StoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameAr: z.string().optional(),
  /** Whether this is the central / main store. */
  isMain: z.boolean().default(false),
});
export type Store = z.infer<typeof StoreSchema>;

/** A medication / pharmacy item master record. */
export const MedicationSchema = z.object({
  id: z.string(),
  /** Internal item code used on the dashboard. */
  code: z.string(),
  genericName: z.string(),
  brandName: z.string().optional(),
  /** Dosage form, e.g. "Tablet", "Injection", "Syrup". */
  form: z.string(),
  strength: z.string().optional(),
  /** Anatomical Therapeutic Chemical class label. */
  atcClass: z.string().optional(),
  /** Stock-keeping unit, e.g. "EA", "BOX", "VIAL". */
  unit: z.string().default("EA"),
  /** Planner who owns this item. */
  plannerId: z.string(),
  /** Unit cost in SAR, used for valuation. */
  unitCost: z.number().nonnegative().default(0),
});
export type Medication = z.infer<typeof MedicationSchema>;

/** A batch of a medication held at a store, with its own expiry date. */
export const StockBatchSchema = z.object({
  id: z.string(),
  medicationId: z.string(),
  storeId: z.string(),
  batchNo: z.string(),
  qtyOnHand: z.number().nonnegative(),
  expiryDate: ISODate,
  /** Unit cost in SAR for this batch (defaults to the medication's unitCost). */
  unitCost: z.number().nonnegative().optional(),
});
export type StockBatch = z.infer<typeof StockBatchSchema>;

/** Reorder parameters for a medication at a store. */
export const ReorderParamSchema = z.object({
  medicationId: z.string(),
  storeId: z.string(),
  /** Maximum / par level. */
  parLevel: z.number().nonnegative(),
  /** Quantity at which a reorder should be triggered. */
  reorderPoint: z.number().nonnegative(),
  avgMonthlyConsumption: z.number().nonnegative(),
  leadTimeDays: z.number().nonnegative().default(30),
});
export type ReorderParam = z.infer<typeof ReorderParamSchema>;

/** A withdrawal / issue transaction: stock leaving a store toward a department. */
export const WithdrawalSchema = z.object({
  id: z.string(),
  date: ISODate,
  medicationId: z.string(),
  fromStoreId: z.string(),
  /** Receiving department / ward. */
  toDept: z.string(),
  qty: z.number().nonnegative(),
});
export type Withdrawal = z.infer<typeof WithdrawalSchema>;

/** The full normalized dataset the server queries. */
export const DatasetSchema = z.object({
  generatedAt: z.string().optional(),
  planners: z.array(PlannerSchema),
  stores: z.array(StoreSchema),
  medications: z.array(MedicationSchema),
  batches: z.array(StockBatchSchema),
  reorder: z.array(ReorderParamSchema),
  withdrawals: z.array(WithdrawalSchema),
});
export type Dataset = z.infer<typeof DatasetSchema>;
