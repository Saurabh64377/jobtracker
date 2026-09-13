"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ApplicationsToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  function updateSearch(next: string) {
    setValue(next);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (next) params.set("search", next);
      else params.delete("search");
      router.replace(`/applications?${params.toString()}`);
    }, 300);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Applications</h1>
        <p className="text-sm text-muted-foreground">Drag cards across stages, or use the dropdown on each card.</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search applications..."
            className="w-56 pl-8"
          />
        </div>
        <Button render={<Link href="/applications/new"><Plus className="size-4" /> Add application</Link>} />
      </div>
    </div>
  );
}
