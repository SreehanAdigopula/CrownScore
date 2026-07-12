"use client";

import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

type ScoreOrbProps = {
  score?: number | null;
  label?: string;
  size?: "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
};

const sizeMap = {
  md: "size-44 sm:size-52",
  lg: "size-56 sm:size-64 md:size-72",
  xl: "size-64 sm:size-80 md:size-[22rem]",
};

export function ScoreOrb({
  score = null,
  label = "Visible health",
  size = "lg",
  className,
  animate = true,
}: ScoreOrbProps) {
  const angle = score == null ? 0 : Math.max(12, Math.min(360, (score / 100) * 360));

  return (
    <div
      className={cn(
        "relative grid place-items-center",
        sizeMap[size],
        animate && "pulse-soft",
        className
      )}
      style={{ ["--score-angle" as string]: `${angle}deg` }}
    >
      <div className="score-ticks absolute -inset-[7%] rounded-full opacity-60" aria-hidden />
      <div className="score-ring absolute inset-0 rounded-full shadow-[0_30px_80px_var(--glow-primary)]" />
      <div className="relative z-10 flex flex-col items-center text-center">
        {score == null ? (
          <>
            <span className="grid size-14 place-items-center rounded-full text-primary neu-inset sm:size-16">
              <Crown className="size-7 sm:size-8" />
            </span>
            <p className="mt-3 font-heading text-lg tracking-tight sm:text-xl">CrownScore</p>
            <p className="mt-1 text-xs font-bold text-muted-foreground">{label}</p>
          </>
        ) : (
          <>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent">{label}</p>
            <p className="mt-1 font-mono text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">{score}</p>
            <p className="mt-1 text-xs font-bold text-muted-foreground">of 100</p>
          </>
        )}
      </div>
    </div>
  );
}
