import { createHash, timingSafeEqual } from "node:crypto";

type CronAuthorization = "authorized" | "forbidden" | "unauthorized";

interface CronRequestContext {
  authHeader: string | null;
  cronSecret: string | undefined;
  vercelEnv: string | undefined;
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest();
}

/**
 * Decides whether a request may run the scrape.
 * Only the Vercel production deployment may scrape, so preview and local copies
 * of the route never write even when they share production credentials.
 *
 * @param context - The request's Authorization header and the environment
 * @returns `forbidden` outside production, `unauthorized` on a missing or wrong
 *   secret
 */
export function authorizeCronRequest({
  authHeader,
  cronSecret,
  vercelEnv,
}: CronRequestContext): CronAuthorization {
  if (vercelEnv !== "production") {
    return "forbidden";
  }

  if (cronSecret === undefined || cronSecret === "" || authHeader === null) {
    return "unauthorized";
  }

  // Compare fixed-length digests so the comparison time leaks nothing about the secret
  return timingSafeEqual(sha256(authHeader), sha256(`Bearer ${cronSecret}`))
    ? "authorized"
    : "unauthorized";
}
