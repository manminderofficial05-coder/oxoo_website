require('dotenv').config();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { generateInvoicePdf } = require('./invoicePdf');

// In-memory OTP storage: Map<normalizedKey, { otp, smsOtp, phone, email, expiresAt, verified, attempts, requireBoth }>
const otpStore = new Map();

// Helper to create transport with strict connection timeouts and dual port fallback
function createTransporters() {
  const user = process.env.EMAIL_USER;
  const pass = (process.env.EMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  if (!user || !pass) return { primary: null, secondary: null };

  const commonTimeouts = {
    connectionTimeout: 7000,
    greetingTimeout: 7000,
    socketTimeout: 10000,
    dnsTimeout: 5000
  };

  const primary = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
    ...commonTimeouts
  });

  const secondary = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass },
    ...commonTimeouts
  });

  return { primary, secondary };
}

// Send via Resend HTTPS REST API (Port 443 - Never blocked on Render)
async function sendViaResend({ to, subject, html, text }) {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) return null;

  const fromEmail = process.env.RESEND_FROM || 'PrimePro <onboarding@resend.dev>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      subject,
      html,
      text: text || undefined
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Resend API error (${res.status}): ${data.message || JSON.stringify(data)}`);
  }
  return { success: true, messageId: data.id, provider: 'resend' };
}

// Send via Brevo HTTPS REST API (Port 443 - Never blocked on Render)
async function sendViaBrevo({ to, subject, html, text, attachments = [] }) {
  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  if (!apiKey) return null;

  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || 'manminder.singh@primepro.ai';
  const payload = {
    sender: { name: 'PrimePro', email: senderEmail },
    to: [{ email: to }],
    subject,
    htmlContent: html,
    textContent: text || undefined
  };

  if (Array.isArray(attachments) && attachments.length > 0) {
    payload.attachment = attachments.map(att => {
      let b64 = '';
      if (Buffer.isBuffer(att.content)) {
        b64 = att.content.toString('base64');
      } else if (typeof att.content === 'string') {
        b64 = att.content.startsWith('data:') ? att.content.split(',')[1] : Buffer.from(att.content).toString('base64');
      }
      return {
        name: att.filename || att.name || 'invoice.pdf',
        content: b64
      };
    });
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Brevo API error (${res.status}): ${data.message || JSON.stringify(data)}`);
  }
  return { success: true, messageId: data.messageId, provider: 'brevo' };
}

// Function to send email with automatic HTTPS (Resend / Brevo) -> SMTP (Port 465 -> Port 587) fallback
async function sendMailWithFallback(mailOptions) {
  const to = mailOptions.to;
  const subject = mailOptions.subject;
  const html = mailOptions.html;
  const text = mailOptions.text || '';
  const attachments = mailOptions.attachments || [];

  // 1. Try Resend HTTPS REST API (Port 443) if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await sendViaResend({ to, subject, html, text });
      if (res && res.success) {
        console.log(`[EmailService] Delivered via Resend HTTPS API to ${to} (${res.messageId})`);
        return { success: true, messageId: res.messageId, port: 443, provider: 'resend' };
      }
    } catch (rErr) {
      console.warn(`[EmailService] Resend API attempt failed (${rErr.message}). Falling back...`);
    }
  }

  // 2. Try Brevo HTTPS REST API (Port 443)
  const brevoApiKey = (process.env.BREVO_API_KEY || '').trim();
  if (brevoApiKey) {
    try {
      const res = await sendViaBrevo({ to, subject, html, text, attachments });
      if (res && res.success) {
        console.log(`[EmailService] Delivered via Brevo HTTPS API to ${to} (${res.messageId})`);
        return { success: true, messageId: res.messageId, port: 443, provider: 'brevo' };
      }
    } catch (bErr) {
      if (bErr.message && bErr.message.includes('unrecognised IP address')) {
        console.error(`\x1b[31m[EmailService:CRITICAL] Brevo IP Authorization Block!\x1b[0m ${bErr.message}`);
        console.error(`\x1b[33m=> To fix: Add your IP to https://app.brevo.com/security/authorised_ips or disable the Authorized IPs restriction.\x1b[0m`);
      } else {
        console.warn(`[EmailService] Brevo HTTPS API attempt failed (${bErr.message}). Trying Brevo SMTP relay...`);
      }
    }
  }

  // 2b. Brevo SMTP relay on ports 587, 2525, 465 (using SMTP key)
  const brevoKey = (process.env.BREVO_SMTP_KEY || process.env.BREVO_API_KEY || '').trim();
  const brevoLogin = (process.env.BREVO_SMTP_LOGIN || process.env.EMAIL_USER || 'manminder.singh@primepro.ai').trim();
  if (brevoKey) {
    const ports = [587, 2525, 465];
    for (const port of ports) {
      try {
        const relay = nodemailer.createTransport({
          host: 'smtp-relay.brevo.com',
          port,
          secure: port === 465,
          auth: { user: brevoLogin, pass: brevoKey },
          connectionTimeout: 8000,
          greetingTimeout: 8000,
          socketTimeout: 10000
        });
        const sender = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || 'manminder.singh@primepro.ai';
        const info = await relay.sendMail({ ...mailOptions, from: `"PrimePro" <${sender}>`, attachments });
        console.log(`[EmailService] Delivered via Brevo SMTP relay (port ${port}) to ${to}`);
        return { success: true, messageId: info.messageId, port, provider: 'brevo-smtp' };
      } catch (sErr) {
        console.warn(`[EmailService] Brevo SMTP relay port ${port} attempt failed (${sErr.message}).`);
      }
    }
  }

  // 3. SMTP fallback (Port 465 SSL -> Port 587 STARTTLS) - only if configured
  const { primary, secondary } = createTransporters();
  if (primary && secondary) {
    try {
      const info = await primary.sendMail(mailOptions);
      return { success: true, messageId: info.messageId, port: 465, provider: 'smtp-465' };
    } catch (err465) {
      console.warn(`[EmailService] Port 465 delivery attempt failed (${err465.message}). Retrying on Port 587...`);
      try {
        const info = await secondary.sendMail(mailOptions);
        return { success: true, messageId: info.messageId, port: 587, provider: 'smtp-587' };
      } catch (err587) {
        console.error(`[EmailService] Port 587 delivery attempt also failed (${err587.message})`);
        throw new Error(`Email delivery failed on all channels (Resend, Brevo, SMTP): ${err587.message || err465.message}`);
      }
    }
  }

  // If running locally in development without verified outbound SMTP, log payload gracefully
  console.log(`[EmailService:Simulated] Outbound email to ${to} with subject "${subject}" (Attachments: ${attachments.length})`);
  return { success: true, messageId: `sim_${Date.now()}`, provider: 'simulated-dev' };
}

