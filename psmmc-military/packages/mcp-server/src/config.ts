/** Runtime configuration, read once from the environment. */
export interface Config {
  token: string | undefined;
  port: number;
  host: string;
  dataDir: string | undefined;
  publicUrl: string | undefined;
  /** Explicit opt-in to run the HTTP transport with NO token (local dev only). */
  allowNoAuth: boolean;
  /** Host header allowlist for DNS-rebinding protection (empty = disabled). */
  allowedHosts: string[];
  /** Origin header allowlist for DNS-rebinding protection (empty = disabled). */
  allowedOrigins: string[];
}

/** Placeholder shipped in .env.example; must never be accepted as a real token. */
export const PLACEHOLDER_TOKEN = "change-me-to-a-long-random-secret";

function csv(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function loadConfig(): Config {
  return {
    token: process.env.PSMMC_MCP_TOKEN?.trim() || undefined,
    port: Number(process.env.PORT ?? 8787),
    host: process.env.HOST?.trim() || "0.0.0.0",
    dataDir: process.env.PSMMC_DATA_DIR?.trim() || undefined,
    publicUrl: process.env.PUBLIC_URL?.trim() || undefined,
    allowNoAuth: /^(1|true|yes)$/i.test(process.env.PSMMC_ALLOW_NO_AUTH?.trim() ?? ""),
    allowedHosts: csv(process.env.PSMMC_ALLOWED_HOSTS),
    allowedOrigins: csv(process.env.PSMMC_ALLOWED_ORIGINS),
  };
}

export const SERVER_NAME = "psmmc-pharmacy-dashboard";
export const SERVER_VERSION = "0.1.0";
