"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, MessageSquarePlus } from "lucide-react";
import type { z } from "zod";

import { communicationSchema } from "@/lib/validations/communication";
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

type FormInput = z.input<typeof communicationSchema>;
type FormOutput = z.output<typeof communicationSchema>;

export function CommunicationFormDialog({
  applicationId,
  contactId,
  onSaved,
}: {
  applicationId?: string;
  contactId?: string;
  onSaved?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { data: contacts } = useQuery({
    queryKey: ["contacts", ""],
    queryFn: async () => {
      const res = await fetch("/api/contacts");
      const json = await res.json();
      return json.data as { id: string; name: string }[];
    },
    enabled: open && !contactId,
  });

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(communicationSchema),
    defaultValues: {
      applicationId: applicationId ?? "",
      contactId: contactId ?? "",
      channel: "EMAIL",
      direction: "SENT",
      occurredAt: new Date().toISOString().slice(0, 10) as unknown as Date,
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: FormOutput) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      toast.success("Communication logged.");
      setOpen(false);
      form.reset();
      onSaved?.();
      router.refresh();
    } catch {
      toast.error("Could not log communication.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline"><MessageSquarePlus className="size-3.5" /> Log communication</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log communication</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {!contactId && (
            <div className="space-y-1.5">
              <Label>Contact</Label>
              <Controller
                control={form.control}
                name="contactId"
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
          )}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 space-y-1.5">
              <Label>Channel</Label>
              <Controller
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="PHONE">Phone</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="IN_PERSON">In person</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="col-span-1 space-y-1.5">
              <Label>Direction</Label>
              <Controller
                control={form.control}
                name="direction"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SENT">Sent</SelectItem>
                      <SelectItem value="RECEIVED">Received</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="col-span-1 space-y-1.5">
              <Label>Date</Label>
              <Input type="date" {...form.register("occurredAt")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input {...form.register("subject")} placeholder="Technical interview scheduling" />
          </div>
          <div className="space-y-1.5">
            <Label>Message / summary</Label>
            <Textarea {...form.register("message")} rows={3} placeholder="Technical interview scheduled for Monday at 3 PM." />
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
