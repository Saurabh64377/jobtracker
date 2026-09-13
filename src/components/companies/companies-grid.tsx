"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Search, MapPin, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyFormDialog } from "@/components/companies/company-form-dialog";

type Company = {
  id: string;
  name: string;
  industry: string | null;
  location: string | null;
  size: string | null;
  _count: { applications: number; contacts: number; interviews: number };
};

async function fetchCompanies(search: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const res = await fetch(`/api/companies?${params.toString()}`);
  const json = await res.json();
  return json.data as Company[];
}

export function CompaniesGrid() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["companies", search],
    queryFn: () => fetchCompanies(search),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Companies</h1>
          <p className="text-sm text-muted-foreground">Every company you&apos;ve interacted with.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies..."
              className="w-56 pl-8"
            />
          </div>
          <CompanyFormDialog onSaved={() => queryClient.invalidateQueries({ queryKey: ["companies"] })} />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <Building2 className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No companies yet. Add one, or it&apos;ll be created automatically when you add an application.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.id}`}
              className="space-y-3 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{company.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{company.industry ?? "—"}</p>
                </div>
              </div>
              {company.location && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {company.location}
                </p>
              )}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Briefcase className="size-3" /> {company._count.applications} application
                {company._count.applications === 1 ? "" : "s"} · {company._count.contacts} contact
                {company._count.contacts === 1 ? "" : "s"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
