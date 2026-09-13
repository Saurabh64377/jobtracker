"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { z } from "zod";
import { goalSchema } from "@/lib/validations/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormInput = z.input<typeof goalSchema>;
type FormOutput = z.output<typeof goalSchema>;

export function GoalForm({ initialValues }: { initialValues?: Partial<FormInput> }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      period: "MONTHLY",
      applicationsTarget: 30,
      responsesTarget: 10,
      interviewsTarget: 5,
      offersTarget: 1,
      ...initialValues,
    },
  });

  async function onSubmit(values: FormOutput) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      toast.success("Goal saved.");
      router.refresh();
    } catch {
      toast.error("Could not save goal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <div className="space-y-1.5">
        <Label>Period</Label>
        <Controller
          control={form.control}
          name="period"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Applications target</Label>
          <Input type="number" {...form.register("applicationsTarget")} />
        </div>
        <div className="space-y-1.5">
          <Label>Responses target</Label>
          <Input type="number" {...form.register("responsesTarget")} />
        </div>
        <div className="space-y-1.5">
          <Label>Interviews target</Label>
          <Input type="number" {...form.register("interviewsTarget")} />
        </div>
        <div className="space-y-1.5">
          <Label>Offers target</Label>
          <Input type="number" {...form.register("offersTarget")} />
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Save goal
      </Button>
    </form>
  );
}
