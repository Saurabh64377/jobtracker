import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { addApplicationNote } from "@/lib/services/application-service";
import { ServiceError } from "@/lib/services/auth-service";

const noteSchema = z.object({ content: z.string().trim().min(1).max(5000) });

export const POST = withApiErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json();
    const { content } = noteSchema.parse(body);

    try {
      const note = await addApplicationNote(user.id, id, content);
      return apiSuccess(note, 201);
    } catch (err) {
      if (err instanceof ServiceError) return apiError(err.message, err.status);
      throw err;
    }
  },
);
