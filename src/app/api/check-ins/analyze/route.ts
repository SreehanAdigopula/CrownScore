import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireUser, UnauthorizedError } from "@/server/auth/require-user";
import { analyzeCheckIn } from "@/server/services/analysis-service";
import { analysisInputSchema } from "@/server/services/analysis-service";
import { NeonUserRepository } from "@/server/repositories/neon-user-repository";
import type { ApiResponse } from "@/server/domain/types";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: { code: "INVALID_JSON", message: "The request body is not valid JSON." } }, { status: 400 });
  }
  try {
    const user = await requireUser();
    const input = analysisInputSchema.parse(body);
    const data = await analyzeCheckIn(body);
    await new NeonUserRepository().saveCheckIn(user.id, data, { questionnaire: input.questionnaire });
    return NextResponse.json<ApiResponse<typeof data>>({ success: true, data });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: { code: "UNAUTHORIZED", message: "Sign in before saving a check-in." } },
        { status: 401 },
      );
    }
    const validation = error instanceof ZodError;
    return NextResponse.json<ApiResponse<never>>({ success: false, error: { code: validation ? "INVALID_ANALYSIS_INPUT" : "ANALYSIS_FAILED", message: validation ? "The check-in data was invalid." : "The analysis could not be completed.", details: validation ? error.issues : undefined } }, { status: validation ? 400 : 500 });
  }
}
