import type { Metadata } from "next";
import { CalendarCheck, Trophy, XCircle } from "lucide-react";
import { getPlatformAnalytics } from "@/lib/services/admin-service";
import { StatCard } from "@/components/dashboard/stat-card";
import { AdminLineChart } from "@/components/admin/admin-line-chart";
import { BreakdownBars } from "@/components/analytics/breakdown-bars";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JOB_SOURCE_LABEL } from "@/lib/constants/application-status";

export const metadata: Metadata = { title: "Admin · Analytics" };

export default async function AdminAnalyticsPage() {
  const analytics = await getPlatformAnalytics();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Platform analytics</h1>
        <p className="text-sm text-muted-foreground">Last 30 days across all users.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">User registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminLineChart data={analytics.registrationsByDay} dataKey="registrations" name="Registrations" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Applications created</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminLineChart data={analytics.applicationsByDay} dataKey="applications" name="Applications" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Interviews (30d)" value={analytics.interviews} icon={CalendarCheck} accent="warning" />
        <StatCard label="Total Offers" value={analytics.offers} icon={Trophy} accent="success" />
        <StatCard label="Total Rejections" value={analytics.rejections} icon={XCircle} accent="destructive" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Most used job sources</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownBars items={analytics.sources.map((s) => ({ label: JOB_SOURCE_LABEL[s.source] ?? s.source, count: s.count }))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Most common job roles</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownBars items={analytics.roles.map((r) => ({ label: r.role, count: r.count }))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Work mode distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownBars
              items={analytics.workModes.map((w) => ({ label: w.mode.charAt(0) + w.mode.slice(1).toLowerCase(), count: w.count }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
