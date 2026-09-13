"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { z } from "zod";

import { applicationSchema } from "@/lib/validations/application";
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABEL, JOB_SOURCE_LABEL } from "@/lib/constants/application-status";
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

type FormInput = z.input<typeof applicationSchema>;
type FormOutput = z.output<typeof applicationSchema>;

const defaultValues: FormInput = {
  companyName: "",
  jobTitle: "",
  jobDescription: "",
  jobUrl: "",
  jobSource: "LINKEDIN",
  jobReference: "",
  department: "",
  employmentType: "FULL_TIME",
  experienceRequired: "",
  currency: "INR",
  salaryPeriod: "ANNUAL",
  bonus: "",
  benefits: "",
  negotiationStatus: "NOT_STARTED",
  country: "India",
  state: "",
  city: "",
  officeLocation: "",
  workMode: "ONSITE",
  currentStatus: "APPLIED",
  priority: "MEDIUM",
  noticePeriod: "",
  isReferral: false,
  notes: "",
};

export function ApplicationForm({
  initialValues,
  applicationId,
}: {
  initialValues?: Partial<FormInput>;
  applicationId?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!applicationId;

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { ...defaultValues, ...initialValues },
  });

  async function onSubmit(values: FormOutput) {
    setIsSubmitting(true);
    try {
      const res = await fetch(isEdit ? `/api/applications/${applicationId}` : "/api/applications", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.error?.message ?? "Could not save application.");
        return;
      }
      toast.success(isEdit ? "Application updated." : "Application added.");
      router.push(`/applications/${json.data.id}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const { register, control, formState } = form;
  const errors = formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Job information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Company name *</Label>
            <Input {...register("companyName")} placeholder="Google" />
            {errors.companyName && <p className="text-xs text-destructive">{errors.companyName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Job title *</Label>
            <Input {...register("jobTitle")} placeholder="Full Stack Developer" />
            {errors.jobTitle && <p className="text-xs text-destructive">{errors.jobTitle.message}</p>}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Job description</Label>
            <Textarea {...register("jobDescription")} rows={4} placeholder="Paste the job description..." />
          </div>
          <div className="space-y-1.5">
            <Label>Job URL</Label>
            <Input {...register("jobUrl")} placeholder="https://..." />
            {errors.jobUrl && <p className="text-xs text-destructive">{errors.jobUrl.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Source</Label>
            <Controller
              control={control}
              name="jobSource"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{(v: string) => JOB_SOURCE_LABEL[v] ?? v}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(JOB_SOURCE_LABEL).map(([value, label]) => (
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
            <Label>Job reference / ID</Label>
            <Input {...register("jobReference")} />
          </div>
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Input {...register("department")} placeholder="Engineering" />
          </div>
          <div className="space-y-1.5">
            <Label>Employment type</Label>
            <Controller
              control={control}
              name="employmentType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full-time</SelectItem>
                    <SelectItem value="PART_TIME">Part-time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="INTERNSHIP">Internship</SelectItem>
                    <SelectItem value="FREELANCE">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Experience required</Label>
            <Input {...register("experienceRequired")} placeholder="2-4 years" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Compensation</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Expected minimum</Label>
            <Input type="number" {...register("expectedSalaryMin")} placeholder="600000" />
          </div>
          <div className="space-y-1.5">
            <Label>Expected maximum</Label>
            <Input type="number" {...register("expectedSalaryMax")} placeholder="900000" />
          </div>
          <div className="space-y-1.5">
            <Label>Offered salary</Label>
            <Input type="number" {...register("offeredSalary")} />
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Input {...register("currency")} placeholder="INR" />
          </div>
          <div className="space-y-1.5">
            <Label>Period</Label>
            <Controller
              control={control}
              name="salaryPeriod"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANNUAL">Annual</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Negotiation status</Label>
            <Controller
              control={control}
              name="negotiationStatus"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOT_STARTED">Not started</SelectItem>
                    <SelectItem value="IN_DISCUSSION">In discussion</SelectItem>
                    <SelectItem value="FINALIZED">Finalized</SelectItem>
                    <SelectItem value="DECLINED">Declined</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Bonus</Label>
            <Input {...register("bonus")} placeholder="Signing bonus, ESOPs..." />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Benefits</Label>
            <Input {...register("benefits")} placeholder="Health insurance, WFH stipend..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Location</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Country</Label>
            <Input {...register("country")} />
          </div>
          <div className="space-y-1.5">
            <Label>State</Label>
            <Input {...register("state")} />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input {...register("city")} />
          </div>
          <div className="space-y-1.5">
            <Label>Office location</Label>
            <Input {...register("officeLocation")} />
          </div>
          <div className="space-y-1.5">
            <Label>Work mode</Label>
            <Controller
              control={control}
              name="workMode"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONSITE">On-site</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                    <SelectItem value="REMOTE">Remote</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Application details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Application date</Label>
            <Input type="date" {...register("applicationDate")} />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Controller
              control={control}
              name="currentStatus"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{(v: string) => APPLICATION_STATUS_LABEL[v as never] ?? v}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {APPLICATION_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {APPLICATION_STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Application deadline</Label>
            <Input type="date" {...register("applicationDeadline")} />
          </div>
          <div className="space-y-1.5">
            <Label>Notice period</Label>
            <Input {...register("noticePeriod")} placeholder="30 days" />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <Controller
              control={control}
              name="isReferral"
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} id="isReferral" />
              )}
            />
            <Label htmlFor="isReferral" className="font-normal">
              This was a referral
            </Label>
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label>Notes</Label>
            <Textarea {...register("notes")} rows={3} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? "Save changes" : "Add application"}
        </Button>
      </div>
    </form>
  );
}
