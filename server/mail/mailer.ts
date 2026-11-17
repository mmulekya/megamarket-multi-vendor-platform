export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const MAIL_TIMEOUT_MS = 8000;

/**
 * Send transactional email via Brevo HTTP API.
 * Never logs API keys, verification codes (unless MAIL_DEBUG === 'true' in non-production), or email bodies.
 */
export async function sendMail({ to, subject, html, text }: SendMailOptions): Promise<boolean> {
  if (process.env.MAIL_DEBUG === 'true' && process.env.NODE_ENV !== 'production') {
    const codeMatch = text.match(/\b\d{6}\b/);
    if (codeMatch) {
      console.log(`[Mail Debug] Verification code for testing: ${codeMatch[0]}`);
    }
  }

  const apiKey = process.env.BREVO_API_KEY?.trim();
  const fromEmail = process.env.MAIL_FROM_EMAIL?.trim();
  const fromName = process.env.MAIL_FROM_NAME?.trim() || 'MegaMarket';

  if (!apiKey || !fromEmail) {
    const missing: string[] = [];
    if (!apiKey) missing.push('BREVO_API_KEY');
    if (!fromEmail) missing.push('MAIL_FROM_EMAIL');
    console.warn(`[Mail] Email disabled: missing required environment variable(s): ${missing.join(', ')}.`);
    return false;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MAIL_TIMEOUT_MS);

  try {
    const response = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: fromName,
          email: fromEmail,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn(`[Mail] Brevo API request failed with HTTP ${response.status}.`);
      return false;
    }

    return true;
  } catch (err: unknown) {
    const reason =
      err instanceof Error && err.name === 'AbortError'
        ? 'Request timed out after 8 seconds'
        : err instanceof Error
        ? err.message
        : 'Unknown mail error';
    console.warn(`[Mail] Failed to send email: ${reason}.`);
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}
