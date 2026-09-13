import type { Metadata } from "next";
import { InterviewList } from "@/components/interviews/interview-list";

export const metadata: Metadata = { title: "Interviews" };

export default function InterviewsPage() {
  return <InterviewList />;
}
