import { timingSafeEqual } from "node:crypto";
import type { Request } from "express";

/**
 * Extract a bearer token from a request. Accepts, in order:
 *   1. Authorization: Bearer <token>
 *   2. X-API-Key / X-PSMMC-Token header
 *   3. ?token=<token> query parameter
 *   4. a token captured from the URL path (req.params.token), passed in explicitly
 */
export function extractToken(req: Request, pathToken?: string): string | undefined {
  const auth = req.header("authorization");
  if (auth && /^Bearer\s+/i.test(auth)) return auth.replace(/^Bearer\s+/i, "").trim();
  const headerKey = req.header("x-api-key") || req.header("x-psmmc-token");
  if (headerKey) return headerKey.trim();
  const q = req.query.token;
  if (typeof q === "string" && q.length) return q.trim();
  if (pathToken) return pathToken;
  return undefined;
}

/** Constant-time comparison so the endpoint does not leak the token via timing. */
export function tokensMatch(provided: string | undefined, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