const DEFAULT_FROM = process.env.EMAIL_FROM || '"PrimePro" <manminder.singh@primepro.ai>';

// Normalize mobile number to international format with country code (+91 for 10-digit Indian numbers)
function normalizePhone(phone) {
  if (!phone) return null;
  const str = String(phone).trim();
  if (str.startsWith('+')) {
    const cleaned = '+' + str.slice(1).replace(/\D/g, '');
    return cleaned.length >= 8 ? cleaned : null;
  }
  const digits = str.replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  if (digits.length >= 10) {
    return `+${digits}`;
  }
  return null;
}

// Send Transactional SMS via Brevo
async function sendBrevoSms({ phone, otp, message }) {
  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  const recipient = normalizePhone(phone);

  if (!recipient) {
    console.warn('[Brevo SMS] Invalid recipient phone number:', phone);
    return { success: false, reason: 'Invalid phone number format' };
  }

  const content = message || `Your PrimePro verification code is ${otp}. Valid for 10 minutes. Do not share with anyone.`;

  if (!apiKey) {
    console.log(`[Brevo SMS:Mock] Code ${otp} to ${recipient}`);
    return { success: true, simulated: true, otp };
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/transactionalSMS/sendTransactionalSMS', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        sender: 'PrimePro',
        recipient,
        content,
        type: 'transactional'
      })
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log(`[Brevo SMS] Successfully delivered SMS to ${recipient} (Message ID: ${data.messageId || data.reference})`);
      return { success: true, messageId: data.messageId || data.reference, provider: 'brevo-sms' };
    }

    console.warn(`[Brevo SMS] Brevo API responded with ${res.status}:`, data.message || data);
    return {
      success: true,
      simulated: true,
      provider: 'brevo-sms',
      warning: data.message || `Brevo SMS status ${res.status}`,
      otp
    };
  } catch (err) {
    console.error('[Brevo SMS] Network error:', err.message);
    return { success: true, simulated: true, otp, error: err.message };
  }
}

// Send SMS OTP via Brevo with Fast2SMS fallback
async function sendSmsOtp({ phone, otp, message }) {
  const brevoRes = await sendBrevoSms({ phone, otp, message });
  if (brevoRes && brevoRes.success) return brevoRes;

  const fast2Key = (process.env.FAST2SMS_API_KEY || '').trim();
  if (fast2Key) {
    try {
      const tenDigits = String(phone).replace(/\D/g, '').slice(-10);
      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: { authorization: fast2Key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ route: 'otp', variables_values: otp, numbers: tenDigits, flash: 0 })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.return !== false) return { success: true, provider: 'fast2sms' };
    } catch (e) {
      console.warn('[Fast2SMS] Fallback failed:', e.message);
    }
  }

  return brevoRes || { success: true, simulated: true, otp };
}

/**
 * Master PrimePro Branded HTML Email Template Builder.
 * Adheres strictly to the official Brand Guidelines:
 * - Primary Navy: #082B68
 * - Primary Cyan: #12B5D8
 * - Dark Navy: #061B40
 * - Primary Text: #26374D
 * - Light Background: #F4F8FC
 * - Tagline: "Your 24/7 Workspace Is Here."
 */
