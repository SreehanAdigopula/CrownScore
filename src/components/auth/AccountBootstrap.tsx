"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth/client";
import { ONBOARDING_KEY } from "@/lib/crownscore-client";
import { applyCrownScoreTheme, persistCrownScoreTheme } from "@/components/theme/ThemeController";

export function AccountBootstrap() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;
    const migrationMarker = `crownscore-neon-migration-v1:${userId}`;
    if (localStorage.getItem(ONBOARDING_KEY) && !localStorage.getItem(migrationMarker)) return;
    let cancelled = false;
    void fetch("/api/preferences", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success || cancelled) return;
        const profile = result.data;
        localStorage.setItem(ONBOARDING_KEY, JSON.stringify({
          treatment: profile.treatment,
          coachStyle: profile.coachStyle,
          startDate: profile.startDate,
          checkInFrequency: profile.checkInFrequency,
        }));
        if (profile.theme === "light" || profile.theme === "dark") {
          persistCrownScoreTheme(profile.theme);
          applyCrownScoreTheme(profile.theme);
        }
      })
      .catch(() => {
        // The last local cache remains usable during a transient sync failure.
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return null;
}
