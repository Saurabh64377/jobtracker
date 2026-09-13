"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { passwordChangeSchema, type PasswordChangeInput } from "@/lib/validations/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<PasswordChangeInput>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: PasswordChangeInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.error?.message ?? "Could not change password.");
        return;
      }
      toast.success("Password changed.");
      form.reset();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-sm space-y-4">
      <div className="space-y-1.5">
        <Label>Current password</Label>
        <Input type="password" {...form.register("currentPassword")} />
        {form.formState.errors.currentPassword && (
          <p className="text-xs text-destructive">{form.formState.errors.currentPassword.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label>New password</Label>
        <Input type="password" {...form.register("newPassword")} />
        {form.formState.errors.newPassword && (
          <p className="text-xs text-destructive">{form.formState.errors.newPassword.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label>Confirm new password</Label>
        <Input type="password" {...form.register("confirmPassword")} />
        {form.formState.errors.confirmPassword && (
          <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Change password
      </Button>
    </form>
  );
}
