import { z } from "zod";

const optionalString = z.string().trim().max(500).optional().or(z.literal(""));
const optionalDate = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  z.coerce.date().optional(),
);
const optionalNumber = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  z.coerce.number().int().nonnegative().optional(),
);

export const applicationSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required").max(200),
  jobTitle: z.string().trim().min(1, "Job title is required").max(200),
  jobDescription: z.string().trim().max(10000).optional().or(z.literal("")),
  jobUrl: z.string().trim().url("Enter a valid URL").max(500).optional().or(z.literal("")),
  jobSource: z.enum([
    "LINKEDIN",
    "NAUKRI",
    "INDEED",
    "COMPANY_WEBSITE",
    "REFERRAL",
    "RECRUITER",
    "WHATSAPP",
    "INSTAGRAM",
    "EMAIL",
    "OTHER",
  ]),
  jobReference: optionalString,
  department: optionalString,
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE"]),
  experienceRequired: optionalString,

  expectedSalaryMin: optionalNumber,
  expectedSalaryMax: optionalNumber,
  offeredSalary: optionalNumber,
  currency: z.string().trim().max(10).default("INR"),
  salaryPeriod: z.enum(["MONTHLY", "ANNUAL"]),
  bonus: optionalString,
  benefits: z.string().trim().max(2000).optional().or(z.literal("")),
  negotiationStatus: z.enum(["NOT_STARTED", "IN_DISCUSSION", "FINALIZED", "DECLINED"]),

  country: optionalString,
  state: optionalString,
  city: optionalString,
  officeLocation: optionalString,
  workMode: z.enum(["REMOTE", "HYBRID", "ONSITE"]),

  applicationDate: optionalDate,
  currentStatus: z.enum([
    "WISHLIST",
    "APPLIED",
    "APPLICATION_VIEWED",
    "RECRUITER_CONTACTED",
    "RECRUITER_RESPONDED",
    "HR_SCHEDULED",
    "HR_COMPLETED",
    "TECHNICAL_SCHEDULED",
    "TECHNICAL_COMPLETED",
    "MANAGERIAL_ROUND",
    "FINAL_ROUND",
    "OFFER",
    "ACCEPTED",
    "REJECTED",
    "WITHDRAWN",
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  applicationDeadline: optionalDate,
  noticePeriod: optionalString,
  isReferral: z.boolean().default(false),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
  tagIds: z.array(z.string()).optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const changeStatusSchema = z.object({
  status: applicationSchema.shape.currentStatus,
  note: z.string().trim().max(1000).optional(),
});
