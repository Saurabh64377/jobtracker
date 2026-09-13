"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { z } from "zod";

import { interviewSchema } from "@/lib/validations/interview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Application = { id: string; jobTitle: string; companyNameRaw: string | null; company: { name: string } | null };
type Contact = { id: string; name: string };

const ROUND_LABEL: Record<string, string> = {
  HR: "HR",
  TECHNICAL: "Technical",
  CODING: "Coding",
  MACHINE_CODING: "Machine Coding",
  SYSTEM_DESIGN: "System Design",
  MANAGERIAL: "Managerial",
  FINAL: "Final",
  OTHER: "Other",
};

type FormInput = z.input<typeof interviewSchema>;
type FormOutput = z.output<typeof interviewSchema>;

export function InterviewForm({
  interviewId,
  initialValues,
  defaultApplicationId,
}: {
  interviewId?: string;
  initialValues?: Partial<FormInput>;
  defaultApplicationId?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!interviewId;

  const { data: applications } = useQuery({
    queryKey: ["applications", "picker"],
    queryFn: async () => {
      const res = await fetch("/api/applications?pageSize=500");
      const json = await res.json();
      return (json.data?.items ?? []) as Application[];
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ["contacts", ""],
    queryFn: async () => {
      const res = await fetch("/api/contacts");
      const json = await res.json();
      return json.data as Contact[];
    },
  });

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      applicationId: defaultApplicationId ?? "",
      round: "TECHNICAL",
      startTime: "",
      endTime: "",
      timezone: "Asia/Kolkata",
      interviewerContactId: "",
      meetingLink: "",
      location: "",
      status: "SCHEDULED",
      companyResearch: "",
      preparationNotes: "",
      questionsAsked: "",
      result: "PENDING",
      followUpRequired: false,
      ...initialValues,
    },
  });

  async function onSubmit(values: FormOutput) {
    setIsSubmitting(true);
    try {
      const res = await fetch(isEdit ? `/api/interviews/${interviewId}` : "/api/interviews", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.error?.message ?? "Could not save interview.");
        return;
      }
      toast.success(isEdit ? "Interview updated." : "Interview scheduled.");
      router.push(`/interviews/${json.data.id}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const { register, control, formState } = form;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Interview details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Application *</Label>
            <Controller
              control={control}
              name="applicationId"
              render={({ field }) => (
                <Select value={field.value || null} onValueChange={(v) => field.onChange(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an application" />
                  </SelectTrigger>
                  <SelectContent>
                    {applications?.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.jobTitle} · {a.company?.name ?? a.companyNameRaw}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {formState.errors.applicationId && (
              <p className="text-xs text-destructive">{formState.errors.applicationId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Round</Label>
            <Controller
              control={control}
              name="round"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{(v: string) => ROUND_LABEL[v] ?? v}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROUND_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="RESCHEDULED">Rescheduled</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="NO_SHOW">No show</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Date *</Label>
            <Input type="date" {...register("scheduledDate")} />
            {formState.errors.scheduledDate && (
              <p className="text-xs text-destructive">{formState.errors.scheduledDate.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Timezone</Label>
            <Input {...register("timezone")} placeholder="Asia/Kolkata" />
          </div>
          <div className="space-y-1.5">
            <Label>Start time</Label>
            <Input type="time" {...register("startTime")} />
          </div>
          <div className="space-y-1.5">
            <Label>End time</Label>
            <Input type="time" {...register("endTime")} />
          </div>

          <div className="space-y-1.5">
            <Label>Interviewer</Label>
            <Controller
              control={control}
              name="interviewerContactId"
              render={({ field }) => (
                <Select value={field.value || null} onValueChange={(v) => field.onChange(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Meeting link</Label>
            <Input {...register("meetingLink")} placeholder="https://meet.google.com/..." />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Location</Label>
            <Input {...register("location")} placeholder="Office address, or 'Remote'" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Preparation</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Company research</Label>
            <Textarea {...register("companyResearch")} rows={3} placeholder="Products, tech stack, recent news..." />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Preparation notes</Label>
            <Textarea {...register("preparationNotes")} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>Difficulty</Label>
            <Controller
              control={control}
              name="difficulty"
              render={({ field }) => (
                <Select value={field.value || null} onValueChange={(v) => field.onChange(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Not rated" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Result</Label>
            <Controller
              control={control}
              name="result"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PASSED">Passed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="ON_HOLD">On hold</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Controller
              control={control}
              name="followUpRequired"
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} id="followUpRequired" />
              )}
            />
            <Label htmlFor="followUpRequired" className="font-normal">
              Follow-up required after this round
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? "Save changes" : "Schedule interview"}
        </Button>
      </div>
    </form>
  );
}
