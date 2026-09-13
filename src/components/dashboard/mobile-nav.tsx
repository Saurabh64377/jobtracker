"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { mainNav, bottomNav } from "@/lib/constants/nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" />}>
        <Menu className="size-4.5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold tracking-tight" onClick={() => setOpen(false)}>
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Briefcase className="size-4" />
            </span>
            JobTrack
          </Link>
        </div>
        <div className="flex flex-1 flex-col justify-between overflow-y-auto p-3">
          <SidebarNav items={mainNav} onNavigate={() => setOpen(false)} />
          <SidebarNav items={bottomNav} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
