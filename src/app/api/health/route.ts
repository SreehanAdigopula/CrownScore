import { NextResponse } from "next/server";
import { fixturesEnabled } from "@/server/firebase/api-auth";

export function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: "ok",
      internalFixturesEnabled: fixturesEnabled(),
      firebaseAuthRequired: process.env.REQUIRE_FIREBASE_AUTH === "true",
      timestamp: new Date().toISOString(),
    },
  });
}
