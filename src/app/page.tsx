import Link from "next/link";
import {
  ArrowRight,
  Camera,
  ChartNoAxesCombined,
  Cpu,
  Crown,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
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
    title: "Vision stays on your phone",
    copy: "ONNX Runtime Web + YOLOv8n inference runs locally. Photos never need a cloud vision API.",
  },
  {
    title: "Scores you can explain",
    copy: "Class-aware NMS, gray-hair zero weight, and capped density classes keep every number traceable.",
  },
  {
    title: "Safety rules come first",
    copy: "Fixed rules review symptoms and image quality. The coach explains results — it cannot rewrite them.",
  },
] as const;

const signals = [
  { value: "0–100", label: "visible-health score" },
  { value: "On-device", label: "photo analysis" },
  { value: "No upload", label: "raw captures kept local" },
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
      <div className="strand-pattern fixed inset-0 z-0 opacity-60" aria-hidden />

      <nav className="relative z-20 mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-2xl font-heading text-xl tracking-tight neu-focus"
        >
          <span className="brand-mark size-11">
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

      <section className="relative z-10 mx-auto grid min-h-[calc(100dvh-5rem)] max-w-7xl items-center gap-10 px-5 pb-16 pt-4 md:grid-cols-[1.08fr_0.92fr] md:gap-6 md:pb-20">
        <div>
          <p className="reveal-up section-label">Scalp & hair progress</p>
          <h1 className="reveal-up reveal-delay-1 mt-4 font-heading text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95] tracking-tight">
            Track your crown,{" "}
            <span className="gradient-text">one frame at a time.</span>
          </h1>
          <BlurText
            text="Guided photos scored on-device. Educational progress — never a diagnosis."
            delay={55}
            animateBy="words"
            direction="top"
            className="reveal-up reveal-delay-2 mt-6 max-w-[22ch] text-lg leading-snug text-muted-foreground sm:text-xl"
            as="p"
          />
          <p className="reveal-up reveal-delay-3 mt-5 max-w-md text-sm leading-7 text-muted-foreground">
            CrownScore measures possible visible hair and scalp concerns from consistent crown photos. Your dashboard stays empty until a real check-in lands.
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
              className="inline-flex min-h-12 items-center rounded-2xl border border-border bg-card px-5 font-extrabold text-foreground transition hover:border-primary/40 neu-focus"
            >
              Open dashboard
            </Link>
          </div>
          <dl className="reveal-up reveal-delay-4 mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-border/70 pt-8">
            {signals.map((signal) => (
              <div key={signal.label}>
                <dt className="font-mono text-lg font-semibold text-primary sm:text-xl">{signal.value}</dt>
                <dd className="mt-1 text-[11px] font-bold leading-4 text-muted-foreground">{signal.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="reveal-up reveal-delay-2 relative flex min-h-[360px] items-center justify-center md:min-h-[520px]">
          <div className="scan-field absolute inset-0" aria-hidden />
          <div className="follicle-glow absolute inset-[6%] rounded-full blur-3xl" aria-hidden />
          <ScoreOrb size="xl" label="Waiting for first photo" />
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-20">
        <p className="section-label">How it works</p>
        <h2 className="mt-3 max-w-xl font-heading text-3xl tracking-tight sm:text-4xl">
          A focused check-in that only fills with your photos.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.title}
              className="neu-surface neu-lift rounded-[28px] p-6"
            >
              <span className="grid size-11 place-items-center rounded-2xl text-primary neu-inset">
                <step.icon className="size-5" />
              </span>
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
              Built for consistent scalp tracking.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              Vision model, scoring math, and a coach that cannot override safety — all working together behind one guided photo.
            </p>
          </div>
          <div className="space-y-0 rounded-[28px] border border-border/80 bg-card/60 backdrop-blur-sm">
            {depth.map((item, index) => (
              <div
                key={item.title}
                className={`flex gap-4 p-5 ${index > 0 ? "border-t border-border/70" : ""}`}
              >
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-accent/12 text-accent">
                  <Sparkles className="size-3.5" />
                </span>
                <div>
                  <h3 className="font-heading text-lg tracking-tight">{item.title}</h3>
                  <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <div className="flex flex-col gap-6 rounded-[32px] border border-accent/20 bg-accent/[0.04] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl text-accent neu-inset">
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

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-8">
        <div className="rounded-[36px] neu-surface-lg px-6 py-14 text-center sm:px-12">
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
