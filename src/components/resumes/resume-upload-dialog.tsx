"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export function ResumeUploadDialog({ onSaved }: { onSaved?: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (!file) {
      toast.error("Choose a file to upload.");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("name", name || file.name);
      formData.set("targetRole", targetRole);
      formData.set("isDefault", String(isDefault));

      const res = await fetch("/api/resumes", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.error?.message ?? "Could not upload resume.");
        return;
      }
      toast.success("Resume uploaded.");
      setOpen(false);
      setName("");
      setTargetRole("");
      setIsDefault(false);
      setFile(null);
      onSaved?.();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button><Upload className="size-4" /> Upload resume</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload resume</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>File *</Label>
            <Input
              type="file"
              accept=".pdf,.doc,.docx,image/png,image/jpeg"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="MERN Developer Resume"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Target role</Label>
            <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Full Stack Developer" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={isDefault} onCheckedChange={(v) => setIsDefault(!!v)} id="isDefault" />
            <Label htmlFor="isDefault" className="font-normal">
              Set as default resume
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
