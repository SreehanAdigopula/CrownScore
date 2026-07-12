"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { getStoredCheckIns, type StoredCheckIn } from "@/lib/crownscore-client";

export default function DetailPage() {
  const params = useParams<{ checkInId: string }>();
  const [record] = useState<StoredCheckIn | null>(() => getStoredCheckIns().find((item) => item.analysis.id === params.checkInId) ?? null);

  if (!record) {
    return (
      <AppShell title="Check-in detail">
        <div className="mx-auto max-w-xl p-5">
          <section className="neu-surface rounded-[32px] p-8 text-center">
            <p className="text-muted-foreground">That check-in is not saved in this browser.</p>
            <Button asChild className="mt-6"><Link href="/history">Back to history</Link></Button>
          </section>
        </div>
      </AppShell>
    );
  }

  const point = record.analysis;
  return (
    <AppShell title="Check-in detail">
      <div className="mx-auto max-w-3xl p-4 lg:p-10">
        <section className="neu-surface rounded-[32px] p-6 sm:p-8">
          <p className="text-sm font-bold text-muted-foreground">{point.treatmentWeek === 0 ? "First check-in" : `Treatment week ${point.treatmentWeek}`}</p>
          <p className="metric-number mt-4">{point.healthScore ?? "--"}</p>
          <p className="mt-2 text-sm text-muted-foreground">Non-diagnostic visible-health score</p>
          <div className="mt-8 grid grid-cols-2 gap-5 rounded-[28px] p-5 sm:grid-cols-3 neu-inset-deep">
            <div><p className="text-xs text-muted-foreground">Visible concerns</p><p className="mt-1 font-bold">{point.concerns.length}</p></div>
            <div><p className="text-xs text-muted-foreground">Adherence</p><p className="mt-1 font-bold">{point.adherenceRate ?? "--"}{point.adherenceRate == null ? "" : "%"}</p></div>
            <div><p className="text-xs text-muted-foreground">Safety</p><p className="mt-1 font-bold">{point.safetyStatus}</p></div>
          </div>
          <p className="mt-8 text-xs leading-5 text-muted-foreground">Saved locally in this browser. Firebase persistence is available when project credentials are configured.</p>
          <Button asChild variant="outline" className="mt-6"><Link href="/history">Back to history</Link></Button>
        </section>
      </div>
    </AppShell>
  );
}
