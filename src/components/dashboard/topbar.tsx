import { MobileNav } from "@/components/dashboard/mobile-nav";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/dashboard/user-menu";
import { NotificationsBell } from "@/components/dashboard/notifications-bell";
import { SearchTrigger } from "@/components/dashboard/search-trigger";

type Props = {
  user: { name: string | null; email: string; image: string | null; role: "USER" | "ADMIN" };
};

export function Topbar({ user }: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <MobileNav />
      <div className="flex-1">
        <SearchTrigger />
      </div>
      <div className="flex items-center gap-1">
        <NotificationsBell />
        <ThemeToggle />
        <UserMenu {...user} />
      </div>
    </header>
  );
}
