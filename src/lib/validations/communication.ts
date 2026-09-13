import { z } from "zod";

export const communicationSchema = z.object({
  applicationId: z.string().optional().or(z.literal("")),
  contactId: z.string().optional().or(z.literal("")),
  channel: z.enum(["EMAIL", "PHONE", "WHATSAPP", "LINKEDIN", "SMS", "IN_PERSON", "OTHER"]),
  direction: z.enum(["SENT", "RECEIVED"]),
  occurredAt: z.coerce.date(),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().max(3000).optional().or(z.literal("")),
});
export type CommunicationInput = z.infer<typeof communicationSchema>;
