import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { z } from "zod";
import { fixturesEnabled } from "@/server/firebase/api-auth";
import { createDemoDashboard } from "@/server/demo/demo-data";
import type { ApiResponse } from "@/server/domain/types";

const schema = z.object({ scenario: z.enum(["healthy", "shedding", "adherence", "safety"]).default("healthy") });

export async function POST(request: Request) {
  if (!fixturesEnabled()) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: { code: "FIXTURES_DISABLED", message: "Internal fixtures are disabled." } }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: { code: "INVALID_JSON", message: "The request body is not valid JSON." } }, { status: 400 });
  }

  try {
    const input = schema.parse(body);
    return NextResponse.json({ success: true, data: createDemoDashboard(input.scenario) });
  } catch (error) {
    const validation = error instanceof ZodError;
    return NextResponse.json<ApiResponse<never>>({
      success: false,
      error: { code: validation ? "INVALID_SCENARIO" : "SEED_FAILED", message: validation ? "Demo scenario was invalid." : "Demo seed failed.", details: validation ? error.issues : undefined },
    }, { status: validation ? 400 : 500 });
  }
}
