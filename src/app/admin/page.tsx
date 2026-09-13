import type { Metadata } from "next";
import { Users, UserCheck, UserPlus, Briefcase, CalendarCheck, Trophy, XCircle, Building2 } from "lucide-react";
import { getPlatformOverview } from "@/lib/services/admin-service";
import { StatCard } from "@/components/dashboard/stat-card";

export const metadata: Metadata = { title: "Admin Overview" };

export default async function AdminOverviewPage() {
  const overview = await getPlatformOverview();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Platform overview</h1>
        <p className="text-sm text-muted-foreground">JobTrack platform health at a glance.</p>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Users</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Total Users" value={overview.totalUsers} icon={Users} accent="primary" />
          <StatCard label="Active Users" value={overview.activeUsers} icon={UserCheck} accent="success" />
          <StatCard label="New Today" value={overview.newToday} icon={UserPlus} />
          <StatCard label="New This Week" value={overview.newThisWeek} icon={UserPlus} />
          <StatCard label="New This Month" value={overview.newThisMonth} icon={UserPlus} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Activity</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Applications" value={overview.totalApplications} icon={Briefcase} accent="primary" />
          <StatCard label="Interviews" value={overview.totalInterviews} icon={CalendarCheck} accent="warning" />
          <StatCard label="Offers" value={overview.totalOffers} icon={Trophy} accent="success" />
          <StatCard label="Rejected" value={overview.totalRejected} icon={XCircle} accent="destructive" />
          <StatCard label="Companies Tracked" value={overview.totalCompanies} icon={Building2} />
        </div>
      </div>
    </div>
  );
}
