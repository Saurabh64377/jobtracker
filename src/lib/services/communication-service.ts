import "server-only";
import { prisma } from "@/lib/db";
import type { CommunicationInput } from "@/lib/validations/communication";

export async function createCommunication(userId: string, input: CommunicationInput) {
  const { applicationId, contactId, subject, message, ...rest } = input;

  const communication = await prisma.communication.create({
    data: {
      userId,
      applicationId: applicationId || null,
      contactId: contactId || null,
      subject: subject || null,
      message: message || null,
      ...rest,
    },
  });

  if (applicationId) {
    const activityType = rest.channel === "EMAIL" ? (rest.direction === "SENT" ? "EMAIL_SENT" : "EMAIL_RECEIVED")
      : rest.channel === "WHATSAPP" ? (rest.direction === "SENT" ? "WHATSAPP_SENT" : "WHATSAPP_RECEIVED")
      : rest.channel === "LINKEDIN" ? "LINKEDIN_MESSAGE"
      : rest.channel === "PHONE" ? "PHONE_CALL"
      : "GENERAL";

    await prisma.activity.create({
      data: {
        userId,
        applicationId,
        type: activityType,
        title: subject || `${rest.direction === "SENT" ? "Sent" : "Received"} ${rest.channel.toLowerCase()} message`,
        description: message || undefined,
        occurredAt: rest.occurredAt,
      },
    });
  }

  return communication;
}
