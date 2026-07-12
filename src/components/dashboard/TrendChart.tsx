"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ProgressPoint } from "@/server/domain/types";

export function TrendChart({ data }: { data: ProgressPoint[] }) {
  const scores = data.flatMap((point) => (point.healthScore == null ? [] : [point.healthScore]));
  const summary =
    scores.length > 1
      ? `Visible-health score changed from ${scores[0]} to ${scores.at(-1)} across ${scores.length} check-ins.`
      : "One visible-health score is available.";

  return (
    <div className="h-72 w-full" role="img" aria-label={`Visible-health CrownScore history chart. ${summary}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.24} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="treatmentWeek" tickFormatter={(value) => `W${value}`} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              color: "var(--popover-foreground)",
              boxShadow: "0 18px 40px rgb(11 18 32 / .14)",
              fontSize: 12,
            }}
            labelFormatter={(value) => `Treatment week ${value}`}
          />
          <Area type="monotone" dataKey="healthScore" name="Visible-health score" stroke="var(--primary)" fill="url(#actualFill)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
