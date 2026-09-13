"use client";

import { Search } from "lucide-react";

export function SearchTrigger() {
  function open() {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
  }

  return (
    <button
      onClick={open}
      className="flex h-8 w-full max-w-sm items-center gap-2 rounded-lg border bg-muted/40 px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
    >
      <Search className="size-3.5" />
      Search JobTrack...
      <kbd className="ml-auto hidden items-center gap-0.5 rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] sm:flex">
        Ctrl K
      </kbd>
    </button>
  );
}
