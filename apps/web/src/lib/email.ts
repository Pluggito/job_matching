import { Resend } from "resend";
import crypto from "crypto";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const COMPANY_EMAIL = "staffgurunaija@gmail.com";
export const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || "Staff Guru <verify@verify.staffguru.co>";

/**
 * Generates a cryptographically secure 6-digit numeric OTP.
 */
export function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

interface SendVerificationOtpParams {
  to: string;
  otp: string;
  role?: string;
}

export async function sendVerificationOtpEmail({ to, otp, role }: SendVerificationOtpParams) {
  const roleText = role === "EMPLOYER" ? "an Employer" : "a Skilled Worker / Artisan";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Staff Guru Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #152822;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 135, 81, 0.08); border: 1px solid #e0e7e1;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="background-color: #008751; padding: 32px 36px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
                staff<span style="color: #ffffff;">guru</span><span style="color: #f3aa60;">.</span>
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.85); font-size: 13px; font-weight: 500;">
                Nigeria's Verified Marketplace for Skilled Work & Errands
              </p>
            </td>
          </tr>

          <!-- MAIN CONTENT -->
          <tr>
            <td style="padding: 40px 36px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #152822;">
                Confirm your email address
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #4b5d54;">
                Thank you for joining Staff Guru as ${roleText}! To complete your registration and secure your account, please enter the 6-digit verification code below:
              </p>

              <!-- 6-DIGIT OTP BOX -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="background-color: #f0f7f2; border: 2px dashed #008751; border-radius: 12px; padding: 22px 16px;">
                    <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #008751; font-family: 'Courier New', Courier, monospace; display: inline-block; padding-left: 10px;">
                      ${otp}
                    </span>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; font-size: 13px; line-height: 1.5; color: #6b7d72; text-align: center;">
                ⏳ This code is valid for <strong>15 minutes</strong>.
              </p>

              <hr style="border: none; border-top: 1px solid #e8eee8; margin: 32px 0;" />

              <!-- SECURITY NOTICE -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fbfbf9; border-radius: 10px; padding: 14px 16px; border: 1px solid #f0efe8;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #76877c;">
                      <strong>Security Notice:</strong> Staff Guru will never call or message you asking for your verification code or banking PIN. If you did not create an account, you can safely disregard this email.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #f9fbf9; padding: 24px 36px; text-align: center; border-top: 1px solid #eef2ee;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #8a9c90;">
                Questions or support? Email us directly at <a href="mailto:${COMPANY_EMAIL}" style="color: #008751; text-decoration: none; font-weight: 600;">${COMPANY_EMAIL}</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #a4b2a8;">
                © 2026 Staff Guru Technologies Nigeria. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Welcome to Staff Guru!

Your 6-digit email verification code is: ${otp}

This code is valid for 15 minutes.
For your security, never share this code with anyone.

If you did not request this, please ignore this email.

Need support? Email us at: ${COMPANY_EMAIL}
© 2026 Staff Guru Technologies Nigeria
  `.trim();

  // Development / Console logging for easy debugging and zero-friction QA testing
  console.log(`\n======================================================`);
  console.log(`[EMAIL DISPATCH] To: ${to}`);
  console.log(`[EMAIL DISPATCH] 6-Digit OTP: >>> ${otp} <<<`);
  console.log(`[EMAIL DISPATCH] Valid for 15 minutes`);
  console.log(`======================================================\n`);

  if (!resend) {
    console.warn("[Email] RESEND_API_KEY is not set. OTP logged above for development.");
    return { success: true, simulated: true, otp };
  }

  try {
    const response = await resend.emails.send({
      from: DEFAULT_FROM,
      to,
      subject: `Your Staff Guru Verification Code: ${otp}`,
      html,
      text,
      replyTo: COMPANY_EMAIL,
    });

    if (response.error) {
      console.warn(`[Email] Resend API Warning/Error:`, response.error.message);
      return { success: false, error: response.error.message, otp };
    }

    console.log(`[Email] Resend API Success:`, response.data);
    return { success: true, id: response.data?.id };
  } catch (error: any) {
    console.error(`[Email] Failed to send email via Resend:`, error?.message || error);
    // Return simulated flag so testing flow does not crash if Resend sandbox restricts domain
    return { success: false, error: error?.message || "Failed to send email", otp };
  }
}
