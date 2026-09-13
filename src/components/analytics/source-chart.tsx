"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { JOB_SOURCE_LABEL } from "@/lib/constants/application-status";

type SourceData = { source: string; applications: number; responses: number; interviews: number; offers: number };

export function SourceChart({ data }: { data: SourceData[] }) {
  const chartData = data.map((d) => ({ ...d, label: JOB_SOURCE_LABEL[d.source] ?? d.source }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
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
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="applications" name="Applications" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="responses" name="Responses" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="interviews" name="Interviews" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="offers" name="Offers" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
