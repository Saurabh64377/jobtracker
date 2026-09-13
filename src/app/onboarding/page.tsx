import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { Briefcase } from "lucide-react";

export const metadata: Metadata = { title: "Welcome" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, onboardingCompleted: true },
  });

  if (!user) redirect("/login");
  if (user.onboardingCompleted) redirect("/dashboard");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-muted/30 px-4 py-12">
      <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Briefcase className="size-4.5" />
        </span>
        JobTrack
      </div>
      <OnboardingWizard defaultName={user.name ?? ""} />
    </div>
  );
}
