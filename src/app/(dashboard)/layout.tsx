import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { CommandPalette } from "@/components/shared/command-palette";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      isActive: true,
      onboardingCompleted: true,
    },
  });

  if (!user || !user.isActive) redirect("/login");
  if (!user.onboardingCompleted) redirect("/onboarding");

  return (
    <div className="flex min-h-svh">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
