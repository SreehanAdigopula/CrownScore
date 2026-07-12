import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";
import { installNeonAuthUpstreamFetchPatch } from "@/lib/auth/upstream-fetch-patch";

installNeonAuthUpstreamFetchPatch();

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
    // lax so post-sign-in redirects still carry the session cookie
    sameSite: "lax",
  },
  logLevel: "warn",
});
