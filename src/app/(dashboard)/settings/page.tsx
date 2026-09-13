import type { Metadata } from "next";
import { requireUser } from "@/lib/api/guards";
import { prisma } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/profile-form";
import { PasswordForm } from "@/components/settings/password-form";
import { GoalForm } from "@/components/settings/goal-form";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireUser();
  const { tab } = await searchParams;

  const [profile, goal] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: {
        name: true,
        email: true,
        targetRole: true,
        preferredLocations: true,
        expectedSalaryMin: true,
        expectedSalaryMax: true,
        preferredWorkMode: true,
        monthlyApplicationGoal: true,
      },
    }),
    prisma.goal.findFirst({
      where: { userId: user.id, periodEnd: { gte: new Date() } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, goals, and preferences.</p>
      </div>

      <Tabs defaultValue={tab === "goals" ? "goals" : tab === "security" ? "security" : "profile"}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Profile & preferences</CardTitle>
              <CardDescription>Used to personalize your dashboard and defaults.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm
                email={profile.email}
                initialValues={{
                  name: profile.name ?? "",
                  targetRole: profile.targetRole ?? "",
                  preferredLocations: Array.isArray(profile.preferredLocations)
                    ? (profile.preferredLocations as string[])
                    : [],
                  expectedSalaryMin: profile.expectedSalaryMin ?? undefined,
                  expectedSalaryMax: profile.expectedSalaryMax ?? undefined,
                  preferredWorkMode: profile.preferredWorkMode ?? "HYBRID",
                  monthlyApplicationGoal: profile.monthlyApplicationGoal ?? undefined,
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Job search goal</CardTitle>
              <CardDescription>Set a target for this period — shown on your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <GoalForm
                initialValues={
                  goal
                    ? {
                        period: goal.period,
                        applicationsTarget: goal.applicationsTarget,
                        responsesTarget: goal.responsesTarget,
                        interviewsTarget: goal.interviewsTarget,
                        offersTarget: goal.offersTarget,
                      }
                    : undefined
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Change password</CardTitle>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Theme</CardTitle>
              <CardDescription>Light, dark, or match your system.</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeToggle />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
