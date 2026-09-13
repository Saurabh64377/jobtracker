import type { Metadata } from "next";
import { TrendingUp, Briefcase, Calendar, CalendarRange, Wallet, Trophy } from "lucide-react";
import { requireUser } from "@/lib/api/guards";
import {
  getApplicationCounts,
  getConversionRates,
  getSourceBreakdown,
  getSalaryStats,
  getAnalyticsFunnel,
  getRoleAndLocationBreakdown,
} from "@/lib/services/analytics-service";
import { StatCard } from "@/components/dashboard/stat-card";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { SourceChart } from "@/components/analytics/source-chart";
import { BreakdownBars } from "@/components/analytics/breakdown-bars";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const user = await requireUser();

  const [counts, conversion, sources, salary, funnel, breakdown] = await Promise.all([
    getApplicationCounts(user.id),
    getConversionRates(user.id),
    getSourceBreakdown(user.id),
    getSalaryStats(user.id),
    getAnalyticsFunnel(user.id),
    getRoleAndLocationBreakdown(user.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">What&apos;s actually working in your job search.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Applications" value={counts.total} icon={Briefcase} accent="primary" />
        <StatCard label="This Week" value={counts.thisWeek} icon={Calendar} />
        <StatCard label="This Month" value={counts.thisMonth} icon={CalendarRange} />
        <StatCard label="This Year" value={counts.thisYear} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Source performance</CardTitle>
          </CardHeader>
          <CardContent>
            {sources.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Add applications from different sources to see a comparison.
              </p>
            ) : (
              <SourceChart data={sources} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Conversion funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart data={funnel} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="App → Response" value={`${conversion.applicationToResponse}%`} icon={TrendingUp} accent="primary" />
        <StatCard label="Response → Interview" value={`${conversion.responseToInterview}%`} icon={TrendingUp} accent="primary" />
        <StatCard label="Interview → Offer" value={`${conversion.interviewToOffer}%`} icon={Trophy} accent="success" />
        <StatCard label="App → Offer" value={`${conversion.applicationToOffer}%`} icon={Trophy} accent="success" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Salary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-semibold">{salary.avgExpected ? salary.avgExpected.toLocaleString() : "—"}</p>
                <p className="text-[11px] text-muted-foreground">Avg expected</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{salary.avgOffered ? salary.avgOffered.toLocaleString() : "—"}</p>
                <p className="text-[11px] text-muted-foreground">Avg offered</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{salary.highestOffer ? salary.highestOffer.toLocaleString() : "—"}</p>
                <p className="text-[11px] text-muted-foreground">Highest offer</p>
              </div>
            </div>
            {salary.byCompany.length > 0 && (
              <div className="space-y-1.5 border-t pt-3">
                {salary.byCompany.slice(0, 5).map((c) => (
                  <div key={c.company} className="flex items-center justify-between text-xs">
                    <span className="truncate font-medium">{c.company}</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Wallet className="size-3" /> {c.offered.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Top roles applied to</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownBars items={breakdown.roles.map((r) => ({ label: r.label, count: r.count }))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Top locations</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownBars items={breakdown.locations.map((l) => ({ label: l.label, count: l.count }))} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
