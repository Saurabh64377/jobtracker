import type { Metadata } from "next";
import { InterviewForm } from "@/components/interviews/interview-form";

export const metadata: Metadata = { title: "Schedule interview" };

export default async function NewInterviewPage({
  searchParams,
}: {
  searchParams: Promise<{ applicationId?: string }>;
}) {
  const { applicationId } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Schedule interview</h1>
        <p className="text-sm text-muted-foreground">Add an upcoming round and prep for it.</p>
      </div>
      <InterviewForm defaultApplicationId={applicationId} />
    </div>
  );
}
