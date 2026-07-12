import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, UnauthorizedError } from "@/server/auth/require-user";
import { NeonUserRepository } from "@/server/repositories/neon-user-repository";
import type { ApiResponse } from "@/server/domain/types";

const schema = z.object({
  treatment: z.enum(["MINOXIDIL", "FINASTERIDE", "GENERAL", "MONITORING"]).optional(),
  coachStyle: z.enum(["SUPPORTIVE", "DIRECT", "SCIENTIFIC", "MINIMAL"]).optional(),
  checkInFrequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "MANUAL"]).optional(),
  startDate: z.string().date().nullable().optional(),
  theme: z.enum(["light", "dark"]).optional(),
  onboardingCompleted: z.boolean().optional(),
});

export async function GET() {
  try {
    const user = await requireUser();
    const profile = await new NeonUserRepository().getProfile(user);
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    const unauthorized = error instanceof UnauthorizedError;
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: unauthorized ? "UNAUTHORIZED" : "PROFILE_READ_FAILED", message: unauthorized ? "Sign in to view preferences." : "Preferences could not be loaded." } },
      { status: unauthorized ? 401 : 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: { code: "INVALID_PREFERENCES", message: "Preferences were invalid.", details: parsed.error.issues } },
        { status: 400 },
      );
    }
    const profile = await new NeonUserRepository().updateProfile(user, parsed.data);
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    const unauthorized = error instanceof UnauthorizedError;
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: unauthorized ? "UNAUTHORIZED" : "PROFILE_SAVE_FAILED", message: unauthorized ? "Sign in to save preferences." : "Preferences could not be saved." } },
      { status: unauthorized ? 401 : 500 },
    );
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();
    await new NeonUserRepository().deleteAllUserData(user.id);
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    const unauthorized = error instanceof UnauthorizedError;
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: unauthorized ? "UNAUTHORIZED" : "DATA_DELETE_FAILED", message: unauthorized ? "Sign in to delete account data." : "Account data could not be deleted." } },
      { status: unauthorized ? 401 : 500 },
    );
  }
}
