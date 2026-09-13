export function BreakdownBars({ items }: { items: { label: string; count: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));

  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Not enough data yet.</p>;
  }

  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="truncate font-medium">{item.label}</span>
            <span className="text-muted-foreground">{item.count}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
