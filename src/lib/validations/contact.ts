import { z } from "zod";

const optionalString = z.string().trim().max(300).optional().or(z.literal(""));

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  designation: optionalString,
  companyId: z.string().optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email").max(300).optional().or(z.literal("")),
  phone: optionalString,
  linkedin: z.string().trim().url("Enter a valid URL").max(300).optional().or(z.literal("")),
  contactType: z.enum(["RECRUITER", "HR", "HIRING_MANAGER", "EMPLOYEE", "REFERRAL", "OTHER"]),
  notes: z.string().trim().max(3000).optional().or(z.literal("")),
});
export type ContactInput = z.infer<typeof contactSchema>;
