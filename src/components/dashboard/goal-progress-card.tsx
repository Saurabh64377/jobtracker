import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";

type Goal = {
  applicationsTarget: number;
  interviewsTarget: number;
  offersTarget: number;
};

type Progress_ = {
  applications: number;
  interviews: number;
  offers: number;
};

export function GoalProgressCard({ goal, progress }: { goal: Goal | null; progress: Progress_ }) {
  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
        <Target className="size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">You haven&apos;t set a job-search goal yet.</p>
        <Button size="sm" render={<Link href="/settings?tab=goals">Set a goal</Link>} />
      </div>
    );
  }

  const rows = [
    { label: "Applications", value: progress.applications, target: goal.applicationsTarget },
    { label: "Interviews", value: progress.interviews, target: goal.interviewsTarget },
    { label: "Offers", value: progress.offers, target: goal.offersTarget },
  ].filter((r) => r.target > 0);

  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <div key={r.label} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{r.label}</span>
            <span className="text-muted-foreground">
              {r.value} / {r.target}
            </span>
          </div>
          <Progress value={Math.min(100, (r.value / r.target) * 100)} />
        </div>
      ))}
    </div>
  );
}
