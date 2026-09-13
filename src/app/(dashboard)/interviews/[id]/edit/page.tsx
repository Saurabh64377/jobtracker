import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { requireUser } from "@/lib/api/guards";
import { getInterviewById } from "@/lib/services/interview-service";
import { ServiceError } from "@/lib/services/auth-service";
import { InterviewForm } from "@/components/interviews/interview-form";

export const metadata: Metadata = { title: "Edit interview" };

export default async function EditInterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  let interview;
  try {
    interview = await getInterviewById(user.id, id);
  } catch (err) {
    if (err instanceof ServiceError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Edit interview</h1>
      </div>
      <InterviewForm
        interviewId={interview.id}
        defaultApplicationId={interview.applicationId}
        initialValues={{
          applicationId: interview.applicationId,
          round: interview.round,
          scheduledDate: format(new Date(interview.scheduledDate), "yyyy-MM-dd") as unknown as Date,
          startTime: interview.startTime ?? "",
          endTime: interview.endTime ?? "",
          timezone: interview.timezone ?? "Asia/Kolkata",
          interviewerContactId: interview.interviewerContactId ?? "",
          meetingLink: interview.meetingLink ?? "",
          location: interview.location ?? "",
          status: interview.status,
          companyResearch: interview.companyResearch ?? "",
          preparationNotes: interview.preparationNotes ?? "",
          questionsAsked: interview.questionsAsked ?? "",
          difficulty: interview.difficulty ?? undefined,
          result: interview.result,
          followUpRequired: interview.followUpRequired,
        }}
      />
    </div>
  );
}
