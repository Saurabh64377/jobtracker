"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

import { contactSchema, type ContactInput } from "@/lib/validations/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  contactId?: string;
  initialValues?: Partial<ContactInput>;
  onSaved?: () => void;
  trigger?: React.ReactElement;
};

const defaults: ContactInput = {
  name: "",
  designation: "",
  companyId: "",
  email: "",
  phone: "",
  linkedin: "",
  contactType: "RECRUITER",
  notes: "",
};

const CONTACT_TYPE_LABEL: Record<string, string> = {
  RECRUITER: "Recruiter",
  HR: "HR",
  HIRING_MANAGER: "Hiring Manager",
  EMPLOYEE: "Employee",
  REFERRAL: "Referral",
  OTHER: "Other",
};

export function ContactFormDialog({ mode = "create", contactId, initialValues, onSaved, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: companies } = useQuery({
    queryKey: ["companies", ""],
    queryFn: async () => {
      const res = await fetch("/api/companies");
      const json = await res.json();
      return json.data as { id: string; name: string }[];
    },
    enabled: open,
  });

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { ...defaults, ...initialValues },
  });

  useEffect(() => {
    if (open) form.reset({ ...defaults, ...initialValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: ContactInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch(mode === "edit" ? `/api/contacts/${contactId}` : "/api/contacts", {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.error?.message ?? "Could not save contact.");
        return;
      }
      toast.success(mode === "edit" ? "Contact updated." : "Contact added.");
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
      <DialogTrigger render={trigger ?? <Button><Plus className="size-4" /> Add contact</Button>} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit contact" : "Add contact"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input {...form.register("name")} placeholder="Rahul Sharma" />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Designation</Label>
              <Input {...form.register("designation")} placeholder="Technical Recruiter" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Contact type</Label>
              <Controller
                control={form.control}
                name="contactType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue>{(v: string) => CONTACT_TYPE_LABEL[v] ?? v}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CONTACT_TYPE_LABEL).map(([value, label]) => (
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
              <Label>Company</Label>
              <Controller
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <Select value={field.value || null} onValueChange={(v) => field.onChange(v ?? "")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input {...form.register("email")} placeholder="rahul@company.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input {...form.register("phone")} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>LinkedIn</Label>
            <Input {...form.register("linkedin")} placeholder="https://linkedin.com/in/..." />
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
