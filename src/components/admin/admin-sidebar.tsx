"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { adminNav } from "@/lib/constants/nav";

export function AdminSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-card/50 lg:flex">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <span className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-4" />
          </span>
          JobTrack Admin
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between overflow-y-auto p-3">
        <SidebarNav items={adminNav} />
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to app
        </Link>
      </div>
    </aside>
  );
}
