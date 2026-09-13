import { z } from "zod";

const emptyToUndefined = (val: unknown) => (val === "" || val === null || val === undefined ? undefined : val);

export const onboardingSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  targetRole: z.string().trim().max(150).optional(),
  preferredLocations: z.array(z.string().trim().min(1)).max(10).optional(),
  expectedSalaryMin: z.preprocess(emptyToUndefined, z.coerce.number().int().nonnegative().optional()),
  expectedSalaryMax: z.preprocess(emptyToUndefined, z.coerce.number().int().nonnegative().optional()),
  preferredWorkMode: z.enum(["REMOTE", "HYBRID", "ONSITE"]).optional(),
  monthlyApplicationGoal: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().max(1000).optional()),
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;
