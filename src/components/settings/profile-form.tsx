"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { z } from "zod";

import { profileSchema } from "@/lib/validations/settings";
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

type FormInput = z.input<typeof profileSchema>;
type FormOutput = z.output<typeof profileSchema>;

export function ProfileForm({
  email,
  initialValues,
}: {
  email: string;
  initialValues: FormInput;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationsInput, setLocationsInput] = useState((initialValues.preferredLocations ?? []).join(", "));

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: FormOutput) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      toast.success("Profile updated.");
      router.refresh();
    } catch {
      toast.error("Could not update profile.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input value={email} disabled />
      </div>
      <div className="space-y-1.5">
        <Label>Full name</Label>
        <Input {...form.register("name")} />
      </div>
      <div className="space-y-1.5">
        <Label>Target role</Label>
        <Input {...form.register("targetRole")} placeholder="Full Stack Developer" />
      </div>
      <div className="space-y-1.5">
        <Label>Preferred locations</Label>
        <Input
          value={locationsInput}
          onChange={(e) => {
            setLocationsInput(e.target.value);
            form.setValue(
              "preferredLocations",
              e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
            );
          }}
          placeholder="Bengaluru, Remote, Pune"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Expected minimum (₹)</Label>
          <Input type="number" {...form.register("expectedSalaryMin")} />
        </div>
        <div className="space-y-1.5">
          <Label>Expected maximum (₹)</Label>
          <Input type="number" {...form.register("expectedSalaryMax")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Preferred work mode</Label>
          <Controller
            control={form.control}
            name="preferredWorkMode"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REMOTE">Remote</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                  <SelectItem value="ONSITE">On-site</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Monthly application goal</Label>
          <Input type="number" {...form.register("monthlyApplicationGoal")} />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}
