"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ProgressPoint } from "@/server/domain/types";

export function TrendChart({ data }: { data: ProgressPoint[] }) {
  return <div className="h-72 w-full" aria-label="Actual and expected relative progress chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" stopOpacity={0.24} /><stop offset="100%" stopColor="#34d399" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} /><XAxis dataKey="treatmentWeek" tickFormatter={(v) => `W${v}`} tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis domain={[75, 125]} tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,.1)", borderRadius: 14, fontSize: 12 }} labelFormatter={(v) => `Treatment week ${v}`} /><Area type="monotone" dataKey="expectedScore" name="Expected demo curve" stroke="#71717a" fill="transparent" strokeDasharray="5 5" strokeWidth={2} /><Area type="monotone" dataKey="normalizedScore" name="Relative score" stroke="#34d399" fill="url(#actualFill)" strokeWidth={3} /></AreaChart></ResponsiveContainer></div>;
}