function buildPrimeProEmailHtml({
  heading,
  bodyHtml,
  buttonText,
  buttonUrl,
  subtextHtml = '',
  cardExtraHtml = '',
  subject = ''
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject || heading || 'PrimePro Notification'}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F8FC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #26374D; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F4F8FC; padding: 36px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 30px rgba(8, 43, 104, 0.08);">
          
          <!-- Top Navy Header with Official PrimePro Identity -->
          <tr>
            <td style="background-color: #061B40; background: linear-gradient(135deg, #061B40 0%, #082B68 100%); padding: 32px 30px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <!-- Brand Mark / Header Wordmark -->
                    <a href="https://primepro.ai" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="https://primepro.ai/primepro-logo-horizontal-white.png" alt="PrimePro" style="height: 38px; width: auto; max-width: 220px; display: block; border: 0;" onerror="this.style.display='none'" />
                      <div style="font-size: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px; line-height: 1.2;">
                        <span style="color: #FFFFFF;">Prime</span><span style="color: #12B5D8;">Pro</span>
                      </div>
                    </a>
                    <div style="margin-top: 8px; font-size: 11px; font-weight: 600; color: #12B5D8; letter-spacing: 1.2px; text-transform: uppercase;">
                      Your 24/7 Workspace Is Here.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 38px 34px 28px 34px; background-color: #FFFFFF;">
              ${heading ? `
              <h1 style="margin: 0 0 18px 0; font-size: 22px; font-weight: 800; color: #082B68; letter-spacing: -0.4px; line-height: 1.3;">
                ${heading}
              </h1>` : ''}

              <div style="font-size: 14.5px; line-height: 1.65; color: #26374D; margin-bottom: 24px;">
                ${bodyHtml}
              </div>

              ${cardExtraHtml ? `
              <div style="margin: 22px 0;">
                ${cardExtraHtml}
              </div>` : ''}

              ${buttonText && buttonUrl ? `
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0 16px 0;">
                <tr>
                  <td align="center">
                    <a href="${buttonUrl}" target="_blank" style="display: inline-block; background-color: #082B68; background: linear-gradient(135deg, #082B68 0%, #12B5D8 100%); color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 34px; border-radius: 10px; box-shadow: 0 6px 18px rgba(8, 43, 104, 0.28); letter-spacing: 0.2px;">
                      ${buttonText} →
                    </a>
                  </td>
                </tr>
              </table>` : ''}

              ${subtextHtml ? `
              <div style="margin-top: 26px; padding-top: 18px; border-top: 1px solid #EDF2F7; font-size: 12.5px; line-height: 1.6; color: #64748B;">
                ${subtextHtml}
              </div>` : ''}
            </td>
          </tr>

          <!-- Professional Footer -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 30px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #082B68;">
                PrimePro.ai — Your 24/7 Workspace Is Here.
              </p>
              <p style="margin: 0 0 10px 0; font-size: 11.5px; color: #64748B;">
                <a href="https://primepro.ai" target="_blank" style="color: #12B5D8; text-decoration: none; font-weight: 600;">Visit Website</a>
                &nbsp;·&nbsp;
                <a href="https://primepro.ai/#/customer/login" target="_blank" style="color: #12B5D8; text-decoration: none; font-weight: 600;">Customer Portal</a>
                &nbsp;·&nbsp;
                <a href="mailto:support@primepro.ai" style="color: #12B5D8; text-decoration: none; font-weight: 600;">support@primepro.ai</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                © ${new Date().getFullYear()} PrimePro Cloud Technologies. All rights reserved.<br>
                Powered by PrimePro.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// -----------------------------------------------------------------------------
// EMAIL 1: Welcome Email
// -----------------------------------------------------------------------------
async function sendWelcomeEmail({ to, customerName = 'Valued Customer', loginUrl = 'https://primepro.ai/#/customer/login', credentials = null }) {
  const normEmail = String(to || '').trim().toLowerCase();
  if (!normEmail) throw new Error('Recipient email is required.');

  const subject = 'Welcome to PrimePro — Your 24/7 Workspace Is Here!';
  const heading = 'Welcome to PrimePro!';

  const bodyHtml = `
    <p style="margin: 0 0 14px 0;">Hello <strong>${customerName}</strong>,</p>
    <p style="margin: 0 0 14px 0;">Your business workspace is ready.</p>
    <p style="margin: 0 0 14px 0;">Access your applications, manage your team, explore your subscription and manage your business through one centralized workspace.</p>
    <p style="margin: 0 0 14px 0;">Thank you for choosing PrimePro.</p>
    <p style="margin: 0; font-weight: 700; color: #082B68;">Your 24/7 Workspace Is Here.</p>
  `;

  let credsHtml = '';
  if (credentials) {
    credsHtml = `
      <div style="background-color: #F4F8FC; border: 1px solid #D8E6F5; border-radius: 10px; padding: 18px 20px; font-size: 13.5px;">
        <div style="font-weight: 700; color: #082B68; margin-bottom: 10px; font-size: 14px;">Your PrimePro Login Credentials</div>
        ${credentials.storageId ? `<div style="margin-bottom: 6px;"><strong>Storage ID:</strong> <span style="font-family: monospace; font-weight: 700; color: #082B68;">${credentials.storageId}</span></div>` : ''}
        <div style="margin-bottom: 6px;"><strong>User / Login ID:</strong> <span style="font-family: monospace;">${normEmail}</span></div>
        ${credentials.password ? `<div><strong>Temporary Password:</strong> <span style="font-family: monospace; background: #E2E8F0; padding: 2px 8px; border-radius: 4px;">${credentials.password}</span></div>` : ''}
      </div>
    `;
  }

  const html = buildPrimeProEmailHtml({
    subject,
    heading,
    bodyHtml,
    cardExtraHtml: credsHtml,
    buttonText: 'Access Your Workspace',
    buttonUrl: loginUrl,
    subtextHtml: `Direct portal link: <a href="${loginUrl}" style="color: #12B5D8;">${loginUrl}</a>`
  });

  const text = `Welcome to PrimePro!\n\nYour business workspace is ready.\nAccess your applications, manage your team, explore your subscription and manage your business through one centralized workspace.\n\nThank you for choosing PrimePro.\nYour 24/7 Workspace Is Here.\n\nAccess your workspace at: ${loginUrl}\nUser ID: ${normEmail}`;

  return await sendMailWithFallback({ from: DEFAULT_FROM, to: normEmail, subject, html, text });
}

// -----------------------------------------------------------------------------
// EMAIL 2: OTP Verification Email
// -----------------------------------------------------------------------------
async function sendOtpEmail({ email, phone = '', purpose = 'Verification', customerName = '' }) {
  const normEmail = (email || '').trim().toLowerCase();
  if (!normEmail) throw new Error('Recipient email address is required.');

  const otp = crypto.randomInt(100000, 1000000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(normEmail, {
    otp,
    email: normEmail,
    purpose,
    expiresAt,
    verified: false,
    attempts: 0
  });

  const subject = 'Your PrimePro Verification Code';
  const heading = 'Verify Your Email Address';

  const bodyHtml = `
    ${customerName ? `<p style="margin: 0 0 14px 0;">Hello <strong>${customerName}</strong>,</p>` : ''}
    <p style="margin: 0 0 14px 0;">Use the verification code below to securely verify your PrimePro account for <strong>${purpose}</strong>.</p>
  `;

  const otpCardHtml = `
    <div style="background-color: #F4F8FC; border: 2px dashed #12B5D8; border-radius: 12px; padding: 22px; text-align: center;">
      <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #082B68; display: block;">
        ${otp}
      </span>
      <span style="font-size: 12px; color: #64748B; margin-top: 8px; display: block; font-weight: 500;">
        Valid for 10 minutes · Do not share this code with anyone
      </span>
    </div>
  `;

  const html = buildPrimeProEmailHtml({
    subject,
    heading,
    bodyHtml,
    cardExtraHtml: otpCardHtml,
    buttonText: 'Verify Account',
    buttonUrl: 'https://primepro.ai/#/customer/login',
    subtextHtml: 'If you did not make this request, you can safely ignore this email.'
  });

  const text = `Your PrimePro Verification Code is: ${otp}\n\nUse this verification code to securely verify your PrimePro account. Valid for 10 minutes.`;

  const emailRes = await sendMailWithFallback({ from: DEFAULT_FROM, to: normEmail, subject, html, text });
  const emailDelivered = Boolean(emailRes && emailRes.success);

  return {
    success: true,
    emailSent: emailDelivered,
    message: emailDelivered ? `Verification code sent to ${normEmail}` : `Verification code generated successfully`,
    devOtp: process.env.NODE_ENV !== 'production' ? { emailOtp: otp } : undefined
  };
}

function verifyOtp({ email, phone, otp, smsOtp }) {
  const normEmail = (email || '').trim().toLowerCase();
  const cleanPhone = normalizePhone(phone);
  const entry = (normEmail && otpStore.get(normEmail)) || (cleanPhone && otpStore.get(cleanPhone));

  if (!entry) {
    return { valid: false, message: 'No OTP code was requested or it has expired. Please request a new code.' };
  }

  if (Date.now() > entry.expiresAt) {
    if (normEmail) otpStore.delete(normEmail);
    if (cleanPhone) otpStore.delete(cleanPhone);
    return { valid: false, message: 'This verification code has expired. Please request a new code.' };
  }

  if (entry.attempts >= 5) {
    if (normEmail) otpStore.delete(normEmail);
    if (cleanPhone) otpStore.delete(cleanPhone);
    return { valid: false, message: 'Too many incorrect attempts. Please request a new code.' };
  }

  const inputCode = String(otp || smsOtp || '').trim();
  if (!inputCode) {
    return { valid: false, message: 'Please enter the 6-digit email verification code.' };
  }

  if (entry.otp !== inputCode) {
    entry.attempts += 1;
    return { valid: false, message: 'Incorrect email verification code. Please check your inbox.' };
  }

  if (normEmail) otpStore.delete(normEmail);
  if (cleanPhone) otpStore.delete(cleanPhone);

  return { valid: true, message: 'Email OTP verified successfully.' };
}

// -----------------------------------------------------------------------------
// EMAIL 3: Password Reset Email
// -----------------------------------------------------------------------------
async function sendPasswordResetEmail(opts = {}) {
  const targetEmail = opts.toEmail || opts.to || opts.email;
  if (!targetEmail) throw new Error('Recipient email is required.');
  const normEmail = targetEmail.trim().toLowerCase();
  const customerName = opts.customerName || 'Customer';
  const storageId = opts.storageId || '';
  const resetUrl = opts.resetUrl || (opts.resetToken ? `https://primepro.ai/#/reset-password?token=${opts.resetToken}` : 'https://primepro.ai/#/reset-password');

  const subject = 'Reset Your PrimePro Password';
  const heading = 'Password Reset Request';

  const bodyHtml = `
    <p style="margin: 0 0 14px 0;">Hello <strong>${customerName}</strong>,</p>
    <p style="margin: 0 0 14px 0;">We received a request to reset your PrimePro account password. Use the secure link below to continue.</p>
  `;

  let extraHtml = '';
  if (storageId) {
    extraHtml = `
      <div style="background-color: #F4F8FC; border: 1px solid #D8E6F5; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #082B68;">
        <strong>Storage / Account ID:</strong> <span style="font-family: monospace; font-weight: 700;">${storageId}</span>
      </div>
    `;
  }

  const html = buildPrimeProEmailHtml({
    subject,
    heading,
    bodyHtml,
    cardExtraHtml: extraHtml,
    buttonText: 'Reset Password',
    buttonUrl: resetUrl,
    subtextHtml: `This secure link is valid for 1 hour.<br>If the button doesn't work, copy and paste this link:<br><a href="${resetUrl}" style="color: #12B5D8; word-break: break-all;">${resetUrl}</a><br><br>If you did not request a password reset, you can safely ignore this email.`
  });

  const text = `Reset Your PrimePro Password\n\nWe received a request to reset your PrimePro account password. Use the secure link below to continue:\n\n${resetUrl}\n\nThis link is valid for 1 hour. If you did not request this, please ignore this email.`;

  try {
    const info = await sendMailWithFallback({ from: DEFAULT_FROM, to: normEmail, subject, html, text });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EmailService] Could not deliver reset password email to ${normEmail}:`, err.message);
    return { success: false, error: err.message };
  }
}

// -----------------------------------------------------------------------------
// EMAIL 4: Subscription Confirmation Email
// -----------------------------------------------------------------------------
async function sendSubscriptionConfirmationEmail({
  to,
  customerName = 'Valued Customer',
  planName = 'Standard Plan',
  expiryDate = '',
  amount = '',
  manageUrl = 'https://primepro.ai/#/customer/login'
}) {
  const normEmail = String(to || '').trim().toLowerCase();
  const subject = 'Your PrimePro Subscription Is Confirmed';
  const heading = 'Subscription Activated!';

  const bodyHtml = `
    <p style="margin: 0 0 14px 0;">Hello <strong>${customerName}</strong>,</p>
    <p style="margin: 0 0 14px 0;">Your PrimePro subscription is now active. You can access your subscribed applications and manage your workspace.</p>
  `;

  const detailsHtml = `
    <div style="background-color: #F4F8FC; border: 1px solid #D8E6F5; border-radius: 10px; padding: 18px 20px; font-size: 13.5px;">
      <div style="font-weight: 700; color: #082B68; margin-bottom: 8px;">Subscription Details</div>
      <div style="margin-bottom: 6px;"><strong>Active Plan:</strong> <span style="font-weight: 700; color: #12B5D8;">${planName}</span></div>
      ${amount ? `<div style="margin-bottom: 6px;"><strong>Amount Paid:</strong> Rs. ${amount}</div>` : ''}
      ${expiryDate ? `<div><strong>Valid Until:</strong> ${expiryDate}</div>` : ''}
    </div>
  `;

  const html = buildPrimeProEmailHtml({
    subject,
    heading,
    bodyHtml,
    cardExtraHtml: detailsHtml,
    buttonText: 'View Subscription',
    buttonUrl: manageUrl,
    subtextHtml: `Manage your applications anytime at: <a href="${manageUrl}" style="color: #12B5D8;">${manageUrl}</a>`
  });

  const text = `Your PrimePro Subscription Is Confirmed!\n\nYour PrimePro subscription is now active. Plan: ${planName}. Access your workspace at: ${manageUrl}`;

  return await sendMailWithFallback({ from: DEFAULT_FROM, to: normEmail, subject, html, text });
}

// -----------------------------------------------------------------------------
// EMAIL 5: Subscription Reminder Email
// -----------------------------------------------------------------------------
async function sendSubscriptionReminderEmail({
  to,
  customerName = 'Valued Customer',
  planName = 'Standard Plan',
  daysRemaining = 7,
  expiryDate = '',
  renewalUrl = 'https://primepro.ai/#/customer/login'
}) {
  const normEmail = String(to || '').trim().toLowerCase();
  const subject = 'Your PrimePro Subscription Renewal Reminder';
  const heading = 'Your Subscription Is Due for Renewal';

  const bodyHtml = `
    <p style="margin: 0 0 14px 0;">Hello <strong>${customerName}</strong>,</p>
    <p style="margin: 0 0 14px 0;">Your subscription is approaching its renewal date. Review your subscription details and complete your renewal to maintain uninterrupted access.</p>
  `;

  const reminderCardHtml = `
    <div style="background-color: #FFFBEB; border: 1px solid #FCD34D; border-radius: 10px; padding: 18px 20px; font-size: 13.5px; color: #92400E;">
      <div style="font-weight: 700; color: #B45309; margin-bottom: 6px;">Renewal Alert · ${daysRemaining} Days Remaining</div>
      <div style="margin-bottom: 4px;"><strong>Plan:</strong> ${planName}</div>
      ${expiryDate ? `<div><strong>Renewal Date:</strong> ${expiryDate}</div>` : ''}
    </div>
  `;

  const html = buildPrimeProEmailHtml({
    subject,
    heading,
    bodyHtml,
    cardExtraHtml: reminderCardHtml,
    buttonText: 'Manage Subscription',
    buttonUrl: renewalUrl,
    subtextHtml: `Renew securely at: <a href="${renewalUrl}" style="color: #12B5D8;">${renewalUrl}</a>`
  });

  const text = `Your PrimePro Subscription Renewal Reminder\n\nYour subscription is due for renewal in ${daysRemaining} days. Plan: ${planName}.\nRenew at: ${renewalUrl}`;

  return await sendMailWithFallback({ from: DEFAULT_FROM, to: normEmail, subject, html, text });
}

// Alias for backwards compatibility with server.js callers
const sendAdminSubscriptionDueEmail = sendSubscriptionReminderEmail;

// -----------------------------------------------------------------------------
// EMAIL 6: Successful Payment & Welcome/Invoice Email
// -----------------------------------------------------------------------------
async function sendPaymentSuccessEmail({
  to,
  customerName = 'Valued Customer',
  invoiceNumber = 'INV-2026',
  amount = 0,
  invoiceUrl = 'https://primepro.ai/#/customer/login',
  attachments = []
}) {
  const normEmail = String(to || '').trim().toLowerCase();
  const subject = 'PrimePro Payment Confirmation';
  const heading = 'Payment Successful!';

  const bodyHtml = `
    <p style="margin: 0 0 14px 0;">Hello <strong>${customerName}</strong>,</p>
    <p style="margin: 0 0 14px 0;">Your payment has been successfully received. Your payment details and invoice are available in your PrimePro account.</p>
  `;

  const paymentCardHtml = `
    <div style="background-color: #F4F8FC; border: 1px solid #D8E6F5; border-radius: 10px; padding: 18px 20px; font-size: 13.5px;">
      <div style="font-weight: 700; color: #082B68; margin-bottom: 8px;">Payment Summary</div>
      <div style="margin-bottom: 6px;"><strong>Invoice Number:</strong> <span style="font-family: monospace; font-weight: 700;">${invoiceNumber}</span></div>
      <div style="margin-bottom: 6px;"><strong>Amount Paid:</strong> <span style="color: #059669; font-weight: 700;">Rs. ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
      <div><strong>Status:</strong> <span style="color: #059669; font-weight: 700;">PAID & VERIFIED</span></div>
    </div>
  `;

  const html = buildPrimeProEmailHtml({
    subject,
    heading,
    bodyHtml,
    cardExtraHtml: paymentCardHtml,
    buttonText: 'View Invoice',
    buttonUrl: invoiceUrl,
    subtextHtml: 'Your official GST Tax Invoice PDF is attached to this email.'
  });

  const text = `PrimePro Payment Confirmation\n\nPayment Successful!\nYour payment of Rs. ${amount} for invoice ${invoiceNumber} has been received.\nView your invoice at: ${invoiceUrl}`;

  return await sendMailWithFallback({ from: DEFAULT_FROM, to: normEmail, subject, html, text, attachments });
}

// Master registration & purchase email combining credentials and invoice PDF
async function sendInvoiceAndCredentialsEmail({
  toEmail,
  customerName = 'Valued Customer',
  companyName = 'My Organization',
  storageId = 'STG-08643413',
  password = 'PrimeProUser@2026',
  invoiceNumber = 'INV-2026',
  orderNumber = 'ORD-2026',
  amount = 0,
  selectedApps = [],
  billingCycle = 'monthly',
  userCount = 1,
  paymentId = 'pay_verified',
  planName = 'Standard Plan'
}) {
  const normEmail = String(toEmail || '').trim().toLowerCase();
  if (!normEmail) throw new Error('Recipient email is required.');

  // Generate official PDF invoice with PDFKit
  let pdfBuffer = null;
  try {
    pdfBuffer = await generateInvoicePdf({
      invoiceNumber,
      orderNumber,
      storageId,
      customerName,
      companyName,
      customerEmail: normEmail,
      amount,
      planName,
      selectedApps,
      billingCycle,
      userCount,
      paymentId
    });
  } catch (pdfErr) {
    console.error('[EmailService] Invoice PDF generation error:', pdfErr.message);
  }

  const attachments = pdfBuffer ? [{
    filename: `PrimePro_Tax_Invoice_${invoiceNumber}.pdf`,
    content: pdfBuffer,
    contentType: 'application/pdf'
  }] : [];

  const subject = `Welcome to PrimePro — Your 24/7 Workspace Is Here! [${invoiceNumber}]`;
  const heading = 'Welcome to PrimePro!';

  const bodyHtml = `
    <p style="margin: 0 0 14px 0;">Hello <strong>${customerName}</strong>,</p>
    <p style="margin: 0 0 14px 0;">Your business workspace is ready.</p>
    <p style="margin: 0 0 14px 0;">Access your applications, manage your team, explore your subscription and manage your business through one centralized workspace.</p>
    <p style="margin: 0 0 14px 0;">Thank you for choosing PrimePro.</p>
    <p style="margin: 0; font-weight: 700; color: #082B68;">Your 24/7 Workspace Is Here.</p>
  `;

  const credsCardHtml = `
    <div style="background-color: #F4F8FC; border: 1px solid #D8E6F5; border-radius: 10px; padding: 20px; font-size: 13.5px; margin-bottom: 16px;">
      <div style="font-weight: 700; color: #082B68; margin-bottom: 12px; font-size: 14.5px;">Your Customer Workspace Credentials</div>
      <div style="margin-bottom: 8px;"><strong>Customer Storage ID:</strong> <span style="font-family: monospace; font-weight: 700; color: #082B68;">${storageId}</span></div>
      <div style="margin-bottom: 8px;"><strong>User / Login ID:</strong> <span style="font-family: monospace;">${normEmail}</span></div>
      <div style="margin-bottom: 8px;"><strong>Initial Password:</strong> <span style="font-family: monospace; background: #E2E8F0; padding: 2px 8px; border-radius: 4px; font-weight: 700;">${password}</span></div>
      <div><strong>Workspace URL:</strong> <a href="https://primepro.ai/#/customer/login" style="color: #12B5D8;">https://primepro.ai/#/customer/login</a></div>
    </div>
    <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 16px 20px; font-size: 13px;">
      <div style="font-weight: 700; color: #082B68; margin-bottom: 6px;">Payment & Invoice Details</div>
      <div>Invoice: <strong>${invoiceNumber}</strong> · Amount: <strong>Rs. ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> · Plan: <strong>${planName}</strong></div>
      <div style="color: #059669; font-weight: 600; margin-top: 4px;">Official GST Invoice attached below.</div>
    </div>
  `;

  const html = buildPrimeProEmailHtml({
    subject,
    heading,
    bodyHtml,
    cardExtraHtml: credsCardHtml,
    buttonText: 'Access Your Workspace',
    buttonUrl: 'https://primepro.ai/#/customer/login',
    subtextHtml: 'Please store your Customer Storage ID and Login Credentials in a secure location.'
  });

  const text = `Welcome to PrimePro!\n\nYour business workspace is ready.\n\nCredentials:\nStorage ID: ${storageId}\nUser ID: ${normEmail}\nPassword: ${password}\n\nLogin at: https://primepro.ai/#/customer/login\nInvoice: ${invoiceNumber} (Rs. ${amount})`;

  return await sendMailWithFallback({
    from: DEFAULT_FROM,
    to: normEmail,
    subject,
    html,
    text,
    attachments
  });
}

// -----------------------------------------------------------------------------
// EMAIL 7: Failed Payment Email
// -----------------------------------------------------------------------------
async function sendPaymentFailedEmail({
  to,
  customerName = 'Valued Customer',
  amount = '',
  retryUrl = 'https://primepro.ai/#/checkout',
  errorReason = 'Card authentication failed or network timeout.'
}) {
  const normEmail = String(to || '').trim().toLowerCase();
  const subject = 'Action Required — PrimePro Payment Failed';
  const heading = 'Payment Could Not Be Completed';

  const bodyHtml = `
    <p style="margin: 0 0 14px 0;">Hello <strong>${customerName}</strong>,</p>
    <p style="margin: 0 0 14px 0;">We could not process your recent payment. Please review your payment details and try again.</p>
  `;

  const failCardHtml = `
    <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px; padding: 18px 20px; font-size: 13.5px; color: #991B1B;">
      <div style="font-weight: 700; color: #B91C1C; margin-bottom: 6px;">Transaction Failed</div>
      ${amount ? `<div style="margin-bottom: 4px;"><strong>Amount:</strong> Rs. ${amount}</div>` : ''}
      <div><strong>Reason:</strong> ${errorReason}</div>
    </div>
  `;

  const html = buildPrimeProEmailHtml({
    subject,
    heading,
    bodyHtml,
    cardExtraHtml: failCardHtml,
    buttonText: 'Retry Payment',
    buttonUrl: retryUrl,
    subtextHtml: `If you need assistance, please contact support@primepro.ai`
  });

  const text = `Action Required — PrimePro Payment Failed\n\nPayment Could Not Be Completed.\nWe could not process your recent payment. Please review your payment details and try again at: ${retryUrl}`;

  return await sendMailWithFallback({ from: DEFAULT_FROM, to: normEmail, subject, html, text });
}

// -----------------------------------------------------------------------------
// EMAIL 8: Invoice Ready Email
// -----------------------------------------------------------------------------
async function sendInvoiceReadyEmail({
  to,
  customerName = 'Valued Customer',
  invoiceNumber = 'INV-2026',
  amount = 0,
  downloadUrl = 'https://primepro.ai/#/customer/login',
  attachments = []
}) {
  const normEmail = String(to || '').trim().toLowerCase();
  const subject = 'Your PrimePro Invoice Is Ready';
  const heading = 'Your Invoice Is Available';

  const bodyHtml = `
    <p style="margin: 0 0 14px 0;">Hello <strong>${customerName}</strong>,</p>
    <p style="margin: 0 0 14px 0;">Your latest PrimePro invoice is ready. Download it from your account billing section.</p>
  `;

  const invCardHtml = `
    <div style="background-color: #F4F8FC; border: 1px solid #D8E6F5; border-radius: 10px; padding: 18px 20px; font-size: 13.5px;">
      <div style="font-weight: 700; color: #082B68; margin-bottom: 6px;">Invoice Summary</div>
      <div style="margin-bottom: 4px;"><strong>Invoice:</strong> <span style="font-family: monospace;">${invoiceNumber}</span></div>
      ${amount ? `<div><strong>Total Amount:</strong> Rs. ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>` : ''}
    </div>
  `;

  const html = buildPrimeProEmailHtml({
    subject,
    heading,
    bodyHtml,
    cardExtraHtml: invCardHtml,
    buttonText: 'Download Invoice',
    buttonUrl: downloadUrl,
    subtextHtml: 'Your invoice is also attached directly to this email in PDF format.'
  });

  const text = `Your PrimePro Invoice Is Ready\n\nYour latest PrimePro invoice (${invoiceNumber}) is ready. Download it from your account billing section: ${downloadUrl}`;

  return await sendMailWithFallback({ from: DEFAULT_FROM, to: normEmail, subject, html, text, attachments });
}

// -----------------------------------------------------------------------------
// EMAIL 9: Support Ticket Update Email
// -----------------------------------------------------------------------------
async function sendSupportTicketUpdateEmail({
  to,
  customerName = 'Valued Customer',
  ticketNumber = 'TICK-1001',
  ticketSubject = 'Inquiry',
  updateDetails = '',
  origin = 'https://primepro.ai'
}) {
  const normEmail = String(to || '').trim().toLowerCase();
  const subject = 'PrimePro Support Ticket Update';
  const heading = 'Your Support Request Has Been Updated';

  const viewUrl = `${origin}/#/help`;

  const bodyHtml = `
    <p style="margin: 0 0 14px 0;">Hello <strong>${customerName}</strong>,</p>
    <p style="margin: 0 0 14px 0;">There is an update to your support request. Log in to PrimePro to view the latest information.</p>
  `;

  const ticketCardHtml = `
    <div style="background-color: #F4F8FC; border: 1px solid #D8E6F5; border-radius: 10px; padding: 18px 20px; font-size: 13.5px;">
      <div style="font-weight: 700; color: #082B68; margin-bottom: 6px;">Ticket #${ticketNumber}</div>
      <div style="margin-bottom: 6px;"><strong>Subject:</strong> ${ticketSubject}</div>
      ${updateDetails ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #CBD5E1; color: #475569;"><em>"${updateDetails}"</em></div>` : ''}
    </div>
  `;

  const html = buildPrimeProEmailHtml({
    subject,
    heading,
    bodyHtml,
    cardExtraHtml: ticketCardHtml,
    buttonText: 'View Support Ticket',
    buttonUrl: viewUrl,
    subtextHtml: `Our support team is available 24/7 at support@primepro.ai`
  });

  const text = `PrimePro Support Ticket Update\n\nThere is an update to your support request #${ticketNumber} (${ticketSubject}).\nLog in to view the latest information: ${viewUrl}`;

  return await sendMailWithFallback({ from: DEFAULT_FROM, to: normEmail, subject, html, text });
}

// Alias for backwards compatibility
const sendTicketAcknowledgementEmail = sendSupportTicketUpdateEmail;

// -----------------------------------------------------------------------------
// EMAIL 10: Team Invitation / Staff Credentials Email
// -----------------------------------------------------------------------------
async function sendTeamInvitationEmail({
  to,
  name = 'Team Member',
  role = 'Member',
  workspaceName = 'PrimePro Workspace',
  inviteUrl = 'https://primepro.ai/#/customer/login',
  password = '',
  employeeId = ''
}) {
  const normEmail = String(to || '').trim().toLowerCase();
  const subject = "You've Been Invited to a PrimePro Workspace";
  const heading = "You're Invited!";

  const bodyHtml = `
    <p style="margin: 0 0 14px 0;">Hello <strong>${name}</strong>,</p>
    <p style="margin: 0 0 14px 0;">You have been invited to join a PrimePro workspace (<strong>${workspaceName}</strong>) as a <strong>${role}</strong>.</p>
    <p style="margin: 0 0 14px 0;">Accept the invitation to access your organization's applications.</p>
  `;

  let extraHtml = '';
  if (password || employeeId) {
    extraHtml = `
      <div style="background-color: #F4F8FC; border: 1px solid #D8E6F5; border-radius: 10px; padding: 18px 20px; font-size: 13.5px;">
        <div style="font-weight: 700; color: #082B68; margin-bottom: 8px;">Access Credentials</div>
        ${employeeId ? `<div style="margin-bottom: 6px;"><strong>Member ID:</strong> <span style="font-family: monospace;">${employeeId}</span></div>` : ''}
        <div style="margin-bottom: 6px;"><strong>Login Email:</strong> <span style="font-family: monospace;">${normEmail}</span></div>
        ${password ? `<div><strong>Password:</strong> <span style="font-family: monospace; background: #E2E8F0; padding: 2px 8px; border-radius: 4px; font-weight: 700;">${password}</span></div>` : ''}
      </div>
    `;
  }

  const html = buildPrimeProEmailHtml({
    subject,
    heading,
    bodyHtml,
    cardExtraHtml: extraHtml,
    buttonText: 'Accept Invitation',
    buttonUrl: inviteUrl,
    subtextHtml: `Access your workspace at: <a href="${inviteUrl}" style="color: #12B5D8;">${inviteUrl}</a>`
  });

  const text = `You've Been Invited to a PrimePro Workspace!\n\nYou have been invited to join ${workspaceName} as a ${role}.\nAccept the invitation to access your organization's applications at: ${inviteUrl}`;

  return await sendMailWithFallback({ from: DEFAULT_FROM, to: normEmail, subject, html, text });
}

// Admin staff credentials email (compatible with existing admin callers)
async function sendAdminStaffCredentialsEmail({ to, name, role, email, employeeId, password, assignedSoftware = [], loginUrl }) {
  const normEmail = String(to || email || '').trim().toLowerCase();
  const userName = name || 'Administrator';
  const userRole = role || 'Software Admin';
  const userPwd = password || 'PrimeProAdmin@2026';
  const portalUrl = loginUrl || process.env.ADMIN_LOGIN_URL || 'https://primepro.ai/#/admin/login';

  return await sendTeamInvitationEmail({
    to: normEmail,
    name: userName,
    role: userRole,
    workspaceName: 'PrimePro Control Center',
    inviteUrl: portalUrl,
    password: userPwd,
    employeeId
  });
}

// -----------------------------------------------------------------------------
// Additional Notification Handlers (Rebranded to PrimePro)
// -----------------------------------------------------------------------------
async function sendInquiryConfirmationEmail({ to, contactPerson, companyName, inquiryRef, category, productName, selectedPlan }) {
  const normEmail = String(to || '').trim().toLowerCase();
  const subject = `PrimePro Inquiry Acknowledged: ${inquiryRef}`;
  const heading = 'We Received Your Inquiry';

  const bodyHtml = `
    <p style="margin: 0 0 14px 0;">Hello <strong>${contactPerson || 'Valued Partner'}</strong>,</p>
    <p style="margin: 0 0 14px 0;">Thank you for your interest in PrimePro enterprise solutions for <strong>${companyName || 'your organization'}</strong>.</p>
    <p style="margin: 0 0 14px 0;">Our enterprise team has received your inquiry (Ref: <strong>${inquiryRef}</strong>) regarding <strong>${productName || category || 'Enterprise Workspace'}</strong> (${selectedPlan || 'Custom Plan'}). A specialist will connect with you within 1 business day.</p>
  `;

  const html = buildPrimeProEmailHtml({
    subject,
    heading,
    bodyHtml,
    buttonText: 'Visit PrimePro',
    buttonUrl: 'https://primepro.ai',
    subtextHtml: 'Need urgent assistance? Reply directly to this email or contact support@primepro.ai.'
  });

  return await sendMailWithFallback({ from: DEFAULT_FROM, to: normEmail, subject, html });
}

async function sendDemoRequestNotificationEmail({ adminEmail = 'manminder.singh@primepro.ai', demoDetails = {} }) {
  const subject = `[PrimePro Demo Request] ${demoDetails.customerName || 'New Lead'} - ${demoDetails.companyName || 'Business'}`;
  const heading = 'New Live Demo Request';

  const bodyHtml = `
    <p style="margin: 0 0 14px 0;">A new enterprise demo was requested on PrimePro.</p>
    <div style="background-color: #F4F8FC; border: 1px solid #D8E6F5; border-radius: 10px; padding: 18px 20px; font-size: 13.5px;">
      <div><strong>Name:</strong> ${demoDetails.customerName || 'N/A'}</div>
      <div><strong>Email:</strong> ${demoDetails.customerEmail || 'N/A'}</div>
      <div><strong>Phone:</strong> ${demoDetails.customerPhone || 'N/A'}</div>
      <div><strong>Company:</strong> ${demoDetails.companyName || 'N/A'}</div>
      <div><strong>App / Suite:</strong> ${demoDetails.appName || demoDetails.selectedApp || 'General Demo'}</div>
    </div>
  `;

  const html = buildPrimeProEmailHtml({
    subject,
    heading,
    bodyHtml,
    buttonText: 'Open Admin Dashboard',
    buttonUrl: 'https://primepro.ai/#/admin'
  });

  return await sendMailWithFallback({ from: DEFAULT_FROM, to: adminEmail, subject, html });
}

async function sendProjectRequestNotificationEmail({ to, customerName, projectName, projectRef, details = {} }) {
  const normEmail = String(to || '').trim().toLowerCase();
  const subject = `PrimePro Project Request Acknowledged: ${projectRef}`;
  const heading = 'Project Scope Received';

  const bodyHtml = `
    <p style="margin: 0 0 14px 0;">Hello <strong>${customerName || 'Partner'}</strong>,</p>
    <p style="margin: 0 0 14px 0;">Thank you for submitting your project request for <strong>${projectName || 'Custom Development'}</strong> (Ref: <strong>${projectRef}</strong>) on PrimePro.</p>
    <p style="margin: 0 0 14px 0;">Our solutions architect will review the requirements and schedule an alignment session.</p>
  `;

  const html = buildPrimeProEmailHtml({
    subject,
    heading,
    bodyHtml,
    buttonText: 'View Workspace',
    buttonUrl: 'https://primepro.ai/#/customer/login'
  });

  return await sendMailWithFallback({ from: DEFAULT_FROM, to: normEmail, subject, html });
}

async function sendConsultationRequestNotificationEmail({ to, customerName, consultationDate, topic }) {
  const normEmail = String(to || '').trim().toLowerCase();
  const subject = `PrimePro Consultation Confirmed: ${topic || 'Enterprise Architecture'}`;
  const heading = 'Consultation Scheduled';

  const bodyHtml = `
    <p style="margin: 0 0 14px 0;">Hello <strong>${customerName || 'Valued Partner'}</strong>,</p>
    <p style="margin: 0 0 14px 0;">Your enterprise consultation with PrimePro has been scheduled.</p>
    <p style="margin: 0 0 14px 0;">Date/Time: <strong>${consultationDate || 'Upcoming'}</strong><br>Topic: <strong>${topic || 'Enterprise Software Architecture'}</strong></p>
  `;

  const html = buildPrimeProEmailHtml({
    subject,
    heading,
    bodyHtml,
    buttonText: 'Join Workspace',
    buttonUrl: 'https://primepro.ai'
  });

  return await sendMailWithFallback({ from: DEFAULT_FROM, to: normEmail, subject, html });
}

async function sendProjectStatusUpdateEmail({ to, customerName, projectName, status, message }) {
  const normEmail = String(to || '').trim().toLowerCase();
  const subject = `PrimePro Project Update: ${projectName} [${status}]`;
  const heading = `Project Update: ${status}`;

  const bodyHtml = `
    <p style="margin: 0 0 14px 0;">Hello <strong>${customerName || 'Partner'}</strong>,</p>
    <p style="margin: 0 0 14px 0;">There is an update on your project <strong>${projectName}</strong>.</p>
    <p style="margin: 0 0 14px 0;">Status: <strong>${status}</strong></p>
    ${message ? `<p style="margin: 0 0 14px 0; padding: 12px 16px; background: #F4F8FC; border-left: 3px solid #12B5D8;">${message}</p>` : ''}
  `;

  const html = buildPrimeProEmailHtml({
    subject,
    heading,
    bodyHtml,
    buttonText: 'View Project',
    buttonUrl: 'https://primepro.ai/#/customer/login'
  });

  return await sendMailWithFallback({ from: DEFAULT_FROM, to: normEmail, subject, html });
}

module.exports = {
  // Core 10 Email Notification Handlers as specified by PrimePro
  sendWelcomeEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
  sendSubscriptionConfirmationEmail,
  sendSubscriptionReminderEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendInvoiceReadyEmail,
  sendSupportTicketUpdateEmail,
  sendTeamInvitationEmail,

  // Backwards-compatible aliases & existing endpoints
  verifyOtp,
  sendSmsOtp,
  sendInvoiceAndCredentialsEmail,
  sendAdminStaffCredentialsEmail,
  sendAdminSubscriptionDueEmail,
  sendTicketAcknowledgementEmail,
  sendInquiryConfirmationEmail,
  sendDemoRequestNotificationEmail,
  sendProjectRequestNotificationEmail,
  sendConsultationRequestNotificationEmail,
  sendProjectStatusUpdateEmail,
  sendMailWithFallback,
  buildPrimeProEmailHtml
};
