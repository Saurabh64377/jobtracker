import { z } from "zod";

const optionalString = z.string().trim().max(2000).optional().or(z.literal(""));

export const interviewSchema = z.object({
  applicationId: z.string().min(1, "Select an application"),
  round: z.enum(["HR", "TECHNICAL", "CODING", "MACHINE_CODING", "SYSTEM_DESIGN", "MANAGERIAL", "FINAL", "OTHER"]),
  scheduledDate: z.coerce.date(),
  startTime: optionalString,
  endTime: optionalString,
  timezone: z.string().trim().max(50).default("Asia/Kolkata"),
  interviewerContactId: z.string().optional().or(z.literal("")),
  meetingLink: z.string().trim().url("Enter a valid URL").max(500).optional().or(z.literal("")),
  location: optionalString,
  status: z.enum(["SCHEDULED", "COMPLETED", "RESCHEDULED", "CANCELLED", "NO_SHOW"]),
  companyResearch: optionalString,
  preparationNotes: optionalString,
  questionsAsked: optionalString,
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional().or(z.literal("")),
  result: z.enum(["PENDING", "PASSED", "FAILED", "ON_HOLD"]),
  followUpRequired: z.boolean().default(false),
});
export type InterviewInput = z.infer<typeof interviewSchema>;

export const interviewFeedbackSchema = z.object({
  questionsAsked: optionalString,
  questionsCouldNotAnswer: optionalString,
  whatWentWell: optionalString,
  whatWentBadly: optionalString,
  improvements: optionalString,
  result: z.enum(["PENDING", "PASSED", "FAILED", "ON_HOLD"]),
  nextAction: optionalString,
});
export type InterviewFeedbackInput = z.infer<typeof interviewFeedbackSchema>;
