import { createHash, timingSafeEqual } from "node:crypto";
import type { Request } from "express";

/**
 * Extract a bearer token from a request. Accepts, in order:
 *   1. Authorization: Bearer <token>   (preferred — not written to access logs)
 *   2. X-API-Key / X-PSMMC-Token header
 *   3. a token captured from the URL path (req.params.token), passed in explicitly
 *
 * The `?token=` query parameter is deliberately NOT accepted: query strings are
 * the easiest place for a secret to leak (proxy/CDN/access logs, Referer headers).
 */
export function extractToken(req: Request, pathToken?: string): string | undefined {
  const auth = req.header("authorization");
  if (auth && /^Bearer\s+/i.test(auth)) return auth.replace(/^Bearer\s+/i, "").trim();
  const headerKey = req.header("x-api-key") || req.header("x-psmmc-token");
  if (headerKey) return headerKey.trim();
  if (pathToken) return pathToken;
  return undefined;
}

/**
 * Constant-time token comparison. Both sides are hashed to a fixed-length digest
 * first, so the comparison is constant-time regardless of input length and does
 * not leak the token length via timing.
 */
export function tokensMatch(provided: string | undefined, expected: string): boolean {
  if (!provided) return false;
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}
