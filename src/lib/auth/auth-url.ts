import type { DynamicBaseURLConfig } from "better-auth";

/** Canonical fallback also supports trusted, request-less calls such as the seed. */
export function createAuthBaseURL(canonicalURL: string): DynamicBaseURLConfig {
  const canonical = new URL(canonicalURL);
  if (canonical.protocol !== "http:" && canonical.protocol !== "https:") {
    throw new Error("BETTER_AUTH_URL must use HTTP or HTTPS.");
  }

  return {
    allowedHosts: [
      canonical.host,
      ...(canonical.hostname === "nbps.lupe.dev.br" && !canonical.port
        ? ["*.nbps.lupe.dev.br"]
        : []),
    ],
    protocol: canonical.protocol === "https:" ? "https" : "http",
    fallback: canonical.origin,
  };
}

// The same proxy-header policy must be used by auth and application email links.
export const authTrustedProxyHeaders = true;
