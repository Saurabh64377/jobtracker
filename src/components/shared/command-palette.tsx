"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import {
  KanbanSquare,
  Users2,
  Building2,
  CalendarDays,
  CheckSquare,
  LineChart,
  FileText,
  LayoutDashboard,
  Plus,
  SunMoon,
  Search,
  StickyNote,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import type { SearchResult } from "@/lib/services/search-service";

const RESULT_ICON: Record<SearchResult["type"], typeof Users2> = {
  application: KanbanSquare,
  company: Building2,
  contact: Users2,
  interview: CalendarDays,
  note: StickyNote,
};

async function fetchSearch(query: string): Promise<SearchResult[]> {
  if (query.trim().length < 2) return [];
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  const json = await res.json();
  return json.data ?? [];
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { setTheme } = useTheme();
  const debouncedQuery = useDebouncedValue(query, 250);

  const { data: results, isFetching } = useQuery({
    queryKey: ["global-search", debouncedQuery],
    queryFn: () => fetchSearch(debouncedQuery),
    enabled: open && debouncedQuery.trim().length >= 2,
  });

  const groupedResults = useMemo(() => {
    const groups: Record<SearchResult["type"], SearchResult[]> = {
      application: [],
      company: [],
      contact: [],
      interview: [],
      note: [],
    };
    for (const r of results ?? []) groups[r.type].push(r);
    return groups;
  }, [results]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const isSearching = query.trim().length >= 2;

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command menu" description="Search and run commands">
      <CommandInput placeholder="Search applications, companies, contacts..." value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {isSearching && results && results.length > 0 && (
          <>
            {(Object.keys(groupedResults) as SearchResult["type"][]).map((type) =>
              groupedResults[type].length > 0 ? (
                <CommandGroup key={type} heading={type.charAt(0).toUpperCase() + type.slice(1) + "s"}>
                  {groupedResults[type].map((result) => {
                    const Icon = RESULT_ICON[result.type];
                    return (
                      <CommandItem key={result.id} value={`${type}-${result.id}`} onSelect={() => go(result.href)}>
                        <Icon />
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate">{result.title}</span>
                          {result.subtitle && (
                            <span className="truncate text-xs text-muted-foreground">{result.subtitle}</span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ) : null,
            )}
            <CommandSeparator />
          </>
        )}

        {!isSearching && (
          <>
            <CommandGroup heading="Create">
              <CommandItem value="new application" onSelect={() => go("/applications/new")}>
                <Plus /> New application
                <CommandShortcut>N</CommandShortcut>
              </CommandItem>
              <CommandItem value="new company" onSelect={() => go("/companies?new=1")}>
                <Plus /> New company
              </CommandItem>
              <CommandItem value="new interview" onSelect={() => go("/interviews/new")}>
                <Plus /> New interview
                <CommandShortcut>I</CommandShortcut>
              </CommandItem>
              <CommandItem value="new follow-up task" onSelect={() => go("/tasks?new=1")}>
                <Plus /> New follow-up / task
                <CommandShortcut>F</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Navigate">
              <CommandItem value="dashboard" onSelect={() => go("/dashboard")}>
                <LayoutDashboard /> Dashboard
                <CommandShortcut>D</CommandShortcut>
              </CommandItem>
              <CommandItem value="applications" onSelect={() => go("/applications")}>
                <KanbanSquare /> Applications
              </CommandItem>
              <CommandItem value="interviews" onSelect={() => go("/interviews")}>
                <Users2 /> Interviews
              </CommandItem>
              <CommandItem value="calendar" onSelect={() => go("/calendar")}>
                <CalendarDays /> Calendar
              </CommandItem>
              <CommandItem value="companies" onSelect={() => go("/companies")}>
                <Building2 /> Companies
              </CommandItem>
              <CommandItem value="tasks" onSelect={() => go("/tasks")}>
                <CheckSquare /> Tasks
              </CommandItem>
              <CommandItem value="analytics" onSelect={() => go("/analytics")}>
                <LineChart /> Analytics
              </CommandItem>
              <CommandItem value="resumes" onSelect={() => go("/resumes")}>
                <FileText /> Resumes
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Preferences">
              <CommandItem
                value="light mode"
                onSelect={() => {
                  setTheme("light");
                  setOpen(false);
                }}
              >
                <SunMoon /> Light mode
              </CommandItem>
              <CommandItem
                value="dark mode"
                onSelect={() => {
                  setTheme("dark");
                  setOpen(false);
                }}
              >
                <SunMoon /> Dark mode
              </CommandItem>
              <CommandItem
                value="system theme"
                onSelect={() => {
                  setTheme("system");
                  setOpen(false);
                }}
              >
                <SunMoon /> System theme
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {isSearching && isFetching && (!results || results.length === 0) && (
          <CommandGroup heading="Search">
            <CommandItem disabled value="searching">
              <Search /> Searching...
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
