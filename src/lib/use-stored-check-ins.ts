"use client";

import { useEffect, useState } from "react";
import { getStoredCheckIns, type StoredCheckIn } from "@/lib/crownscore-client";

/** Loads local check-ins after mount so empty-state UIs do not flash before hydration. */
export function useStoredCheckIns() {
  const [records, setRecords] = useState<StoredCheckIn[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => setRecords(getStoredCheckIns());
    refresh();
    setReady(true);
    window.addEventListener("crownscore:check-ins", refresh);
    return () => window.removeEventListener("crownscore:check-ins", refresh);
  }, []);

  return { records, ready };
}
