import { NextResponse } from "next/server";
import type { ApiResponse } from "@/server/domain/types";

export async function POST(request: Request) {
  const requireFirebase = process.env.REQUIRE_FIREBASE_AUTH === "true";
  if (!requireFirebase) {
    return NextResponse.json({ success: true, data: { uid: "local-guest", isAnonymous: true, provider: "LOCAL_GUEST" } });
  }

  try {
    const { verifyBearerToken } = await import("@/server/firebase/admin");
    const decoded = await verifyBearerToken(request);
    return NextResponse.json({
      success: true,
      data: {
        uid: decoded.uid,
        isAnonymous: decoded.firebase.sign_in_provider === "anonymous",
        provider: "FIREBASE",
      },
    });
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "UNAUTHORIZED", message: "A valid Firebase ID token is required." } },
      { status: 401 },
    );
  }
}

export const GET = POST;
