"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

import { companySchema, type CompanyInput } from "@/lib/validations/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

type Props = {
  mode?: "create" | "edit";
  companyId?: string;
  initialValues?: Partial<CompanyInput>;
  onSaved?: () => void;
  trigger?: React.ReactElement;
};

const defaults: CompanyInput = { name: "", website: "", linkedin: "", industry: "", location: "", size: "", notes: "" };

export function CompanyFormDialog({ mode = "create", companyId, initialValues, onSaved, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    defaultValues: { ...defaults, ...initialValues },
  });

  useEffect(() => {
    if (open) form.reset({ ...defaults, ...initialValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: CompanyInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch(mode === "edit" ? `/api/companies/${companyId}` : "/api/companies", {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.error?.message ?? "Could not save company.");
        return;
      }
      toast.success(mode === "edit" ? "Company updated." : "Company added.");
      setOpen(false);
      onSaved?.();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ?? <Button><Plus className="size-4" /> Add company</Button>} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit company" : "Add company"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Company name *</Label>
            <Input {...form.register("name")} placeholder="Google" />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input {...form.register("website")} placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <Label>LinkedIn</Label>
              <Input {...form.register("linkedin")} placeholder="https://linkedin.com/company/..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Industry</Label>
              <Input {...form.register("industry")} placeholder="Technology" />
            </div>
            <div className="space-y-1.5">
              <Label>Size</Label>
              <Input {...form.register("size")} placeholder="1000-5000" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input {...form.register("location")} placeholder="Bengaluru, India" />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea {...form.register("notes")} rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
