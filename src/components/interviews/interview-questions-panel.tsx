"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Question = {
  id: string;
  question: string;
  answer: string | null;
  category: string;
  difficulty: string;
  status: string;
};

const CATEGORIES = ["JAVASCRIPT", "REACT", "NODEJS", "NEXTJS", "MYSQL", "MONGODB", "AWS", "SYSTEM_DESIGN", "HR", "BEHAVIORAL", "OTHER"];

export function InterviewQuestionsPanel({ interviewId, questions }: { interviewId: string; questions: Question[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("OTHER");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (!question.trim()) {
      toast.error("Add the question text.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/interviews/${interviewId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer: answer || undefined, category, difficulty, status: "NEEDS_PRACTICE" }),
      });
      if (!res.ok) throw new Error();
      setQuestion("");
      setAnswer("");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Could not save question.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Questions</h3>
        <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)}>
          <Plus className="size-3.5" /> Add question
        </Button>
      </div>

      {open && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
          <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Question" rows={2} />
          <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Your answer (optional)" rows={2} />
          <div className="grid grid-cols-2 gap-2">
            <Select value={category} onValueChange={(v) => setCategory(v ?? "OTHER")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v ?? "MEDIUM")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
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

      {questions.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No questions saved for this interview yet.</p>
      ) : (
        <div className="space-y-2">
          {questions.map((q) => (
            <div key={q.id} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{q.question}</p>
              {q.answer && <p className="mt-1 text-muted-foreground">{q.answer}</p>}
              <div className="mt-2 flex gap-1.5">
                <Badge variant="outline" className="text-[10px]">
                  {q.category.replace(/_/g, " ")}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {q.difficulty}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {q.status.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
