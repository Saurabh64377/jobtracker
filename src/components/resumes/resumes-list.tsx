"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { FileText, Download, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ResumeUploadDialog } from "@/components/resumes/resume-upload-dialog";
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

type Resume = {
  id: string;
  name: string;
  targetRole: string | null;
  isDefault: boolean;
  fileSize: number | null;
  updatedAt: string;
};

async function fetchResumes() {
  const res = await fetch("/api/resumes");
  return (await res.json()).data as Resume[];
}

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function ResumesList() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["resumes"], queryFn: fetchResumes });

  async function setDefault(id: string) {
    await fetch(`/api/resumes/${id}/default`, { method: "POST" });
    queryClient.invalidateQueries({ queryKey: ["resumes"] });
    toast.success("Default resume updated.");
  }

  async function remove(id: string) {
    await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    queryClient.invalidateQueries({ queryKey: ["resumes"] });
    toast.success("Resume deleted.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Resume vault</h1>
          <p className="text-sm text-muted-foreground">Keep every version of your resume in one place.</p>
        </div>
        <ResumeUploadDialog onSaved={() => queryClient.invalidateQueries({ queryKey: ["resumes"] })} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <FileText className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No resumes uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((resume) => (
            <div key={resume.id} className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{resume.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{resume.targetRole ?? "—"}</p>
                  </div>
                </div>
                {resume.isDefault && <Badge>Default</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">
                Updated {format(new Date(resume.updatedAt), "MMM d, yyyy")} · {formatSize(resume.fileSize)}
              </p>
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="outline" render={<a href={`/api/resumes/${resume.id}/download`} />}>
                  <Download className="size-3.5" /> Download
                </Button>
                {!resume.isDefault && (
                  <Button size="sm" variant="ghost" onClick={() => setDefault(resume.id)}>
                    <Star className="size-3.5" /> Set default
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger render={<Button size="icon-sm" variant="ghost" className="ml-auto" />}>
                    <Trash2 className="size-3.5" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this resume?</AlertDialogTitle>
                      <AlertDialogDescription>
                        &quot;{resume.name}&quot; will be permanently removed. This can&apos;t be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove(resume.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
