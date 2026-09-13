import type { Metadata } from "next";
import { CompaniesGrid } from "@/components/companies/companies-grid";

export const metadata: Metadata = { title: "Companies" };

export default function CompaniesPage() {
  return <CompaniesGrid />;
}
