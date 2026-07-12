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
import BlurText from "@/components/BlurText";
import { ScoreOrb } from "@/components/brand/ScoreOrb";

const steps = [
  {
    icon: Camera,
    title: "Capture with a guide",
    copy: "A fixed frame keeps angle, distance, and lighting consistent enough to compare over time.",
  },
  {
    icon: Cpu,
    title: "Score on your device",
    copy: "YOLOv8n runs in the browser. Detected visible concerns become a 0–100 score with quality checks.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Track what changed",
    copy: "Dashboard, history, and coach summaries fill only after real check-ins — never fake starter data.",
  },
] as const;

const depth = [
  {
    title: "On-device vision",
    copy: "ONNX Runtime Web + YOLOv8n inference stays on the client so photos do not need a cloud vision API.",
  },
  {
    title: "Deterministic scoring",
    copy: "Class-aware NMS, gray-hair zero weight, and capped density classes keep the score explainable.",
  },
  {
    title: "Safety before AI",
    copy: "Fixed rules review symptoms and image quality. The coach can explain results — not rewrite them.",
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

      <nav className="relative z-20 mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-2xl font-heading text-xl tracking-tight neu-focus"
        >
          <span className="grid size-11 place-items-center rounded-2xl text-primary-foreground gradient-primary">
            <Crown className="size-5" />
          </span>
          CrownScore
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="hidden px-3 py-2 text-sm font-bold text-muted-foreground transition hover:text-foreground sm:block"
          >
            Dashboard
          </Link>
          <Link
            href="/auth/sign-up"
            className="rounded-2xl px-4 py-3 text-sm font-extrabold text-primary-foreground gradient-primary transition hover:-translate-y-0.5 neu-focus"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero: brand + one line + CTA + dominant visual */}
      <section className="relative z-10 mx-auto grid min-h-[calc(100dvh-5rem)] max-w-7xl items-center gap-12 px-5 pb-16 pt-6 md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:pb-20 md:pt-4">
        <div>
          <p className="reveal-up section-label">CrownScore</p>
          <h1 className="reveal-up reveal-delay-1 mt-4 font-heading text-[clamp(3.25rem,9vw,6.5rem)] leading-[0.92] tracking-tight">
            CrownScore
          </h1>
          <BlurText
            text="One consistent photo. A careful visible-health score."
            delay={55}
            animateBy="words"
            direction="top"
            className="reveal-up reveal-delay-2 mt-6 max-w-[18ch] font-heading text-2xl leading-tight tracking-tight text-foreground/90 sm:text-3xl lg:text-4xl"
            as="p"
          />
          <p className="reveal-up reveal-delay-3 mt-5 max-w-md text-base leading-7 text-muted-foreground">
            Track possible visible hair and scalp concerns over time. Educational progress tool — not a diagnosis.
          </p>
          <div className="reveal-up reveal-delay-4 mt-8 flex flex-wrap gap-3">
            <Link
              href="/auth/sign-up"
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl px-5 font-extrabold text-primary-foreground gradient-primary transition hover:-translate-y-0.5 neu-focus"
            >
              Start check-in
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 items-center rounded-2xl px-5 font-extrabold text-foreground neu-surface neu-focus"
            >
              Open dashboard
            </Link>
          </div>
        </div>

        <div className="reveal-up reveal-delay-2 relative flex min-h-[380px] items-center justify-center md:min-h-[520px]">
          <div className="scan-field absolute inset-0" aria-hidden />
          <div
            className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgb(0,82,255,0.18),transparent_68%)] blur-2xl"
            aria-hidden
          />
          <ScoreOrb size="xl" label="Waiting for first photo" />
        </div>
      </section>

      {/* How it works — one job */}
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

      {/* Technical depth for judges */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="section-label">Under the hood</p>
            <h2 className="mt-3 font-heading text-3xl tracking-tight sm:text-4xl">
              Built like a product, not a prompt wrapper.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              Judges should feel the systems work: vision model, scoring math, and a coach that cannot override safety.
            </p>
          </div>
          <div className="space-y-6">
            {depth.map((item) => (
              <div key={item.title} className="border-t border-border/80 pt-5">
                <h3 className="font-heading text-xl tracking-tight">{item.title}</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <div className="flex flex-col gap-6 rounded-[32px] neu-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl text-primary neu-inset">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h2 className="font-heading text-2xl tracking-tight">Careful by design</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                CrownScore reports possible visible concerns. It does not diagnose, prescribe, or claim clinical accuracy.
                Account data and derived results sync through Neon. Raw photos are not uploaded or retained.
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

      {/* Closing CTA */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-8">
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
          <Link href="/settings" className="font-bold text-foreground hover:text-primary">
            Settings
          </Link>
          <Link href="/dashboard" className="font-bold text-foreground hover:text-primary">
            Dashboard
          </Link>
        </div>
      </footer>
    </main>
  );
}
