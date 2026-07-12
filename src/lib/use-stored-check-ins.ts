"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CHECK_INS_KEY,
  ONBOARDING_KEY,
  getOnboardingPrefs,
  getStoredCheckIns,
  type StoredCheckIn,
} from "@/lib/crownscore-client";

const MIGRATION_KEY = "crownscore-neon-migration-v1";

export function useStoredCheckIns() {
  const [records, setRecords] = useState<StoredCheckIn[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(async () => {
    setError(null);
    const local = getStoredCheckIns();
    setRecords(local);
    try {
      const sessionResponse = await fetch("/api/session", { cache: "no-store" });
      const sessionResult = await sessionResponse.json();
      if (!sessionResponse.ok || !sessionResult.success) throw new Error("Your session expired. Sign in again.");
      const marker = `${MIGRATION_KEY}:${sessionResult.data.uid}`;
      if (!localStorage.getItem(marker)) {
        const hasLocalPreferences = localStorage.getItem(ONBOARDING_KEY) != null;
        const importResponse = await fetch("/api/check-ins/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            records: local,
            ...(hasLocalPreferences ? { preferences: getOnboardingPrefs() } : {}),
          }),
        });
        const importResult = await importResponse.json();
        if (!importResponse.ok || !importResult.success) {
          throw new Error(importResult.error?.message ?? "Local data could not be synced.");
        }
        localStorage.setItem(marker, new Date().toISOString());
      }

      const response = await fetch("/api/check-ins", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message ?? "Check-ins could not be loaded.");
      const previews = new Map(local.map((record) => [record.analysis.id, record.preview]));
      const cloudRecords = (result.data as StoredCheckIn[]).map((record) => ({
        ...record,
        preview: previews.get(record.analysis.id) ?? null,
      }));
      localStorage.setItem(CHECK_INS_KEY, JSON.stringify(cloudRecords));
      setRecords(cloudRecords);
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Cloud sync failed.");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void sync());
  }, [sync]);

  return { records, ready, error, retry: sync };
}
