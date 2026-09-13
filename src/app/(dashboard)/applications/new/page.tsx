import type { Metadata } from "next";
import { ApplicationForm } from "@/components/applications/application-form";

export const metadata: Metadata = { title: "Add application" };

export default function NewApplicationPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Add application</h1>
        <p className="text-sm text-muted-foreground">
          Log a job you&apos;ve applied to elsewhere and start tracking it here.
        </p>
      </div>
      <ApplicationForm />
    </div>
  );
}
