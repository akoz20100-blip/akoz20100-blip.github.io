import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { DataStore } from "../data/store.js";
import { buildServer } from "../server.js";

/**
 * Start the stdio transport — used by desktop MCP clients (e.g. Claude Desktop)
 * that launch the server as a child process. Logs must go to stderr only; stdout
 * is reserved for the JSON-RPC stream.
 */
export async function startStdio(store: DataStore): Promise<void> {
  const server = buildServer({ store });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // eslint-disable-next-line no-console
  console.error("[psmmc-mcp] stdio transport ready.");
}
