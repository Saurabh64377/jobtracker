import { z } from "zod";

const optionalString = z.string().trim().max(300).optional().or(z.literal(""));

export const companySchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(200),
  website: z.string().trim().url("Enter a valid URL").max(300).optional().or(z.literal("")),
  linkedin: z.string().trim().url("Enter a valid URL").max(300).optional().or(z.literal("")),
  industry: optionalString,
  location: optionalString,
  size: optionalString,
  notes: z.string().trim().max(3000).optional().or(z.literal("")),
});
export type CompanyInput = z.infer<typeof companySchema>;
