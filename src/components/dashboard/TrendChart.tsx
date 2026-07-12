"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ProgressPoint } from "@/server/domain/types";

export function TrendChart({ data }: { data: ProgressPoint[] }) {
  return (
    <div className="h-72 w-full" aria-label="Visible-health CrownScore history chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6c63ff" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#6c63ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(61,72,82,.16)" vertical={false} />
          <XAxis dataKey="treatmentWeek" tickFormatter={(value) => `W${value}`} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#e0e5ec", border: "0", borderRadius: 16, color: "#3d4852", boxShadow: "9px 9px 16px rgb(163 177 198 / .6), -9px -9px 16px rgb(255 255 255 / .5)", fontSize: 12 }} labelFormatter={(value) => `Treatment week ${value}`} />
          <Area type="monotone" dataKey="healthScore" name="Visible-health score" stroke="#6c63ff" fill="url(#actualFill)" strokeWidth={3} connectNulls />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
