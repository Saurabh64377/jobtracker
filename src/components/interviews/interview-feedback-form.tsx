"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { interviewFeedbackSchema, type InterviewFeedbackInput } from "@/lib/validations/interview";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function InterviewFeedbackForm({
  interviewId,
  initialValues,
}: {
  interviewId: string;
  initialValues?: Partial<InterviewFeedbackInput>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InterviewFeedbackInput>({
    resolver: zodResolver(interviewFeedbackSchema),
    defaultValues: {
      questionsAsked: "",
      questionsCouldNotAnswer: "",
      whatWentWell: "",
      whatWentBadly: "",
      improvements: "",
      result: "PENDING",
      nextAction: "",
      ...initialValues,
    },
  });

  async function onSubmit(values: InterviewFeedbackInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/interviews/${interviewId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      toast.success("Feedback saved.");
      router.refresh();
    } catch {
      toast.error("Could not save feedback.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Questions asked</Label>
          <Textarea {...form.register("questionsAsked")} rows={3} />
        </div>
        <div className="space-y-1.5">
          <Label>Questions I couldn&apos;t answer</Label>
          <Textarea {...form.register("questionsCouldNotAnswer")} rows={3} />
        </div>
        <div className="space-y-1.5">
          <Label>What went well</Label>
          <Textarea {...form.register("whatWentWell")} rows={3} />
        </div>
        <div className="space-y-1.5">
          <Label>What went badly</Label>
          <Textarea {...form.register("whatWentBadly")} rows={3} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>What should I improve?</Label>
          <Textarea {...form.register("improvements")} rows={3} />
        </div>
        <div className="space-y-1.5">
          <Label>Result</Label>
          <Controller
            control={form.control}
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
        <div className="space-y-1.5">
          <Label>Next action</Label>
          <Textarea {...form.register("nextAction")} rows={1} placeholder="Send thank-you note, wait for HR..." />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Save feedback
        </Button>
      </div>
    </form>
  );
}
