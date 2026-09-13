"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Note = { id: string; content: string; createdAt: Date };

export function NotesPanel({ applicationId, notes }: { applicationId: string; notes: Note[] }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error();
      setContent("");
      router.refresh();
    } catch {
      toast.error("Could not add note.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Notes</h3>
      <div className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note about this application..."
          rows={3}
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={submit} disabled={isSubmitting || !content.trim()}>
            {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
            Add note
          </Button>
        </div>
      </div>
      {notes.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="whitespace-pre-wrap">{n.content}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">{format(new Date(n.createdAt), "MMM d, yyyy · h:mm a")}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
