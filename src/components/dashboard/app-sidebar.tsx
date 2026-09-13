"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { mainNav, bottomNav } from "@/lib/constants/nav";

export function AppSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-card/50 lg:flex">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="size-4" />
          </span>
          JobTrack
        </Link>
      </div>
      <div className="flex flex-1 flex-col justify-between overflow-y-auto p-3">
        <SidebarNav items={mainNav} />
        <SidebarNav items={bottomNav} />
      </div>
    </aside>
  );
}
