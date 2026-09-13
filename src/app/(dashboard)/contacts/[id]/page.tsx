import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { User, Mail, Phone, Link2, Building2 } from "lucide-react";
import { requireUser } from "@/lib/api/guards";
import { getContactById } from "@/lib/services/contact-service";
import { ServiceError } from "@/lib/services/auth-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunicationFormDialog } from "@/components/communications/communication-form-dialog";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  let contact;
  try {
    contact = await getContactById(user.id, id);
  } catch (err) {
    if (err instanceof ServiceError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start gap-3">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="size-5" />
        </span>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{contact.name}</h1>
            <Badge variant="outline">{contact.contactType.replace(/_/g, " ")}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {contact.designation && <span>{contact.designation}</span>}
            {contact.company && (
              <Link href={`/companies/${contact.company.id}`} className="flex items-center gap-1 hover:text-foreground">
                <Building2 className="size-3.5" /> {contact.company.name}
              </Link>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-foreground">
                <Mail className="size-3.5" /> {contact.email}
              </a>
            )}
            {contact.phone && (
              <span className="flex items-center gap-1">
                <Phone className="size-3.5" /> {contact.phone}
              </span>
            )}
            {contact.linkedin && (
              <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                <Link2 className="size-3.5" /> LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>

      <CommunicationFormDialog contactId={contact.id} />

      {contact.notes && (
        <Card>
          <CardContent className="pt-6 text-sm whitespace-pre-wrap">{contact.notes}</CardContent>
        </Card>
      )}

      <Tabs defaultValue="communications">
        <TabsList>
          <TabsTrigger value="communications">Communications ({contact.communications.length})</TabsTrigger>
          <TabsTrigger value="applications">Applications ({contact.applications.length})</TabsTrigger>
          <TabsTrigger value="interviews">Interviews ({contact.interviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="communications">
          <Card>
            <CardContent className="pt-6">
              {contact.communications.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No communications logged yet.</p>
              ) : (
                <ul className="space-y-2">
                  {contact.communications.map((c) => (
                    <li key={c.id} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{c.channel} · {c.direction}</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(c.occurredAt), "MMM d, yyyy")}</span>
                      </div>
                      {c.message && <p className="mt-1 text-muted-foreground">{c.message}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardContent className="pt-6">
              {contact.applications.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Not linked to any applications as a referral yet.</p>
              ) : (
                <ul className="space-y-2">
                  {contact.applications.map((a) => (
                    <li key={a.id}>
                      <Link href={`/applications/${a.id}`} className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-muted/50">
                        <span className="font-medium">{a.jobTitle}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews">
          <Card>
            <CardContent className="pt-6">
              {contact.interviews.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No interviews with this contact yet.</p>
              ) : (
                <ul className="space-y-2">
                  {contact.interviews.map((i) => (
                    <li key={i.id}>
                      <Link href={`/interviews/${i.id}`} className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-muted/50">
                        <span className="font-medium capitalize">{i.round.toLowerCase().replace(/_/g, " ")}</span>
                        <span className="text-muted-foreground">{format(new Date(i.scheduledDate), "MMM d, yyyy")}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
