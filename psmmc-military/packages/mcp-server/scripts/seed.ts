import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import Papa from "papaparse";
import { generateDataset, type SeedOptions } from "../src/data/seed.js";

/**
 * Generate the demo dataset and write it to disk as both a single dataset.json
 * and one CSV per entity, so it can be inspected, diffed, or hand-edited.
 *
 * Usage:
 *   npm run seed -- [--out data] [--asOf 2026-06-26] [--seed 42] [--withdrawals 6500]
 */
function parseArgs(argv: string[]): { out: string } & SeedOptions {
  const opts: { out: string } & SeedOptions = { out: "data" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = argv[i + 1];
    if (a === "--out" && next) (opts.out = next), i++;
    else if (a === "--asOf" && next) (opts.asOf = next), i++;
    else if (a === "--seed" && next) (opts.seed = Number(next)), i++;
    else if (a === "--withdrawals" && next) (opts.withdrawals = Number(next)), i++;
  }
  return opts;
}

function writeCsv(dir: string, name: string, rows: unknown[]): void {
  writeFileSync(join(dir, `${name}.csv`), Papa.unparse(rows as object[]), "utf8");
}

function main(): void {
  const { out, ...seedOpts } = parseArgs(process.argv.slice(2));
  const outDir = resolve(process.cwd(), out);
  mkdirSync(outDir, { recursive: true });

  const dataset = generateDataset(seedOpts);

  writeFileSync(join(outDir, "dataset.json"), JSON.stringify(dataset, null, 2), "utf8");
  writeCsv(outDir, "planners", dataset.planners);
  writeCsv(outDir, "stores", dataset.stores);
  writeCsv(outDir, "medications", dataset.medications);
  writeCsv(outDir, "batches", dataset.batches);
  writeCsv(outDir, "reorder", dataset.reorder);
  writeCsv(outDir, "withdrawals", dataset.withdrawals);

  // eslint-disable-next-line no-console
  console.log(
    `[seed] wrote ${dataset.medications.length} medications, ${dataset.batches.length} batches, ` +
      `${dataset.withdrawals.length} withdrawals (asOf ${dataset.generatedAt}) to ${outDir}`,
  );
}

main();
