import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { prisma } from "@/lib/db";
import { ServiceError } from "@/lib/services/auth-service";

const questionSchema = z.object({
  question: z.string().trim().min(1).max(2000),
  answer: z.string().trim().max(5000).optional().or(z.literal("")),
  category: z.enum([
    "JAVASCRIPT",
    "REACT",
    "NODEJS",
    "NEXTJS",
    "MYSQL",
    "MONGODB",
    "AWS",
    "SYSTEM_DESIGN",
    "HR",
    "BEHAVIORAL",
    "OTHER",
  ]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  status: z.enum(["NEEDS_PRACTICE", "CONFIDENT", "MASTERED"]),
});

export const POST = withApiErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json();
    const input = questionSchema.parse(body);

    const interview = await prisma.interview.findFirst({ where: { id, userId: user.id } });
    if (!interview) {
      return apiError("Interview not found.", 404);
    }

    try {
      const question = await prisma.interviewQuestion.create({
        data: { userId: user.id, interviewId: id, ...input, answer: input.answer || null },
      });
      return apiSuccess(question, 201);
    } catch (err) {
      if (err instanceof ServiceError) return apiError(err.message, err.status);
      throw err;
    }
  },
);
