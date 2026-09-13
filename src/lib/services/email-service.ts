import "server-only";

/**
 * Minimal email abstraction. No provider is wired up yet — swap the body of
 * `sendEmail` for Resend/SES/SMTP later without touching call sites.
 */
async function sendEmail(params: { to: string; subject: string; html: string; text: string }) {
  if (process.env.NODE_ENV !== "production") {
    console.log("\n──────── EMAIL (dev mode, not actually sent) ────────");
    console.log("To:", params.to);
    console.log("Subject:", params.subject);
    console.log(params.text);
    console.log("───────────────────────────────────────────────────\n");
    return;
  }

  console.warn("[email-service] No email provider configured; email was not sent.", {
    to: params.to,
    subject: params.subject,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendEmail({
    to,
    subject: "Reset your JobTrack password",
    text: `Reset your password using this link (valid for 1 hour): ${resetUrl}`,
    html: `<p>Reset your password using the link below (valid for 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
}
