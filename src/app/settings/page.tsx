"use client";

import { useState } from "react";
import { KeyRound, LockKeyhole, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { clearStoredCheckIns } from "@/lib/crownscore-client";

export default function SettingsPage() {
  const [deleted, setDeleted] = useState(false);
  return (
    <AppShell title="Settings">
      <div className="mx-auto max-w-3xl space-y-6 p-4 lg:p-10">
        <section className="neu-surface rounded-[32px] p-6">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight">Privacy and data</h1>
          <div className="mt-6 flex gap-3">
            <LockKeyhole className="mt-0.5 size-5 shrink-0 text-primary" />
            <div><p className="font-bold">Your progress photos stay private</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Local demo records stay in this browser. Production uploads are designed for user-scoped Firebase Storage paths once credentials are configured.</p></div>
          </div>
        </section>
        <section className="neu-surface rounded-[32px] p-6">
          <div className="flex gap-3">
            <KeyRound className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="font-heading font-extrabold tracking-tight">Firebase, Vercel, and API keys</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                <p>Nothing was removed. Firebase client/admin adapters, Firestore rules, Storage rules, and Vercel-ready env placeholders are still in the project.</p>
                <p>Real secrets should be added in `.env.local` locally and Vercel Project Settings for deployment. They should not be committed to GitHub.</p>
                <p>If `GROQ_API_KEY` is missing, CrownScore uses the deterministic mock coach so analysis still completes.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="neu-surface rounded-[32px] p-6">
          <h2 className="font-heading font-extrabold tracking-tight">What CrownScore can and cannot do</h2>
          <div className="mt-5 space-y-4 text-sm leading-6 text-muted-foreground">
            <p>Scores show relative change from your own baseline. They are not absolute or clinically validated density measurements.</p>
            <p>Expected curves are educational approximations, not medical predictions.</p>
            <p>AI summaries are educational and cannot diagnose, prescribe, or override fixed safety rules.</p>
          </div>
        </section>
        <section className="rounded-[32px] p-6 text-[#b42318] neu-inset">
          <h2 className="font-heading font-extrabold tracking-tight">Reset browser data</h2>
          <p className="mt-2 text-sm">This clears CrownScore check-ins saved in this browser and returns the app to first-run empty state.</p>
          <Dialog>
            <DialogTrigger asChild><Button variant="destructive" className="mt-5"><Trash2 />Reset all local data</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Reset this browser?</DialogTitle><DialogDescription>This removes local check-ins and the latest captured preview. It cannot be undone.</DialogDescription></DialogHeader>
              <DialogFooter><Button variant="destructive" onClick={() => { clearStoredCheckIns(); setDeleted(true); }}>Reset data</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          {deleted && <p className="mt-3 text-sm font-bold text-[#0f766e]">Local data cleared.</p>}
        </section>
      </div>
    </AppShell>
  );
}
