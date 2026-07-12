"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Crown, LockKeyhole } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const signingUp = mode === "sign-up";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const result = signingUp
      ? await authClient.signUp.email({
          email,
          password,
          name: String(formData.get("name") ?? "").trim(),
        })
      : await authClient.signIn.email({ email, password });
    if (result.error) {
      setError(result.error.message || "Authentication failed. Please try again.");
      setPending(false);
      return;
    }
    router.push(signingUp ? "/onboarding" : "/dashboard");
    router.refresh();
  }

  return (
    <main className="relative grid min-h-[100dvh] overflow-hidden lg:grid-cols-[1fr_1.05fr]">
      <div className="atmosphere-grain fixed inset-0 opacity-30" aria-hidden />
      <div className="strand-pattern fixed inset-0 opacity-40" aria-hidden />

      <section className="relative z-10 hidden flex-col justify-between p-10 lg:flex xl:p-14">
        <Link href="/" className="inline-flex items-center gap-3 font-heading text-xl tracking-tight neu-focus">
          <span className="brand-mark size-11">
            <Crown className="size-5" />
          </span>
          CrownScore
        </Link>
        <div className="max-w-md">
          <p className="section-label">{signingUp ? "Start tracking" : "Welcome back"}</p>
          <h1 className="mt-4 font-heading text-4xl leading-tight tracking-tight xl:text-5xl">
            {signingUp ? "Your crown photos, scored consistently." : "Pick up where your last check-in left off."}
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Account data syncs through Neon. Raw scalp photos stay on your device — only derived scores travel to the cloud.
          </p>
        </div>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <LockKeyhole className="size-3" />
          Sessions managed by Neon Auth
        </p>
      </section>

      <section className="relative z-10 grid place-items-center px-5 py-10 lg:border-l lg:border-border/60 lg:bg-card/40 lg:backdrop-blur-sm">
        <div className="glass-panel w-full max-w-md rounded-[36px] p-6 sm:p-8">
          <Link href="/" className="inline-flex items-center gap-3 font-heading text-xl tracking-tight neu-focus lg:hidden">
            <span className="brand-mark size-11">
              <Crown className="size-5" />
            </span>
            CrownScore
          </Link>
          <p className="section-label mt-8 lg:mt-0">{signingUp ? "Create account" : "Sign in"}</p>
          <h2 className="mt-3 font-heading text-3xl tracking-tight">
            {signingUp ? "Keep every check-in with you." : "Continue your progress."}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Neon Auth protects your account while Neon Postgres keeps your results available across devices.
          </p>
          <form action={submit} className="mt-8 space-y-5">
            {signingUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" autoComplete="name" required minLength={2} maxLength={80} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete={signingUp ? "new-password" : "current-password"} required minLength={8} />
            </div>
            {error && <p role="alert" className="rounded-2xl p-3 text-sm font-bold text-destructive neu-inset">{error}</p>}
            <Button type="submit" className="h-12 w-full" disabled={pending}>
              {pending ? "Securing your account…" : signingUp ? "Create account" : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {signingUp ? "Already have an account?" : "New to CrownScore?"}{" "}
            <Link className="font-bold text-primary" href={signingUp ? "/auth/sign-in" : "/auth/sign-up"}>
              {signingUp ? "Sign in" : "Create one"}
            </Link>
          </p>
          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground lg:hidden">
            <LockKeyhole className="size-3" />
            Passwords and sessions are managed by Neon Auth.
          </p>
        </div>
      </section>
    </main>
  );
}
