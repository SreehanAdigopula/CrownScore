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
    copy: "Raw captures are processed on-device and are not uploaded. Optional thumbnails remain a local browser cache; only derived analysis is retained in Neon.",
  },
  {
    title: "Neon ownership policy",
    copy: "Every database query derives ownership from the server-validated Neon Auth session. Client-supplied user IDs are never trusted.",
  },
  {
    title: "Vercel deployment policy",
    copy: "Preview and Production deployments keep separate environment variables. A deployment should fail closed if required server credentials are missing.",
  },
  {
    title: "API key policy",
    copy: "Provider keys, database credentials, and private service values are server-only secrets. They are never committed or exposed through NEXT_PUBLIC variables.",
  },
  {
    title: "AI coach policy",
    copy: "AI may explain fixed analysis results, but it cannot change the saved score, override safety flags, diagnose conditions, or prescribe treatment.",
  },
];

export default function SettingsPage() {
  const [deleted, setDeleted] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
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
                void fetch("/api/preferences", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ theme: nextTheme }),
                });
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
                Derived check-in results sync to your authenticated Neon-backed account. Raw captures are not uploaded or retained by CrownScore.
              </p>
            </div>
          </div>
        </section>

        <section className="neu-surface rounded-[28px] p-6">
          <div className="flex gap-3">
            <KeyRound className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="section-label">Policies</p>
              <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-tight">Neon, Vercel, and API keys</h2>
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
                <p>Scores summarize model-detected visible concerns in one image. They are not diagnoses or clinically validated health measurements.</p>
                <p>Gray hair is not penalized, and the score must not be used to infer age, ethnicity, sex, hairstyle, or hair type.</p>
                <p>AI summaries are educational and cannot diagnose, prescribe, or override fixed safety rules.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#fecaca] bg-[#fef2f2] p-6 text-[#991b1b] dark:border-[#7f1d1d] dark:bg-[#450a0a]/35 dark:text-[#fecaca]">
          <h2 className="font-heading text-2xl font-extrabold tracking-tight">Delete CrownScore data</h2>
          <p className="mt-2 text-sm">This permanently removes your profile and check-ins from Neon, then clears this browser cache. Your sign-in account remains active.</p>
          <Dialog>
            <DialogTrigger asChild><Button variant="destructive" className="mt-5"><Trash2 />Delete all CrownScore data</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Delete your CrownScore data?</DialogTitle><DialogDescription>This removes your cloud profile, derived results, and local cache. It cannot be undone.</DialogDescription></DialogHeader>
              <DialogFooter><Button variant="destructive" onClick={async () => {
                setDeleteError(null);
                const response = await fetch("/api/preferences", { method: "DELETE" });
                if (!response.ok) {
                  setDeleteError("Your data could not be deleted. Please retry.");
                  return;
                }
                clearStoredCheckIns();
                setDeleted(true);
              }}>Delete data</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          {deleted && <p className="mt-3 text-sm font-bold text-[#0f766e] dark:text-[#5eead4]">Cloud data and local cache deleted.</p>}
          {deleteError && <p className="mt-3 text-sm font-bold">{deleteError}</p>}
        </section>
      </div>
    </AppShell>
  );
}
