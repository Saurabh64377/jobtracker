import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/api/guards";
import { getApplicationById } from "@/lib/services/application-service";
import { ServiceError } from "@/lib/services/auth-service";
import { ApplicationHeader } from "@/components/applications/application-header";
import { ActivityTimeline } from "@/components/applications/activity-timeline";
import { NotesPanel } from "@/components/applications/notes-panel";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarPlus, ListPlus } from "lucide-react";
import { CommunicationFormDialog } from "@/components/communications/communication-form-dialog";

export const metadata: Metadata = { title: "Application" };

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  let application;
  try {
    application = await getApplicationById(user.id, id);
  } catch (err) {
    if (err instanceof ServiceError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <ApplicationHeader application={application} />

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" render={<Link href={`/interviews/new?applicationId=${application.id}`} />}>
          <CalendarPlus className="size-3.5" /> Schedule interview
        </Button>
        <Button size="sm" variant="outline" render={<Link href={`/tasks?new=1&applicationId=${application.id}`} />}>
          <ListPlus className="size-3.5" /> Add follow-up / task
        </Button>
        <CommunicationFormDialog applicationId={application.id} />
      </div>

      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes ({application.notes_rel.length})</TabsTrigger>
          <TabsTrigger value="interviews">Interviews ({application.interviews.length})</TabsTrigger>
          <TabsTrigger value="communications">Communications ({application.communications.length})</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups & Tasks ({application.followUps.length + application.tasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardContent className="pt-6">
              <ActivityTimeline applicationId={application.id} activities={application.activities} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent className="pt-6">
              <NotesPanel applicationId={application.id} notes={application.notes_rel} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews">
          <Card>
            <CardContent className="pt-6">
              {application.interviews.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No interviews scheduled yet.</p>
              ) : (
                <ul className="space-y-2">
                  {application.interviews.map((i) => (
                    <li key={i.id}>
                      <Link
                        href={`/interviews/${i.id}`}
                        className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-muted/50"
                      >
                        <span className="font-medium capitalize">{i.round.toLowerCase().replace(/_/g, " ")}</span>
                        <span className="text-muted-foreground">{format(new Date(i.scheduledDate), "MMM d, yyyy")}</span>
                        <Badge variant="outline">{i.status}</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications">
          <Card>
            <CardContent className="pt-6">
              {application.communications.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No communications logged yet.</p>
              ) : (
                <ul className="space-y-2">
                  {application.communications.map((c) => (
                    <li key={c.id} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {c.contact?.name ?? "Unknown contact"} · {c.channel}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(c.occurredAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      {c.message && <p className="mt-1 text-muted-foreground">{c.message}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followups">
          <Card>
            <CardContent className="space-y-4 pt-6">
              {application.followUps.length === 0 && application.tasks.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Nothing pending. Nice work!</p>
              ) : (
                <>
                  {application.followUps.map((f) => (
                    <div key={f.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <span className="font-medium">{f.title}</span>
                      <Badge variant="outline">{format(new Date(f.dueDate), "MMM d")}</Badge>
                    </div>
                  ))}
                  {application.tasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <span className="font-medium">{t.title}</span>
                      <Badge variant="outline">{t.status}</Badge>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
