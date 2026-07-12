import { NextResponse } from "next/server";
import type { ApiResponse } from "@/server/domain/types";

export function POST() {
  if (process.env.INTERNAL_FIXTURES_ENABLED !== "true") {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: { code: "FIXTURES_DISABLED", message: "Internal fixtures are disabled." } }, { status: 403 });
  }
  return NextResponse.json({ success: true, data: { deletedFixtureRecords: true, scope: "FIXTURES_ONLY", note: "Server fixtures are ephemeral and separate from authenticated account data." } });
}
