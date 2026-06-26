import express, { type Request, type Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Config } from "../config.js";
import { SERVER_NAME, SERVER_VERSION } from "../config.js";
import type { DataStore } from "../data/store.js";
import { buildServer } from "../server.js";
import { extractToken, tokensMatch } from "../auth.js";

/**
 * Build an Express app that serves the MCP server over Streamable HTTP in
 * stateless mode (one fresh MCP server + transport per request, sharing the
 * already-loaded read-only DataStore). Stateless keeps it serverless-friendly
 * and avoids cross-client session state.
 *
 * The endpoint is protected by a bearer token (PSMMC_MCP_TOKEN). The token may
 * be supplied as an Authorization header, an X-API-Key header, a ?token= query
 * param, or as a path segment (POST /:token/mcp) so the connector can be added
 * to Claude as a single URL.
 */
export function createHttpApp(store: DataStore, config: Config) {
  const app = express();
  app.use(express.json({ limit: "4mb" }));

  // Liveness / friendly landing — never requires auth, never leaks data.
  app.get("/", (_req, res) => {
    res.json({
      name: SERVER_NAME,
      version: SERVER_VERSION,
      status: "ok",
      transport: "streamable-http",
      mcpEndpoint: "/mcp",
      authRequired: Boolean(config.token),
      hint: "Add this server to Claude as a custom connector pointing at the /mcp endpoint.",
    });
  });
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  const handleMcp = async (req: Request, res: Response, pathToken?: string) => {
    if (config.token) {
      const provided = extractToken(req, pathToken);
      if (!tokensMatch(provided, config.token)) {
        res.status(401).json({
          jsonrpc: "2.0",
          error: { code: -32001, message: "Unauthorized: missing or invalid PSMMC_MCP_TOKEN." },
          id: null,
        });
        return;
      }
    }

    // Stateless: new server + transport per request, sharing the loaded data.
    const server = buildServer({ store });
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => {
      transport.close();
      server.close();
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: `Internal error: ${(err as Error).message}` },
          id: null,
        });
      }
    }
  };

  // Stateless mode does not support server-initiated SSE streams or session
  // teardown, so GET/DELETE return 405 per the MCP spec guidance.
  const methodNotAllowed = (_req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed. This stateless server only accepts POST /mcp." },
      id: null,
    });
  };

  app.post("/mcp", (req, res) => handleMcp(req, res));
  app.get("/mcp", methodNotAllowed);
  app.delete("/mcp", methodNotAllowed);

  // Token-in-path variant: POST /<token>/mcp
  app.post("/:token/mcp", (req, res) => handleMcp(req, res, req.params.token));
  app.get("/:token/mcp", methodNotAllowed);

  return app;
}

/** Start the HTTP transport and log connection guidance. */
export function startHttp(store: DataStore, config: Config): void {
  const app = createHttpApp(store, config);
  app.listen(config.port, config.host, () => {
    const base = config.publicUrl ?? `http://localhost:${config.port}`;
    // eslint-disable-next-line no-console
    console.error(`[psmmc-mcp] Streamable HTTP listening on ${config.host}:${config.port}`);
    if (!config.token) {
      console.error(
        "[psmmc-mcp] WARNING: PSMMC_MCP_TOKEN is not set — the endpoint is UNAUTHENTICATED. Set it before sharing.",
      );
    }
    console.error(`[psmmc-mcp] MCP endpoint:        ${base}/mcp`);
    if (config.token) {
      console.error(`[psmmc-mcp] Shareable connector URL: ${base}/${config.token}/mcp`);
    }
  });
}
