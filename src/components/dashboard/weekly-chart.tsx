"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function WeeklyChart({ data }: { data: { week: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="applicationsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
        <YAxis tickLine={false} axisLine={false} fontSize={11} width={28} allowDecimals={false} stroke="var(--muted-foreground)" />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--popover-foreground)",
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          name="Applications"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#applicationsFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
