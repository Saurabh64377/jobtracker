import { z } from "zod";

const emptyToUndefined = (val: unknown) => (val === "" || val === null || val === undefined ? undefined : val);

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  targetRole: z.string().trim().max(150).optional().or(z.literal("")),
  preferredLocations: z.array(z.string().trim().min(1)).max(10).optional(),
  expectedSalaryMin: z.preprocess(emptyToUndefined, z.coerce.number().int().nonnegative().optional()),
  expectedSalaryMax: z.preprocess(emptyToUndefined, z.coerce.number().int().nonnegative().optional()),
  preferredWorkMode: z.enum(["REMOTE", "HYBRID", "ONSITE"]).optional(),
  monthlyApplicationGoal: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().max(1000).optional()),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

export const goalSchema = z.object({
  period: z.enum(["WEEKLY", "MONTHLY"]),
  applicationsTarget: z.coerce.number().int().nonnegative(),
  responsesTarget: z.coerce.number().int().nonnegative(),
  interviewsTarget: z.coerce.number().int().nonnegative(),
  offersTarget: z.coerce.number().int().nonnegative(),
});
export type GoalInput = z.infer<typeof goalSchema>;
