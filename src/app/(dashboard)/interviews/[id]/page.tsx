import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { CalendarDays, MapPin, Video, Pencil, Building2 } from "lucide-react";
import { requireUser } from "@/lib/api/guards";
import { getInterviewById } from "@/lib/services/interview-service";
import { ServiceError } from "@/lib/services/auth-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InterviewFeedbackForm } from "@/components/interviews/interview-feedback-form";
import { InterviewQuestionsPanel } from "@/components/interviews/interview-questions-panel";

export const metadata: Metadata = { title: "Interview" };

export default async function InterviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight capitalize">
              {interview.round.toLowerCase().replace(/_/g, " ")} Interview
            </h1>
            <Badge variant="secondary">{interview.status.replace(/_/g, " ")}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <Link href={`/applications/${interview.application.id}`} className="flex items-center gap-1.5 hover:text-foreground">
              <Building2 className="size-3.5" />
              {interview.application.jobTitle} · {interview.application.company?.name ?? interview.application.companyNameRaw}
            </Link>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              {format(new Date(interview.scheduledDate), "MMM d, yyyy")}
              {interview.startTime ? ` · ${interview.startTime}` : ""}
            </span>
            {interview.meetingLink && (
              <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                <Video className="size-3.5" /> Join meeting
              </a>
            )}
            {interview.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" /> {interview.location}
              </span>
            )}
          </div>
        </div>
        <Button variant="outline" render={<Link href={`/interviews/${interview.id}/edit`} />}>
          <Pencil className="size-4" /> Edit
        </Button>
      </div>

      <Tabs defaultValue="preparation">
        <TabsList>
          <TabsTrigger value="preparation">Preparation</TabsTrigger>
          <TabsTrigger value="questions">Questions ({interview.questions.length})</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="preparation">
          <Card>
            <CardContent className="space-y-4 pt-6 text-sm">
              <div>
                <p className="mb-1 font-medium">Company research</p>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {interview.companyResearch || "No research notes yet."}
                </p>
              </div>
              <div>
                <p className="mb-1 font-medium">Preparation notes</p>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {interview.preparationNotes || "No preparation notes yet."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <Card>
            <CardContent className="pt-6">
              <InterviewQuestionsPanel interviewId={interview.id} questions={interview.questions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardContent className="pt-6">
              <InterviewFeedbackForm
                interviewId={interview.id}
                initialValues={
                  interview.feedback
                    ? {
                        questionsAsked: interview.feedback.questionsAsked ?? "",
                        questionsCouldNotAnswer: interview.feedback.questionsCouldNotAnswer ?? "",
                        whatWentWell: interview.feedback.whatWentWell ?? "",
                        whatWentBadly: interview.feedback.whatWentBadly ?? "",
                        improvements: interview.feedback.improvements ?? "",
                        result: interview.feedback.result,
                        nextAction: interview.feedback.nextAction ?? "",
                      }
                    : undefined
                }
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
