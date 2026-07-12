import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { checkIns, profiles, type PersistedCheckIn } from "@/server/db/schema";
import type { CheckInFrequency, OnboardingPrefs } from "@/lib/crownscore-client";
import type { CoachStyle, Questionnaire, TreatmentType } from "@/server/domain/types";

export type ProfilePatch = Partial<{
  displayName: string | null;
  treatment: TreatmentType;
  coachStyle: CoachStyle;
  startDate: string | null;
  checkInFrequency: CheckInFrequency;
  theme: "light" | "dark";
  onboardingCompleted: boolean;
}>;

export class NeonUserRepository {
  async ensureProfile(user: { id: string; email: string; name: string | null }) {
    const [profile] = await getDb()
      .insert(profiles)
      .values({ userId: user.id, email: user.email, displayName: user.name })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: { email: user.email, displayName: user.name, updatedAt: new Date() },
      })
      .returning();
    return profile;
  }

  async getProfile(user: { id: string; email: string; name: string | null }) {
    return this.ensureProfile(user);
  }

  async updateProfile(user: { id: string; email: string; name: string | null }, patch: ProfilePatch) {
    await this.ensureProfile(user);
    const [profile] = await getDb()
      .update(profiles)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(profiles.userId, user.id))
      .returning();
    return profile;
  }

  async listCheckIns(userId: string): Promise<PersistedCheckIn[]> {
    const rows = await getDb()
      .select()
      .from(checkIns)
      .where(eq(checkIns.userId, userId))
      .orderBy(asc(checkIns.capturedAt))
      .limit(500);
    return rows.map((row) => ({
      analysis: row.analysis,
      coach: row.coach,
      safetyReasons: row.safetyReasons,
    }));
  }

  async getCheckIn(userId: string, id: string): Promise<PersistedCheckIn | null> {
    const [row] = await getDb()
      .select()
      .from(checkIns)
      .where(and(eq(checkIns.userId, userId), eq(checkIns.id, id)))
      .limit(1);
    return row ? { analysis: row.analysis, coach: row.coach, safetyReasons: row.safetyReasons } : null;
  }

  async saveCheckIn(
    userId: string,
    record: PersistedCheckIn,
    options: { questionnaire?: Questionnaire; source?: "ANALYSIS" | "LOCAL_IMPORT" } = {},
  ) {
    const { analysis, coach, safetyReasons } = record;
    await getDb()
      .insert(checkIns)
      .values({
        id: analysis.id,
        userId,
        capturedAt: new Date(analysis.capturedAt),
        treatmentWeek: analysis.treatmentWeek,
        healthScore: analysis.healthScore,
        status: analysis.status,
        safetyStatus: analysis.safetyStatus,
        adherenceRate: analysis.adherenceRate,
        analysis: { ...analysis, detections: [] },
        coach,
        questionnaire: options.questionnaire,
        safetyReasons,
        source: options.source ?? "ANALYSIS",
      })
      .onConflictDoUpdate({
        target: [checkIns.userId, checkIns.id],
        set: {
          analysis: { ...analysis, detections: [] },
          coach,
          safetyReasons,
          questionnaire: options.questionnaire,
          updatedAt: new Date(),
        },
      });
  }

  async importLocalData(
    user: { id: string; email: string; name: string | null },
    records: PersistedCheckIn[],
    prefs?: OnboardingPrefs,
  ) {
    await this.ensureProfile(user);
    for (const record of records) {
      await this.saveCheckIn(user.id, record, { source: "LOCAL_IMPORT" });
    }
    const profilePatch: ProfilePatch = prefs
      ? {
          treatment: prefs.treatment,
          coachStyle: prefs.coachStyle,
          startDate: prefs.startDate,
          checkInFrequency: prefs.checkInFrequency,
          onboardingCompleted: true,
        }
      : {};
    await getDb()
      .update(profiles)
      .set({ ...profilePatch, localMigrationVersion: 1, updatedAt: new Date() })
      .where(eq(profiles.userId, user.id));
  }

  async deleteAllUserData(userId: string) {
    await getDb().delete(checkIns).where(eq(checkIns.userId, userId));
    await getDb().delete(profiles).where(eq(profiles.userId, userId));
  }
}
