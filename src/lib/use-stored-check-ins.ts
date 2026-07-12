"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiClientError, fetchApiJson } from "@/lib/api-client";
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
      const session = await fetchApiJson<{ uid: string }>("/api/session", { cache: "no-store" });
      const marker = `${MIGRATION_KEY}:${session.uid}`;
      if (!localStorage.getItem(marker)) {
        const hasLocalPreferences = localStorage.getItem(ONBOARDING_KEY) != null;
        await fetchApiJson("/api/check-ins/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            records: local,
            ...(hasLocalPreferences ? { preferences: getOnboardingPrefs() } : {}),
          }),
        });
        localStorage.setItem(marker, new Date().toISOString());
      }

      const cloudData = await fetchApiJson<StoredCheckIn[]>("/api/check-ins", { cache: "no-store" });
      const previews = new Map(local.map((record) => [record.analysis.id, record.preview]));
      const cloudRecords = cloudData.map((record) => ({
        ...record,
        preview: previews.get(record.analysis.id) ?? null,
      }));
      localStorage.setItem(CHECK_INS_KEY, JSON.stringify(cloudRecords));
      setRecords(cloudRecords);
    } catch (syncError) {
      setError(
        syncError instanceof ApiClientError
          ? syncError.message
          : syncError instanceof Error
            ? syncError.message
            : "Cloud sync failed.",
      );
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void sync());
  }, [sync]);

  return { records, ready, error, retry: sync };
}
