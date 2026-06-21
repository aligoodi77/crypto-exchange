import { Resend } from "resend";

type SendVerificationEmailInput = {
  to: string;
  name: string;
  verificationToken: string;
};

function getVerificationLink(token: string) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  return `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
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

  const provider = process.env.EMAIL_PROVIDER || "console";

  if (provider === "console") {
    console.log("\n[email-verification]");
    console.log(`To: ${to}`);
    console.log(`Verify link: ${verificationLink}\n`);

    return {
      provider: "console" as const,
      verificationLink,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing in .env");
  }

  if (!from) {
    throw new Error("EMAIL_FROM is missing in .env");
  }

  const resend = new Resend(apiKey);

  const safeName = escapeHtml(name);

  const { data, error } = await resend.emails.send({
    from,
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
