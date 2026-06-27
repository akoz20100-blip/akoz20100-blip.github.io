import express, { type Request, type Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Config } from "../config.js";
import { PLACEHOLDER_TOKEN, SERVER_NAME, SERVER_VERSION } from "../config.js";
import type { DataStore } from "../data/store.js";
import { buildServer } from "../server.js";
import { extractToken, tokensMatch } from "../auth.js";

/**
 * Validate the auth configuration for the HTTP transport and fail closed.
 * Called from createHttpApp so it runs on EVERY host (long-running and Vercel).
 * Returns the effective token (or null when auth is explicitly disabled).
 */
export function resolveHttpAuth(config: Config): string | null {
  if (config.token) {
    if (config.token === PLACEHOLDER_TOKEN) {
      throw new Error(
        "PSMMC_MCP_TOKEN is still the example placeholder. Set a real, long, random secret before exposing the server.",
      );
    }
    if (config.token.length < 16) {
      throw new Error("PSMMC_MCP_TOKEN is too short; use at least 16 random characters.");
    }
    return config.token;
  }
  if (config.allowNoAuth) return null; // explicit local-dev opt-in
  throw new Error(
    "Refusing to start the HTTP transport without a token. Set PSMMC_MCP_TOKEN to a strong secret, " +
      "or set PSMMC_ALLOW_NO_AUTH=1 for local development only.",
  );
}

/**
 * Build an Express app that serves the MCP server over Streamable HTTP in
 * stateless mode (one fresh MCP server + transport per request, sharing the
 * already-loaded read-only DataStore). Stateless keeps it serverless-friendly
 * and avoids cross-client session state.
 *
 * The endpoint is protected by a bearer token (PSMMC_MCP_TOKEN). The token may
 * be supplied as an Authorization: Bearer header (preferred), an X-API-Key
 * header, or as a path segment (POST /:token/mcp) so the connector can be added
 * to Claude as a single URL.
 */
export function createHttpApp(store: DataStore, config: Config) {
  const token = resolveHttpAuth(config); // throws if misconfigured (fail closed)

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
      authRequired: token !== null,
      hint: "Add this server to Claude as a custom connector pointing at the /mcp endpoint.",
    });
  });
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  const dnsProtection =
    config.allowedHosts.length > 0 || config.allowedOrigins.length > 0
      ? {
          enableDnsRebindingProtection: true,
          allowedHosts: config.allowedHosts.length ? config.allowedHosts : undefined,
          allowedOrigins: config.allowedOrigins.length ? config.allowedOrigins : undefined,
        }
      : {};

  const handleMcp = async (req: Request, res: Response, pathToken?: string) => {
    if (token !== null) {
      const provided = extractToken(req, pathToken);
      if (!tokensMatch(provided, token)) {
        res.status(401).json({
          jsonrpc: "2.0",
          error: { code: -32001, message: "Unauthorized: missing or invalid token." },
          id: null,
        });
        return;
      }
    }

    // Stateless: new server + transport per request, sharing the loaded data.
    const server = buildServer({ store });
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      ...dnsProtection,
    });
    res.on("close", () => {
      transport.close();
      server.close();
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      // Log details server-side; never leak internal error text to the client.
      console.error("[psmmc-mcp] request handler error:", err);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal error." },
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

  // Token-in-path variant: POST /<token>/mcp (single-URL connector).
  app.post("/:token/mcp", (req, res) => handleMcp(req, res, req.params.token));
  app.get("/:token/mcp", methodNotAllowed);
  app.delete("/:token/mcp", methodNotAllowed);

  return app;
}

/** Start the HTTP transport and log connection guidance (never the token itself). */
export function startHttp(store: DataStore, config: Config): void {
  const app = createHttpApp(store, config);
  app.listen(config.port, config.host, () => {
    const hasPublic = Boolean(config.publicUrl);
    const base = config.publicUrl ?? `http://localhost:${config.port}`;
    console.error(`[psmmc-mcp] Streamable HTTP listening on ${config.host}:${config.port}`);
    console.error(`[psmmc-mcp] MCP endpoint: ${base}/mcp`);
    if (!config.token) {
      console.error("[psmmc-mcp] WARNING: running WITHOUT a token (PSMMC_ALLOW_NO_AUTH). Do not expose this.");
    } else {
      console.error(
        "[psmmc-mcp] Auth: send the token as `Authorization: Bearer <token>`, or use the single-URL " +
          "connector form  <base>/<token>/mcp  (note: a token in the URL path can appear in proxy/access logs — rotate it if leaked).",
      );
    }
    if (!hasPublic) {
      console.error(
        "[psmmc-mcp] NOTE: PUBLIC_URL is unset, so the base above is localhost and is NOT reachable from a phone. " +
          "Set PUBLIC_URL=https://your-host (and place the server behind HTTPS) before sharing.",
      );
    }
  });
}
