"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

import type { OnboardingInput } from "@/lib/validations/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STEPS = ["Your name", "Target role", "Locations", "Expected salary", "Work mode", "Monthly goal"] as const;

export function OnboardingWizard({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [locationsInput, setLocationsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OnboardingInput>({
    defaultValues: {
      name: defaultName,
      targetRole: "",
      preferredLocations: [],
      preferredWorkMode: "HYBRID",
      monthlyApplicationGoal: 20,
    },
  });
  const preferredWorkMode = useWatch({ control: form.control, name: "preferredWorkMode" });

  async function finish(skip = false) {
    setIsSubmitting(true);
    try {
      const values = skip ? {} : form.getValues();
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLast = step === STEPS.length - 1;

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <button onClick={() => finish(true)} className="hover:text-foreground">
            Skip for now
          </button>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} />
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">{STEPS[step]}</h2>

        {step === 0 && (
          <div className="space-y-2">
            <Label htmlFor="name">What should we call you?</Label>
            <Input id="name" {...form.register("name")} placeholder="Jane Doe" />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-2">
            <Label htmlFor="targetRole">What role are you targeting?</Label>
            <Input id="targetRole" {...form.register("targetRole")} placeholder="Full Stack Developer" />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <Label htmlFor="locations">Preferred locations</Label>
            <Input
              id="locations"
              value={locationsInput}
              onChange={(e) => {
                setLocationsInput(e.target.value);
                form.setValue(
                  "preferredLocations",
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                );
              }}
              placeholder="Bengaluru, Remote, Pune"
            />
            <p className="text-xs text-muted-foreground">Separate multiple locations with commas.</p>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="min">Minimum (₹ LPA)</Label>
              <Input id="min" type="number" {...form.register("expectedSalaryMin")} placeholder="6" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">Maximum (₹ LPA)</Label>
              <Input id="max" type="number" {...form.register("expectedSalaryMax")} placeholder="10" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-2">
            <Label>Preferred work mode</Label>
            <Select
              value={preferredWorkMode}
              onValueChange={(v) => form.setValue("preferredWorkMode", v as OnboardingInput["preferredWorkMode"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select work mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REMOTE">Remote</SelectItem>
                <SelectItem value="HYBRID">Hybrid</SelectItem>
                <SelectItem value="ONSITE">On-site</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-2">
            <Label htmlFor="goal">Applications per month goal</Label>
            <Input id="goal" type="number" {...form.register("monthlyApplicationGoal")} placeholder="20" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          <ArrowLeft className="size-4" /> Back
        </Button>
        {isLast ? (
          <Button onClick={() => finish(false)} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Finish
          </Button>
        ) : (
          <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
            Next <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
