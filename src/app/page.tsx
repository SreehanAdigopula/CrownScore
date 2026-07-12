import Link from "next/link";
import { ArrowRight, Camera, ChartNoAxesCombined, Crown, LockKeyhole } from "lucide-react";
import BlurText from "@/components/BlurText";

export default function Home() {
  return (
    <main className="min-h-[100dvh] overflow-hidden bg-background text-foreground">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-3 rounded-2xl font-heading font-extrabold tracking-tight neu-focus">
          <span className="neu-inset grid size-11 place-items-center rounded-2xl text-primary"><Crown className="size-5" /></span>
          CrownScore
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="hidden px-3 py-2 text-sm font-bold text-muted-foreground hover:text-foreground sm:block">Dashboard</Link>
          <Link href="/onboarding" className="rounded-2xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] transition hover:-translate-y-0.5 neu-focus">Get started</Link>
        </div>
      </nav>
      <section className="mx-auto grid min-h-[calc(100dvh-5rem)] max-w-7xl items-center gap-10 px-5 py-10 md:grid-cols-[0.9fr_1.1fr] md:py-14">
        <div className="relative z-10">
          <p className="mb-5 text-sm font-bold text-primary">Visible health, explained carefully</p>
          <BlurText text="Score your crown from one consistent photo." delay={65} animateBy="words" direction="top" className="max-w-[13ch] font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl" />
          <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">CrownScore highlights possible visible hair and scalp concerns from a guided photo. It is not a diagnosis.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/onboarding" className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-primary px-5 font-extrabold text-primary-foreground shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] transition hover:-translate-y-0.5 neu-focus">Start check-in <ArrowRight className="size-4" /></Link>
            <Link href="/dashboard" className="inline-flex min-h-12 items-center rounded-2xl px-5 font-extrabold text-foreground neu-surface neu-focus">Open dashboard</Link>
          </div>
        </div>
        <div className="neu-surface-lg relative min-h-[420px] overflow-hidden rounded-[40px] p-6 md:min-h-[600px]">
          <div className="neu-inset-deep absolute inset-6 rounded-[32px]" />
          <div className="absolute left-1/2 top-1/2 grid size-56 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full neu-surface">
            <div className="grid size-36 place-items-center rounded-full text-primary neu-inset">
              <Crown className="size-16" />
            </div>
          </div>
          <div className="neu-surface absolute inset-x-8 bottom-8 rounded-[28px] p-5 sm:inset-x-auto sm:left-8 sm:w-72">
            <div className="flex items-end justify-between">
              <div><p className="text-xs font-bold text-muted-foreground">First-run state</p><p className="font-mono text-3xl font-semibold tracking-normal">0</p></div>
              <span className="text-sm font-bold text-primary">no data</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">No result is shown until a usable photo is analyzed.</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-20">
        <h2 className="max-w-lg font-heading text-3xl font-extrabold tracking-tight">A focused loop that only gets populated by your check-ins.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[[Camera, "Capture consistently", "A guided frame helps keep angle, distance, and lighting consistent."], [ChartNoAxesCombined, "Review visible concerns", "The score comes only from the current detector outputs and image quality."], [LockKeyhole, "Keep keys private", "Firebase and Groq credentials live in environment variables, not GitHub."]].map(([Icon, title, copy]) => { const I = Icon as typeof Camera; return <article key={String(title)} className="neu-surface rounded-[32px] p-6"><div className="neu-inset grid size-12 place-items-center rounded-2xl text-primary"><I className="size-5" /></div><h3 className="mt-5 font-heading font-extrabold tracking-tight">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{String(copy)}</p></article>; })}
        </div>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>CrownScore is an educational progress tool, not a medical or diagnostic product.</p>
        <Link href="/settings" className="font-bold text-foreground hover:text-primary">Privacy and data controls</Link>
      </footer>
    </main>
  );
}
