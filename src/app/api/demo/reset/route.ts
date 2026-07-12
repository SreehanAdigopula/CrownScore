import { NextResponse } from "next/server";
import { fixturesEnabled } from "@/server/firebase/api-auth";
import type { ApiResponse } from "@/server/domain/types";

export function POST() {
  if (!fixturesEnabled()) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: { code: "FIXTURES_DISABLED", message: "Internal fixtures are disabled." } }, { status: 403 });
  }
  /* Reset is a no-op server stub: guest check-ins live in the browser. Clients clear localStorage separately. */
  return NextResponse.json({ success: true, data: { deletedFixtureRecords: true, scope: "CURRENT_USER_ONLY", note: "Server fixtures are ephemeral; clear local browser data from Settings to reset guest history." } });
}
