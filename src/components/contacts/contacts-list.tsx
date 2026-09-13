"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, User, Mail, Phone, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ContactFormDialog } from "@/components/contacts/contact-form-dialog";

type Contact = {
  id: string;
  name: string;
  designation: string | null;
  email: string | null;
  phone: string | null;
  contactType: string;
  company: { id: string; name: string } | null;
};

async function fetchContacts(search: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const res = await fetch(`/api/contacts?${params.toString()}`);
  const json = await res.json();
  return json.data as Contact[];
}

export function ContactsList() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["contacts", search],
    queryFn: () => fetchContacts(search),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground">Recruiters, HR, and everyone you&apos;ve talked to.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts..."
              className="w-56 pl-8"
            />
          </div>
          <ContactFormDialog onSaved={() => queryClient.invalidateQueries({ queryKey: ["contacts"] })} />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <User className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No contacts yet. Add the people you&apos;re talking to.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((contact) => (
            <Link
              key={contact.id}
              href={`/contacts/${contact.id}`}
              className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3.5 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{contact.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {contact.designation ?? "—"}
                  {contact.company && (
                    <>
                      {" "}
                      · <Building2 className="inline size-3" /> {contact.company.name}
                    </>
                  )}
                </p>
              </div>
              <div className="hidden shrink-0 items-center gap-3 text-xs text-muted-foreground sm:flex">
                {contact.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="size-3" /> {contact.email}
                  </span>
                )}
                {contact.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="size-3" /> {contact.phone}
                  </span>
                )}
              </div>
              <Badge variant="outline" className="shrink-0 text-[10px]">
                {contact.contactType.replace(/_/g, " ")}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
