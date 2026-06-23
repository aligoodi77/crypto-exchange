import { Resend } from "resend";
import { env } from "../config/env.js";

type SendVerificationEmailInput = {
  to: string;
  name: string;
  verificationToken: string;
};

function getVerificationLink(token: string) {
  return `${env.frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
}

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
  verificationToken,
}: SendVerificationEmailInput) {
  const verificationLink = getVerificationLink(verificationToken);

  if (env.emailProvider === "console") {
    console.log("\n[email-verification]");
    console.log(`To: ${to}`);
    console.log(`Verify link: ${verificationLink}\n`);

    return {
      provider: "console" as const,
      verificationLink,
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
        <p>
          <a
            href="${verificationLink}"
            style="display: inline-block; padding: 12px 18px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 8px;"
          >
            Verify Email
          </a>
        </p>
        <p>This verification link expires in 60 minutes.</p>
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
