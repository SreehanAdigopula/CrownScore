"use client";

import { useEffect, useState } from "react";
import { KeyRound, LockKeyhole, Moon, ShieldCheck, Sun, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { applyCrownScoreTheme, getStoredCrownScoreTheme, persistCrownScoreTheme, type CrownScoreTheme } from "@/components/theme/ThemeController";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { clearStoredCheckIns } from "@/lib/crownscore-client";

const policies = [
  {
    title: "Photo storage policy",
    copy: "In guest mode, captures stay in this browser. In production, uploaded images must live in user-scoped Firebase Storage paths and be readable only by the signed-in owner.",
  },
  {
    title: "Firebase access policy",
    copy: "Firestore and Storage rules must reject cross-user reads/writes. Server routes verify Firebase ID tokens and never trust a client-supplied user id by itself.",
  },
  {
    title: "Vercel deployment policy",
    copy: "Preview and Production deployments keep separate environment variables. A deployment should fail closed if required server credentials are missing.",
  },
  {
    title: "API key policy",
    copy: "Provider keys, Firebase admin credentials, and private service values are server-only secrets. They must never be committed or exposed through NEXT_PUBLIC variables.",
  },
  {
    title: "AI coach policy",
    copy: "AI may explain fixed analysis results, but it cannot change the saved score, override safety flags, diagnose conditions, or prescribe treatment.",
  },
];

export default function SettingsPage() {
  const [deleted, setDeleted] = useState(false);
  const [theme, setTheme] = useState<CrownScoreTheme>(() => getStoredCrownScoreTheme());

  useEffect(() => {
    applyCrownScoreTheme(theme);
  }, [theme]);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <AppShell title="Settings">
      <div className="mx-auto max-w-3xl space-y-6 p-4 lg:p-10">
        <section className="neu-surface rounded-[28px] p-6">
          <p className="section-label">Appearance</p>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-heading text-2xl font-extrabold tracking-tight">Theme</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Switch CrownScore between the bright minimal UI and a dark workspace mode.
              </p>
            </div>
            <button
              type="button"
              aria-pressed={theme === "dark"}
              onClick={() => {
                setTheme(nextTheme);
                persistCrownScoreTheme(nextTheme);
              }}
              className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 text-sm font-extrabold transition hover:border-primary/40 hover:text-primary neu-focus"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              {theme === "dark" ? "Use light mode" : "Use dark mode"}
            </button>
          </div>
        </section>

        <section className="neu-surface rounded-[28px] p-6">
          <h2 className="font-heading text-2xl font-extrabold tracking-tight">Privacy and data</h2>
          <div className="mt-6 flex gap-3">
            <LockKeyhole className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="font-bold">Your progress photos stay private</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Guest records stay local to this browser. Production accounts should keep each check-in tied to the authenticated user who created it.
              </p>
            </div>
          </div>
        </section>

        <section className="neu-surface rounded-[28px] p-6">
          <div className="flex gap-3">
            <KeyRound className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="section-label">Policies</p>
              <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-tight">Firebase, Vercel, and API keys</h2>
              <div className="mt-5 divide-y divide-border rounded-3xl border border-border bg-muted/35">
                {policies.map((policy) => (
                  <div key={policy.title} className="p-4">
                    <p className="font-bold">{policy.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{policy.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="neu-surface rounded-[28px] p-6">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="font-heading text-2xl font-extrabold tracking-tight">What CrownScore can and cannot do</h2>
              <div className="mt-5 space-y-4 text-sm leading-6 text-muted-foreground">
                <p>Scores show relative change from your own baseline. They are not absolute or clinically validated density measurements.</p>
                <p>Expected curves are educational approximations, not medical predictions.</p>
                <p>AI summaries are educational and cannot diagnose, prescribe, or override fixed safety rules.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#fecaca] bg-[#fef2f2] p-6 text-[#991b1b] dark:border-[#7f1d1d] dark:bg-[#450a0a]/35 dark:text-[#fecaca]">
          <h2 className="font-heading text-2xl font-extrabold tracking-tight">Reset browser data</h2>
          <p className="mt-2 text-sm">This clears CrownScore check-ins saved in this browser and returns the app to first-run empty state.</p>
          <Dialog>
            <DialogTrigger asChild><Button variant="destructive" className="mt-5"><Trash2 />Reset all local data</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Reset this browser?</DialogTitle><DialogDescription>This removes local check-ins and the latest captured preview. It cannot be undone.</DialogDescription></DialogHeader>
              <DialogFooter><Button variant="destructive" onClick={() => { clearStoredCheckIns(); setDeleted(true); }}>Reset data</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          {deleted && <p className="mt-3 text-sm font-bold text-[#0f766e] dark:text-[#5eead4]">Local data cleared.</p>}
        </section>
      </div>
    </AppShell>
  );
}
