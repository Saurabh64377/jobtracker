import type { Metadata } from "next";
import Link from "next/link";
import {
  Briefcase,
  MessageSquareReply,
  Users2,
  Trophy,
  XCircle,
  CalendarClock,
  CalendarDays,
  Plus,
} from "lucide-react";

import { requireUser } from "@/lib/api/guards";
import {
  getDashboardStats,
  getWeeklyApplicationChart,
  getApplicationFunnel,
  getRecentApplications,
  getUpcomingInterviews,
  getPendingFollowUps,
  getRecentActivity,
  getActiveGoal,
  getGoalProgress,
} from "@/lib/services/dashboard-service";

import { StatCard } from "@/components/dashboard/stat-card";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import {
  RecentApplicationsCard,
  UpcomingInterviewsCard,
  PendingFollowUpsCard,
  RecentActivityCard,
} from "@/components/dashboard/dashboard-lists";
import { GoalProgressCard } from "@/components/dashboard/goal-progress-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();

  const goal = await getActiveGoal(user.id);

  const [stats, weeklyChart, funnel, recentApplications, upcomingInterviews, pendingFollowUps, recentActivity, goalProgress] =
    await Promise.all([
      getDashboardStats(user.id),
      getWeeklyApplicationChart(user.id),
      getApplicationFunnel(user.id),
      getRecentApplications(user.id),
      getUpcomingInterviews(user.id),
      getPendingFollowUps(user.id),
      getRecentActivity(user.id),
      goal ? getGoalProgress(user.id, goal.periodStart, goal.periodEnd) : Promise.resolve(null),
    ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">Here&apos;s how your job search is going.</p>
        </div>
        <Button render={<Link href="/applications/new"><Plus className="size-4" /> Add application</Link>} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
        <StatCard label="Total Applications" value={stats.totalApplications} icon={Briefcase} accent="primary" />
        <StatCard label="Applied" value={stats.applied} icon={Briefcase} />
        <StatCard label="Responses" value={stats.responses} icon={MessageSquareReply} accent="primary" />
        <StatCard label="Interviews" value={stats.interviews} icon={Users2} accent="warning" />
        <StatCard label="Offers" value={stats.offers} icon={Trophy} accent="success" />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircle} accent="destructive" />
        <StatCard label="Follow-ups Due" value={stats.followUpsDue} icon={CalendarClock} accent="warning" />
        <StatCard label="Upcoming Interviews" value={stats.upcomingInterviews} icon={CalendarDays} accent="primary" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Applications over time</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyChart data={weeklyChart} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Application funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart data={funnel} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Upcoming interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <UpcomingInterviewsCard interviews={upcomingInterviews} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Follow-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <PendingFollowUpsCard followUps={pendingFollowUps} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Monthly goal</CardTitle>
          </CardHeader>
          <CardContent>
            <GoalProgressCard
              goal={goal}
              progress={goalProgress ?? { applications: 0, interviews: 0, offers: 0 }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Recent applications</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentApplicationsCard applications={recentApplications} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivityCard activities={recentActivity} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
