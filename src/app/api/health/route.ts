import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: "ok",
      internalFixturesEnabled: process.env.INTERNAL_FIXTURES_ENABLED === "true",
      persistence: "NEON_POSTGRES",
      authentication: "NEON_AUTH",
      timestamp: new Date().toISOString(),
    },
  });
}
