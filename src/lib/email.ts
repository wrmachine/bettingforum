import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Betting Forum";

export async function sendVerificationEmail(to: string, token: string): Promise<boolean> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set. Skipping verification email. In dev, use the verify link from logs.");
    return false;
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Verify your ${APP_NAME} account`,
    html: `
      <h2>Verify your email</h2>
      <p>Thanks for signing up! Please click the link below to verify your email address.</p>
      <p><a href="${verifyUrl}" style="color: #dc2626; font-weight: 600;">Verify my email</a></p>
      <p>Or copy this link: ${verifyUrl}</p>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't create an account, you can ignore this email.</p>
    `,
  });

  if (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
  return true;
}
