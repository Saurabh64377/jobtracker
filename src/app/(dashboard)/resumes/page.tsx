import type { Metadata } from "next";
import { ResumesList } from "@/components/resumes/resumes-list";

export const metadata: Metadata = { title: "Resumes" };

export default function ResumesPage() {
  return <ResumesList />;
}
