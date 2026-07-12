import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAuth } from "@/server/firebase/api-auth";
import type { ApiResponse } from "@/server/domain/types";

const schema = z.object({
  treatment: z.enum(["MINOXIDIL", "FINASTERIDE", "GENERAL", "MONITORING"]).optional(),
  coachStyle: z.enum(["SUPPORTIVE", "DIRECT", "SCIENTIFIC", "MINIMAL"]).optional(),
  checkInFrequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "MANUAL"]).optional(),
});

export async function GET(request: Request) {
  const unauthorized = await requireApiAuth(request);
  if (unauthorized) return unauthorized;
  return NextResponse.json({
    success: true,
    data: { treatment: "MINOXIDIL", coachStyle: "SUPPORTIVE", checkInFrequency: "WEEKLY", source: "DEMO_DEFAULT" },
  });
}

export async function PATCH(request: Request) {
  const unauthorized = await requireApiAuth(request);
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: { code: "INVALID_JSON", message: "The request body is not valid JSON." } }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "INVALID_PREFERENCES", message: "Preferences were invalid.", details: parsed.error.issues } },
      { status: 400 },
    );
  }
  /* Persistence is client-local today; this endpoint validates and echoes until Firestore prefs are wired. */
  return NextResponse.json({ success: true, data: parsed.data });
}
