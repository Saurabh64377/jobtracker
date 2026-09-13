import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Building2, Globe, Link2, MapPin, Users2 } from "lucide-react";
import { requireUser } from "@/lib/api/guards";
import { getCompanyById } from "@/lib/services/company-service";
import { ServiceError } from "@/lib/services/auth-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APPLICATION_STATUS_COLOR, APPLICATION_STATUS_LABEL } from "@/lib/constants/application-status";

export const metadata: Metadata = { title: "Company" };

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  let company;
  try {
    company = await getCompanyById(user.id, id);
  } catch (err) {
    if (err instanceof ServiceError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start gap-3">
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Building2 className="size-5" />
        </span>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">{company.name}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {company.industry && <span>{company.industry}</span>}
            {company.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" /> {company.location}
              </span>
            )}
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                <Globe className="size-3.5" /> Website
              </a>
            )}
            {company.linkedin && (
              <a href={company.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                <Link2 className="size-3.5" /> LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>

      {company.notes && (
        <Card>
          <CardContent className="pt-6 text-sm whitespace-pre-wrap">{company.notes}</CardContent>
        </Card>
      )}

      <Tabs defaultValue="applications">
        <TabsList>
          <TabsTrigger value="applications">Applications ({company.applications.length})</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({company.contacts.length})</TabsTrigger>
          <TabsTrigger value="interviews">Interviews ({company.interviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <Card>
            <CardContent className="pt-6">
              {company.applications.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No applications with this company yet.</p>
              ) : (
                <ul className="space-y-2">
                  {company.applications.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/applications/${a.id}`}
                        className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-muted/50"
                      >
                        <span className="font-medium">{a.jobTitle}</span>
                        <Badge className={APPLICATION_STATUS_COLOR[a.currentStatus]} variant="secondary">
                          {APPLICATION_STATUS_LABEL[a.currentStatus]}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardContent className="pt-6">
              {company.contacts.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No contacts added for this company yet.</p>
              ) : (
                <ul className="space-y-2">
                  {company.contacts.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/contacts/${c.id}`}
                        className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-muted/50"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <Users2 className="size-3.5" /> {c.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{c.designation ?? c.contactType}</span>
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
              {company.interviews.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No interviews with this company yet.</p>
              ) : (
                <ul className="space-y-2">
                  {company.interviews.map((i) => (
                    <li key={i.id}>
                      <Link
                        href={`/interviews/${i.id}`}
                        className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-muted/50"
                      >
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
