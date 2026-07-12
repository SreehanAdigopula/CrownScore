import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, UnauthorizedError } from "@/server/auth/require-user";
import { NeonUserRepository } from "@/server/repositories/neon-user-repository";

const prefsSchema = z.object({
  treatment: z.enum(["MINOXIDIL", "FINASTERIDE", "GENERAL", "MONITORING"]),
  coachStyle: z.enum(["SUPPORTIVE", "DIRECT", "SCIENTIFIC", "MINIMAL"]),
  startDate: z.string().date().nullable(),
  checkInFrequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "MANUAL"]),
});

const recordSchema = z.object({
  analysis: z.object({
    id: z.string().min(1).max(128),
    capturedAt: z.string().datetime(),
    treatmentWeek: z.number().int().min(0).max(260),
    healthScore: z.number().int().min(0).max(100).nullable(),
    status: z.enum(["SCORED", "INSUFFICIENT_IMAGE"]),
    concerns: z.array(z.object({
      className: z.string().max(80),
      label: z.string().max(120),
      confidence: z.number().min(0).max(1),
      affectedArea: z.number().min(0).max(1),
      penalty: z.number(),
      count: z.number().int().nonnegative(),
    })).max(100),
    detections: z.array(z.unknown()).max(300),
    modelConfidence: z.number().min(0).max(1),
    uncertainty: z.number().min(0).max(1),
    quality: z.object({
      brightness: z.number().min(0).max(1),
      sharpness: z.number().min(0).max(1),
      contrast: z.number().min(0).max(1),
      rotation: z.number().min(0).max(180),
      subjectCoverage: z.number().min(0).max(1),
      warnings: z.array(z.string().max(120)).max(8),
      status: z.enum(["GOOD", "REVIEW", "INSUFFICIENT"]),
    }),
    safetyStatus: z.enum(["CLEAR", "WATCH", "SEEK_PROFESSIONAL_GUIDANCE"]),
    safetyRuleIds: z.array(z.string().max(100)).max(20),
    adherenceRate: z.number().min(0).max(100).nullable(),
    isDemoData: z.boolean(),
    algorithmVersion: z.literal("crownscore-visible-health-v1"),
    modelVersion: z.literal("hair-health-yolov8n-v1"),
    disclaimer: z.string().max(1000),
  }),
  coach: z.object({
    headline: z.string().max(200),
    summary: z.string().max(2000),
    nextStep: z.string().max(1000),
    regimenObservation: z.string().max(1000).nullable(),
    disclaimer: z.string().max(1000),
    fallbackUsed: z.boolean(),
  }),
  safetyReasons: z.array(z.string().max(500)).max(20),
});

const importSchema = z.object({
  records: z.array(recordSchema).max(500),
  preferences: prefsSchema.optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = importSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_IMPORT", message: "Local data could not be imported." } },
        { status: 400 },
      );
    }
    await new NeonUserRepository().importLocalData(
      user,
      parsed.data.records as Parameters<NeonUserRepository["importLocalData"]>[1],
      parsed.data.preferences,
    );
    return NextResponse.json({ success: true, data: { imported: parsed.data.records.length, migrationVersion: 1 } });
  } catch (error) {
    const unauthorized = error instanceof UnauthorizedError;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: unauthorized ? "UNAUTHORIZED" : "IMPORT_FAILED",
          message: unauthorized ? "Sign in before importing local data." : "Local data could not be imported. You can retry safely.",
        },
      },
      { status: unauthorized ? 401 : 500 },
    );
  }
}
