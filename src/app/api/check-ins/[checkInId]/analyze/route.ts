import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { analyzeCheckIn } from "@/server/services/analysis-service";
import type { ApiResponse } from "@/server/domain/types";

export async function POST(request: Request) {
  try {
    const data = await analyzeCheckIn(await request.json());
    return NextResponse.json<ApiResponse<typeof data>>({ success: true, data });
  } catch (error) {
    const validation = error instanceof ZodError;
    return NextResponse.json<ApiResponse<never>>({ success: false, error: { code: validation ? "INVALID_ANALYSIS_INPUT" : "ANALYSIS_FAILED", message: validation ? "The check-in data was invalid." : "The analysis could not be completed.", details: validation ? error.issues : undefined } }, { status: validation ? 400 : 500 });
  }
}
