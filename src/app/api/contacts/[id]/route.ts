import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { contactSchema } from "@/lib/validations/contact";
import { getContactById, updateContact, deleteContact } from "@/lib/services/contact-service";
import { ServiceError } from "@/lib/services/auth-service";

type Params = { params: Promise<{ id: string }> };

export const GET = withApiErrorHandling(async (_req: NextRequest, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  try {
    const contact = await getContactById(user.id, id);
    return apiSuccess(contact);
  } catch (err) {
    if (err instanceof ServiceError) return apiError(err.message, err.status);
    throw err;
  }
});

export const PATCH = withApiErrorHandling(async (req: NextRequest, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  const body = await req.json();
  const input = contactSchema.parse(body);

  try {
    const contact = await updateContact(user.id, id, input);
    return apiSuccess(contact);
  } catch (err) {
    if (err instanceof ServiceError) return apiError(err.message, err.status);
    throw err;
  }
});

export const DELETE = withApiErrorHandling(async (_req: NextRequest, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  try {
    await deleteContact(user.id, id);
    return apiSuccess({ ok: true });
  } catch (err) {
    if (err instanceof ServiceError) return apiError(err.message, err.status);
    throw err;
  }
});
