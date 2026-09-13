export function FunnelChart({ data }: { data: { stage: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="space-y-3">
      {data.map((d, i) => {
        const prev = i > 0 ? data[i - 1].count : d.count;
        const conversion = prev > 0 ? Math.round((d.count / prev) * 100) : 0;
        const width = Math.max(4, Math.round((d.count / max) * 100));

        return (
          <div key={d.stage} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{d.stage}</span>
              <span className="text-muted-foreground">
                {d.count}
                {i > 0 && <span className="ml-1.5">({conversion}%)</span>}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
