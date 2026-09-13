"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Building2,
  MapPin,
  Calendar,
  Wallet,
  MoreVertical,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_COLOR,
  APPLICATION_STATUS_LABEL,
  PRIORITY_COLOR,
} from "@/lib/constants/application-status";
import type { ApplicationStatus } from "@prisma/client";

type Props = {
  application: {
    id: string;
    jobTitle: string;
    currentStatus: ApplicationStatus;
    priority: string;
    workMode: string;
    city: string | null;
    applicationDate: Date;
    isArchived: boolean;
    jobUrl: string | null;
    expectedSalaryMin: number | null;
    expectedSalaryMax: number | null;
    offeredSalary: number | null;
    currency: string;
    company: { name: string } | null;
    companyNameRaw: string | null;
  };
};

function formatSalary(app: Props["application"]) {
  if (app.offeredSalary) return `${app.currency} ${app.offeredSalary.toLocaleString()} (offered)`;
  if (app.expectedSalaryMin || app.expectedSalaryMax) {
    return `${app.currency} ${app.expectedSalaryMin?.toLocaleString() ?? "?"} – ${app.expectedSalaryMax?.toLocaleString() ?? "?"}`;
  }
  return "Not specified";
}

export function ApplicationHeader({ application }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: async (status: ApplicationStatus) => {
      const res = await fetch(`/api/applications/${application.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json())?.error?.message ?? "Failed to update status");
    },
    onSuccess: () => {
      toast.success("Status updated");
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update status"),
  });

  const archiveMutation = useMutation({
    mutationFn: async (archived: boolean) => {
      const res = await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: archived }),
      });
      if (!res.ok) throw new Error("Failed to update");
    },
    onSuccess: (_data, archived) => {
      toast.success(archived ? "Application archived" : "Application restored");
      router.refresh();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/applications/${application.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      toast.success("Application deleted");
      router.push("/applications");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{application.jobTitle}</h1>
            <Badge className={PRIORITY_COLOR[application.priority]} variant="secondary">
              {application.priority}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Building2 className="size-3.5" />
              {application.company?.name ?? application.companyNameRaw ?? "Unknown company"}
            </span>
            {application.city && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {application.city} · {application.workMode.toLowerCase()}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              Applied {format(new Date(application.applicationDate), "MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1.5">
              <Wallet className="size-3.5" />
              {formatSalary(application)}
            </span>
            {application.jobUrl && (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="size-3.5" /> Job posting
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={application.currentStatus}
            onValueChange={(v) => statusMutation.mutate(v as ApplicationStatus)}
          >
            <SelectTrigger className="w-48">
              <Badge className={APPLICATION_STATUS_COLOR[application.currentStatus]} variant="secondary">
                <SelectValue>{(v: ApplicationStatus) => APPLICATION_STATUS_LABEL[v] ?? v}</SelectValue>
              </Badge>
            </SelectTrigger>
            <SelectContent>
              {APPLICATION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {APPLICATION_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" render={<Link href={`/applications/${application.id}/edit`} />}>
            <Pencil className="size-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => archiveMutation.mutate(!application.isArchived)}>
                {application.isArchived ? (
                  <>
                    <ArchiveRestore className="size-4" /> Restore
                  </>
                ) : (
                  <>
                    <Archive className="size-4" /> Archive
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="size-4" /> Delete
                    </DropdownMenuItem>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this application?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove &quot;{application.jobTitle}&quot; and its history. This can&apos;t be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMutation.mutate()}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
