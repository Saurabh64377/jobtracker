import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/api/guards";
import { getApplicationById } from "@/lib/services/application-service";
import { ServiceError } from "@/lib/services/auth-service";
import { ApplicationForm } from "@/components/applications/application-form";
import { format } from "date-fns";

export const metadata: Metadata = { title: "Edit application" };

export default async function EditApplicationPage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Edit application</h1>
        <p className="text-sm text-muted-foreground">{application.jobTitle}</p>
      </div>
      <ApplicationForm
        applicationId={application.id}
        initialValues={{
          companyName: application.company?.name ?? application.companyNameRaw ?? "",
          jobTitle: application.jobTitle,
          jobDescription: application.jobDescription ?? "",
          jobUrl: application.jobUrl ?? "",
          jobSource: application.jobSource,
          jobReference: application.jobReference ?? "",
          department: application.department ?? "",
          employmentType: application.employmentType,
          experienceRequired: application.experienceRequired ?? "",
          expectedSalaryMin: application.expectedSalaryMin ?? undefined,
          expectedSalaryMax: application.expectedSalaryMax ?? undefined,
          offeredSalary: application.offeredSalary ?? undefined,
          currency: application.currency,
          salaryPeriod: application.salaryPeriod,
          bonus: application.bonus ?? "",
          benefits: application.benefits ?? "",
          negotiationStatus: application.negotiationStatus,
          country: application.country ?? "",
          state: application.state ?? "",
          city: application.city ?? "",
          officeLocation: application.officeLocation ?? "",
          workMode: application.workMode,
          applicationDate: format(new Date(application.applicationDate), "yyyy-MM-dd") as unknown as Date,
          currentStatus: application.currentStatus,
          priority: application.priority,
          applicationDeadline: application.applicationDeadline
            ? (format(new Date(application.applicationDeadline), "yyyy-MM-dd") as unknown as Date)
            : undefined,
          noticePeriod: application.noticePeriod ?? "",
          isReferral: application.isReferral,
          notes: application.notes ?? "",
        }}
      />
    </div>
  );
}
