import { describe, it, expect } from "vitest";
import type { Request } from "express";
import { extractToken, tokensMatch } from "../src/auth.js";

function mockReq(opts: { headers?: Record<string, string>; query?: Record<string, string> }): Request {
  const headers = opts.headers ?? {};
  return {
    header: (name: string) => headers[name.toLowerCase()],
    query: opts.query ?? {},
  } as unknown as Request;
}

describe("tokensMatch", () => {
  it("matches identical tokens", () => {
    expect(tokensMatch("s3cret-token", "s3cret-token")).toBe(true);
  });
  it("rejects different tokens", () => {
    expect(tokensMatch("wrong", "s3cret-token")).toBe(false);
  });
  it("rejects undefined and length mismatches without throwing", () => {
    expect(tokensMatch(undefined, "s3cret")).toBe(false);
    expect(tokensMatch("short", "longer-token")).toBe(false);
  });
});

describe("extractToken", () => {
  it("reads a Bearer authorization header", () => {
    const req = mockReq({ headers: { authorization: "Bearer abc123" } });
    expect(extractToken(req)).toBe("abc123");
  });
  it("reads X-API-Key", () => {
    const req = mockReq({ headers: { "x-api-key": "key-xyz" } });
    expect(extractToken(req)).toBe("key-xyz");
  });
  it("reads a ?token= query param", () => {
    const req = mockReq({ query: { token: "qtok" } });
    expect(extractToken(req)).toBe("qtok");
  });
  it("falls back to the path token", () => {
    const req = mockReq({});
    expect(extractToken(req, "path-token")).toBe("path-token");
  });
  it("returns undefined when nothing is supplied", () => {
    expect(extractToken(mockReq({}))).toBeUndefined();
  });
});
