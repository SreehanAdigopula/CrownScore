import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { CheckInAnalysis, CoachOutput, CoachStyle, Questionnaire, TreatmentType } from "@/server/domain/types";
import type { CheckInFrequency, StoredCheckIn } from "@/lib/crownscore-client";

export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name"),
  treatment: text("treatment").$type<TreatmentType>().notNull().default("MINOXIDIL"),
  coachStyle: text("coach_style").$type<CoachStyle>().notNull().default("SUPPORTIVE"),
  startDate: date("start_date"),
  checkInFrequency: text("check_in_frequency").$type<CheckInFrequency>().notNull().default("WEEKLY"),
  theme: text("theme").$type<"light" | "dark">().notNull().default("light"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  localMigrationVersion: integer("local_migration_version").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const checkIns = pgTable(
  "check_ins",
  {
    id: text("id").notNull(),
    userId: text("user_id").notNull(),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull(),
    treatmentWeek: integer("treatment_week").notNull(),
    healthScore: integer("health_score"),
    status: text("status").$type<CheckInAnalysis["status"]>().notNull(),
    safetyStatus: text("safety_status").$type<CheckInAnalysis["safetyStatus"]>().notNull(),
    adherenceRate: real("adherence_rate"),
    analysis: jsonb("analysis").$type<CheckInAnalysis>().notNull(),
    coach: jsonb("coach").$type<CoachOutput>().notNull(),
    questionnaire: jsonb("questionnaire").$type<Questionnaire>(),
    safetyReasons: jsonb("safety_reasons").$type<string[]>().notNull().default([]),
    source: text("source").$type<"ANALYSIS" | "LOCAL_IMPORT">().notNull().default("ANALYSIS"),
    schemaVersion: integer("schema_version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.id] }),
    index("check_ins_user_captured_idx").on(table.userId, table.capturedAt),
    uniqueIndex("check_ins_owner_id_unique").on(table.userId, table.id),
  ],
);

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type CheckInRow = typeof checkIns.$inferSelect;
export type PersistedCheckIn = Omit<StoredCheckIn, "preview">;
