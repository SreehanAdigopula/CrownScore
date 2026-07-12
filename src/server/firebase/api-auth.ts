import { NextResponse } from "next/server";
import type { ApiResponse } from "@/server/domain/types";

/** When REQUIRE_FIREBASE_AUTH=true, reject requests without a valid Firebase ID token. */
export async function requireApiAuth(request: Request): Promise<NextResponse | null> {
  if (process.env.REQUIRE_FIREBASE_AUTH !== "true") return null;
  try {
    const { verifyBearerToken } = await import("@/server/firebase/admin");
    await verifyBearerToken(request);
    return null;
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "UNAUTHORIZED", message: "A valid Firebase ID token is required." } },
      { status: 401 },
    );
  }
}

/** Internal fixture routes are opt-in via INTERNAL_FIXTURES_ENABLED=true. */
export function fixturesEnabled(): boolean {
  return process.env.INTERNAL_FIXTURES_ENABLED === "true";
}
