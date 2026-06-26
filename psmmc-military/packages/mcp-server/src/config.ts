/** Runtime configuration, read once from the environment. */
export interface Config {
  token: string | undefined;
  port: number;
  host: string;
  dataDir: string | undefined;
  publicUrl: string | undefined;
}

export function loadConfig(): Config {
  return {
    token: process.env.PSMMC_MCP_TOKEN?.trim() || undefined,
    port: Number(process.env.PORT ?? 8787),
    host: process.env.HOST?.trim() || "0.0.0.0",
    dataDir: process.env.PSMMC_DATA_DIR?.trim() || undefined,
    publicUrl: process.env.PUBLIC_URL?.trim() || undefined,
  };
}

export const SERVER_NAME = "psmmc-pharmacy-dashboard";
export const SERVER_VERSION = "0.1.0";
