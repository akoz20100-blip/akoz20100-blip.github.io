import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { generateDataset } from "../src/data/seed.js";
import { DataStore } from "../src/data/store.js";
import { buildServer } from "../src/server.js";

/** End-to-end MCP wiring: a real client talks to the server over an in-memory pair. */
async function connectedClient(store: DataStore): Promise<Client> {
  const server = buildServer({ store });
  const client = new Client({ name: "test-client", version: "0.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  return client;
}

let client: Client;

beforeAll(async () => {
  const store = new DataStore(generateDataset({ asOf: "2026-06-26", seed: 3, withdrawals: 1500 }));
  client = await connectedClient(store);
});

describe("MCP server", () => {
  it("advertises the expected tools", async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name);
    expect(names).toContain("top_withdrawn_medications");
    expect(names).toContain("planner_expiry_ranking");
    expect(names).toContain("data_overview");
    expect(names).toContain("withdrawals_breakdown");
  });

  it("exposes resources", async () => {
    const { resources } = await client.listResources();
    const uris = resources.map((r) => r.uri);
    expect(uris).toContain("psmmc://schema");
    expect(uris).toContain("psmmc://overview");
  });

  it("answers 'top 10 medications withdrawn from the main store'", async () => {
    const res = await client.callTool({
      name: "top_withdrawn_medications",
      arguments: { store: "main", limit: 10 },
    });
    const content = res.content as Array<{ type: string; text: string }>;
    const payload = JSON.parse(content[0].text);
    expect(payload.results.length).toBeLessThanOrEqual(10);
    expect(payload.store.name).toMatch(/main/i);
    expect(payload.results[0]).toHaveProperty("medication");
    expect(payload.results[0]).toHaveProperty("planner");
  });

  it("answers 'which planner has the most expired medication'", async () => {
    const res = await client.callTool({ name: "planner_expiry_ranking", arguments: {} });
    const content = res.content as Array<{ type: string; text: string }>;
    const payload = JSON.parse(content[0].text);
    expect(payload.results[0]).toHaveProperty("planner");
    expect(payload.results[0].rank).toBe(1);
  });

  it("surfaces a tool error for an ambiguous store instead of throwing", async () => {
    const res = await client.callTool({
      name: "top_withdrawn_medications",
      arguments: { store: "pharmacy" },
    });
    expect(res.isError).toBe(true);
  });
});
