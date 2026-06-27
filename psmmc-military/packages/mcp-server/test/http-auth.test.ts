import { describe, it, expect } from "vitest";
import { resolveHttpAuth } from "../src/transports/http.js";
import { PLACEHOLDER_TOKEN, type Config } from "../src/config.js";

function cfg(overrides: Partial<Config>): Config {
  return {
    token: undefined,
    port: 8787,
    host: "0.0.0.0",
    dataDir: undefined,
    publicUrl: undefined,
    allowNoAuth: false,
    allowedHosts: [],
    allowedOrigins: [],
    ...overrides,
  };
}

describe("resolveHttpAuth (fail closed)", () => {
  it("accepts a strong token", () => {
    expect(resolveHttpAuth(cfg({ token: "a-strong-random-secret-1234" }))).toBe(
      "a-strong-random-secret-1234",
    );
  });

  it("rejects the example placeholder token", () => {
    expect(() => resolveHttpAuth(cfg({ token: PLACEHOLDER_TOKEN }))).toThrow(/placeholder/i);
  });

  it("rejects a too-short token", () => {
    expect(() => resolveHttpAuth(cfg({ token: "short" }))).toThrow(/too short/i);
  });

  it("refuses to start with no token by default", () => {
    expect(() => resolveHttpAuth(cfg({ token: undefined }))).toThrow(/without a token/i);
  });

  it("allows no token only with the explicit opt-in", () => {
    expect(resolveHttpAuth(cfg({ token: undefined, allowNoAuth: true }))).toBeNull();
  });
});
