import Link from "next/link";
import {
  ArrowRight,
  Camera,
  ChartNoAxesCombined,
  Cpu,
  Crown,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { ScoreOrb } from "@/components/brand/ScoreOrb";

const steps = [
  {
    icon: Camera,
    title: "Capture with a guide",
    copy: "A fixed oval keeps angle, distance, and light consistent enough to compare week to week.",
  },
  {
    icon: Cpu,
    title: "Score on your device",
    copy: "YOLOv8n runs in the browser. Visible concerns become a 0–100 score with quality checks.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Track what changed",
    copy: "Dashboard, history, and coach fill only after real check-ins — never fake starter data.",
  },
] as const;

const depth = [
  {
    title: "Vision stays local",
    copy: "ONNX Runtime Web + YOLOv8n inference runs on-device. Photos never need a cloud vision API.",
  },
  {
    title: "Scores you can explain",
    copy: "Class-aware NMS, gray-hair zero weight, and capped density classes keep every number traceable.",
  },
  {
    title: "Safety before the coach",
    copy: "Fixed rules review symptoms and image quality. The coach explains results — it cannot rewrite them.",
  },
] as const;

export default function Home() {
  return (
    <main id="main-content" className="relative min-h-[100dvh] overflow-x-hidden text-foreground">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-xl bg-foreground px-4 py-2 text-sm font-bold text-background transition focus:translate-y-0"
      >
        Skip to content
      </a>
      <div className="atmosphere-grain fixed inset-0 z-0" aria-hidden />
      <div className="strand-pattern fixed inset-0 z-0 opacity-50" aria-hidden />

      <nav className="relative z-20 mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:h-20">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-2xl font-heading text-lg tracking-tight neu-focus sm:gap-3 sm:text-xl"
        >
          <span className="brand-mark size-9 sm:size-11">
            <Crown className="size-4 sm:size-5" />
          </span>
          CrownScore
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/auth/sign-in"
            className="hidden px-3 py-2 text-sm font-bold text-muted-foreground transition hover:text-foreground sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className="rounded-2xl px-4 py-2.5 text-sm font-extrabold text-primary-foreground gradient-primary transition hover:-translate-y-0.5 neu-focus"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Brand-first hero: brand, one headline, one sentence, CTAs, dominant orb */}
      <section className="relative z-10 mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl items-center gap-8 px-5 pb-16 pt-2 sm:min-h-[calc(100dvh-5rem)] md:grid-cols-[0.95fr_1.05fr] md:gap-4 md:pb-20">
        <div className="relative z-10 order-2 text-center md:order-1 md:text-left">
          <h1 className="font-heading text-[clamp(3.25rem,14vw,7rem)] leading-[0.88] tracking-tight text-foreground">
            CrownScore
          </h1>
          <p className="mx-auto mt-5 max-w-[16ch] font-heading text-xl leading-tight tracking-tight text-foreground/90 sm:text-2xl md:mx-0 lg:text-3xl">
            One consistent photo. A careful visible-health score.
          </p>
          <p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-muted-foreground sm:text-base md:mx-0">
            Track possible visible hair and scalp concerns over time. Educational progress tool — not a diagnosis.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link
              href="/auth/sign-up"
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl px-5 font-extrabold text-primary-foreground gradient-primary transition hover:-translate-y-0.5 neu-focus"
            >
              Start check-in
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/auth/sign-in"
              className="inline-flex min-h-12 items-center rounded-2xl border border-border bg-card/80 px-5 font-extrabold text-foreground transition hover:border-primary/40 neu-focus"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="relative order-1 flex min-h-[300px] items-center justify-center md:order-2 md:min-h-[520px]">
          <div className="scan-field absolute inset-0" aria-hidden />
          <div className="follicle-glow absolute inset-[4%] rounded-full blur-3xl" aria-hidden />
          <div className="absolute inset-x-[18%] top-[12%] h-px overflow-hidden md:inset-x-[22%]" aria-hidden>
            <div className="scan-sweep-line h-24 w-full bg-gradient-to-b from-transparent via-accent/40 to-transparent" />
          </div>
          <ScoreOrb score={84} label="Example score" size="xl" />
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-20">
        <p className="section-label">The loop</p>
        <h2 className="mt-3 max-w-xl font-heading text-3xl tracking-tight sm:text-4xl">
          A focused check-in that only fills with your photos.
        </h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => (
            <article key={step.title} className="relative">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl text-primary neu-inset">
                  <step.icon className="size-5" />
                </span>
                <span className="font-mono text-xs font-semibold text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-5 font-heading text-xl tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="section-label">Under the hood</p>
            <h2 className="mt-3 font-heading text-3xl tracking-tight sm:text-4xl">
              Built like a product, not a prompt wrapper.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              Vision model, scoring math, and a coach that cannot override safety — visible in the product, not buried in a README.
            </p>
          </div>
          <div className="space-y-0">
            {depth.map((item, index) => (
              <div
                key={item.title}
                className={`border-t border-border/80 py-5 ${index === depth.length - 1 ? "border-b" : ""}`}
              >
                <h3 className="font-heading text-xl tracking-tight">{item.title}</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <div className="flex flex-col gap-6 border-y border-border/70 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl text-accent neu-inset">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h2 className="font-heading text-2xl tracking-tight">Careful by design</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                CrownScore reports possible visible concerns. It does not diagnose, prescribe, or claim clinical accuracy.
                Derived results sync through Neon. Raw photos are not uploaded or retained.
              </p>
            </div>
          </div>
          <Link
            href="/settings"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-bold text-foreground neu-focus"
          >
            <LockKeyhole className="size-4" />
            Privacy controls
          </Link>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-10">
        <div className="text-center">
          <h2 className="font-heading text-3xl tracking-tight sm:text-5xl">Ready for your first photo?</h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            Onboarding takes under a minute. Your dashboard stays empty until a usable check-in lands.
          </p>
          <Link
            href="/auth/sign-up"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-2xl px-6 font-extrabold text-primary-foreground gradient-primary transition hover:-translate-y-0.5 neu-focus"
          >
            Get started
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex max-w-7xl flex-col gap-3 border-t border-border/60 px-5 py-8 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>CrownScore is an educational progress tool, not a medical or diagnostic product.</p>
        <div className="flex gap-4">
          <Link href="/auth/sign-in" className="font-bold text-foreground hover:text-primary">
            Sign in
          </Link>
          <Link href="/settings" className="font-bold text-foreground hover:text-primary">
            Settings
          </Link>
        </div>
      </footer>
    </main>
  );
}
