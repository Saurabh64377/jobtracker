import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { contactSchema } from "@/lib/validations/contact";
import { listContacts, createContact } from "@/lib/services/contact-service";

export const GET = withApiErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const search = req.nextUrl.searchParams.get("search") ?? undefined;
  const contacts = await listContacts(user.id, search);
  return apiSuccess(contacts);
});

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const body = await req.json();
  const input = contactSchema.parse(body);
  const contact = await createContact(user.id, input);
  return apiSuccess(contact, 201);
});
