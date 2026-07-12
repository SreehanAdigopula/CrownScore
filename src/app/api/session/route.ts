import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import type { ApiResponse } from "@/server/domain/types";

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "UNAUTHORIZED", message: "Sign in to continue." } },
      { status: 401 },
    );
  }
  return NextResponse.json({
    success: true,
    data: {
      uid: session.user.id,
      email: session.user.email,
      name: session.user.name,
      provider: "NEON_AUTH",
    },
  });
}
