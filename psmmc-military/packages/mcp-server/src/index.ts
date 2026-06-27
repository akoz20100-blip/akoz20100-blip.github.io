#!/usr/bin/env node
import { loadConfig } from "./config.js";
import { loadDataStore } from "./data/loader.js";
import { startStdio } from "./transports/stdio.js";
import { startHttp } from "./transports/http.js";

/**
 * Entry point. Chooses a transport from argv / env:
 *   --http   Streamable HTTP (remote custom connector)  [or MCP_TRANSPORT=http]
 *   --stdio  stdio (Claude Desktop)                      [default]
 */
async function main(): Promise<void> {
  const config = loadConfig();
  const argv = process.argv.slice(2);
  const wantHttp =
    argv.includes("--http") || (process.env.MCP_TRANSPORT ?? "").toLowerCase() === "http";

  const { store, source } = loadDataStore(config.dataDir);
  console.error(`[psmmc-mcp] data source: ${source}`);

  if (wantHttp) {
    startHttp(store, config);
  } else {
    await startStdio(store);
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[psmmc-mcp] fatal:", err);
  process.exit(1);
});
