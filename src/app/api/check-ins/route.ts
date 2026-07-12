import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/server/auth/require-user";
import { NeonUserRepository } from "@/server/repositories/neon-user-repository";

export async function GET() {
  try {
    const user = await requireUser();
    const records = await new NeonUserRepository().listCheckIns(user.id);
    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    const unauthorized = error instanceof UnauthorizedError;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: unauthorized ? "UNAUTHORIZED" : "CHECK_INS_READ_FAILED",
          message: unauthorized ? "Sign in to view your check-ins." : "Check-ins could not be loaded.",
        },
      },
      { status: unauthorized ? 401 : 500 },
    );
  }
}
