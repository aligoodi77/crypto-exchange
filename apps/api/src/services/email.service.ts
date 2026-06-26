import { Resend } from "resend";
import { env } from "../config/env.js";

type SendVerificationEmailInput = {
  to: string;
  name: string;
  verificationCode: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendVerificationEmail({
  to,
  name,
  verificationCode,
}: SendVerificationEmailInput) {
  if (env.emailProvider === "console") {
    console.log("\n[email-verification]");
    console.log(`To: ${to}`);
    console.log(`Code: ${verificationCode}\n`);

    return {
      provider: "console" as const,
      verificationCode,
    };
  }

  if (!env.resendApiKey || !env.emailFrom) {
    throw new Error("Resend email configuration is missing");
  }

  const resend = new Resend(env.resendApiKey);

  const safeName = escapeHtml(name);

  const { data, error } = await resend.emails.send({
    from: env.emailFrom,
    to,
    subject: "Verify your CryptoX email address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
        <h2>Welcome to CryptoX, ${safeName}</h2>
        <p>Please verify your email address to activate trading.</p>
        <p style="font-size: 32px; letter-spacing: 8px; font-weight: 700; color: #111827;">
          ${verificationCode}
        </p>
        <p>This verification code expires in ${env.emailVerificationTokenTtlMinutes} minutes.</p>
        <p>If you did not create this account, you can ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }

  return {
    provider: "resend" as const,
    emailId: data?.id,
  };
}
