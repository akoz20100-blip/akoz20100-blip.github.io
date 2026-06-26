/**
 * Vercel serverless entry point.
 *
 * Builds the Express app once per warm instance (sharing the loaded read-only
 * dataset) and exports it as the default handler. `vercel.json` rewrites every
 * path to this function, so POST /mcp and POST /<token>/mcp are served here.
 *
 * For a long-running host (Render / Railway / Fly / a VM / Docker) use
 * `npm run start:http` instead — see README.
 */
import { loadConfig } from "../src/config.js";
import { loadDataStore } from "../src/data/loader.js";
import { createHttpApp } from "../src/transports/http.js";

const config = loadConfig();
const { store } = loadDataStore(config.dataDir);
const app = createHttpApp(store, config);

export default app;
