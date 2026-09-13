import { z } from "zod";

const optionalDate = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  z.coerce.date().optional(),
);

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  dueDate: optionalDate,
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  applicationId: z.string().optional().or(z.literal("")),
});
export type TaskInput = z.infer<typeof taskSchema>;

export const followUpSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  dueDate: z.coerce.date(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  applicationId: z.string().optional().or(z.literal("")),
  companyId: z.string().optional().or(z.literal("")),
  contactId: z.string().optional().or(z.literal("")),
});
export type FollowUpInput = z.infer<typeof followUpSchema>;
