"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ActivityType } from "@prisma/client";

type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  occurredAt: Date;
};

const ACTIVITY_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "EMAIL_SENT", label: "Email sent" },
  { value: "EMAIL_RECEIVED", label: "Email received" },
  { value: "WHATSAPP_SENT", label: "WhatsApp sent" },
  { value: "WHATSAPP_RECEIVED", label: "WhatsApp received" },
  { value: "LINKEDIN_MESSAGE", label: "LinkedIn message" },
  { value: "PHONE_CALL", label: "Phone call" },
  { value: "RECRUITER_RESPONSE", label: "Recruiter response" },
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "GENERAL", label: "General note" },
];

export function ActivityTimeline({ applicationId, activities }: { applicationId: string; activities: Activity[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("GENERAL");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (!title.trim()) {
      toast.error("Add a short title for this activity.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, description: description || undefined }),
      });
      if (!res.ok) throw new Error();
      setTitle("");
      setDescription("");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Could not add activity.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Activity timeline</h3>
        <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)}>
          <Plus className="size-3.5" /> Add activity
        </Button>
      </div>

      {open && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Select value={type} onValueChange={(v) => setType(v ?? "GENERAL")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Recruiter called about timeline" />
          </div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details..."
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={submit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
              Save
            </Button>
          </div>
        </div>
      )}

      {activities.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No activity recorded yet.</p>
      ) : (
        <ol className="relative space-y-5 border-l pl-5">
          {activities.map((a) => (
            <li key={a.id} className="relative">
              <span className="absolute -left-[25px] top-1 size-2.5 rounded-full border-2 border-background bg-primary" />
              <p className="text-xs text-muted-foreground">{format(new Date(a.occurredAt), "MMM d, yyyy · h:mm a")}</p>
              <p className="text-sm font-medium">{a.title}</p>
              {a.description && <p className="text-sm text-muted-foreground">{a.description}</p>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
