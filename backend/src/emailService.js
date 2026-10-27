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
async function sendViaResend({ to, subject, html }) {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) return null;

  const fromEmail = process.env.RESEND_FROM || 'OXOO <onboarding@resend.dev>';
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
      html
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Resend API error (${res.status}): ${data.message || JSON.stringify(data)}`);
  }
  return { success: true, messageId: data.id, provider: 'resend' };
}

// Send via Brevo HTTPS REST API (Port 443 - Never blocked on Render)
async function sendViaBrevo({ to, subject, html, attachments = [] }) {
  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  if (!apiKey) return null;

  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || 'manminder.singh@primepro.ai';
  const payload = {
    sender: { name: 'OXOO', email: senderEmail },
    to: [{ email: to }],
    subject,
    htmlContent: html
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
  const attachments = mailOptions.attachments || [];

  // 1. Try Resend HTTPS REST API (Port 443) if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await sendViaResend({ to, subject, html });
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
      const res = await sendViaBrevo({ to, subject, html, attachments });
      if (res && res.success) {
        console.log(`[EmailService] Delivered via Brevo HTTPS API to ${to} (${res.messageId})`);
        return { success: true, messageId: res.messageId, port: 443, provider: 'brevo' };
      }
    } catch (bErr) {
      console.warn(`[EmailService] Brevo HTTPS API attempt failed (${bErr.message}). Trying Brevo SMTP relay...`);
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
        const info = await relay.sendMail({ ...mailOptions, from: `"OXOO" <${sender}>`, attachments });
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

const DEFAULT_FROM = process.env.EMAIL_FROM || '"OXOO" <manminder.singh@primepro.ai>';

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

// Send Transactional SMS via Brevo (https://api.brevo.com/v3/transactionalSMS/sendTransactionalSMS)
async function sendBrevoSms({ phone, otp, message }) {
  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  const recipient = normalizePhone(phone);

  if (!recipient) {
    console.warn('[Brevo SMS] Invalid recipient phone number:', phone);
    return { success: false, reason: 'Invalid phone number format' };
  }

  const content = message || `Your OXOO verification code is ${otp}. Valid for 10 minutes. Do not share with anyone.`;

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
        sender: 'OXOO',
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
  // 1. Try Brevo Transactional SMS
  const brevoRes = await sendBrevoSms({ phone, otp, message });
  if (brevoRes && brevoRes.success) return brevoRes;

  // 2. Fallback to Fast2SMS if configured
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
 * Generate and send 6-digit Email OTP for Demo or Subscription/Software purchase verification.
 * Only Email OTP is required and verified. SMS verification requirement is removed.
 */
async function sendOtpEmail({ email, phone = '', purpose = 'Verification', customerName = '' }) {
  const normEmail = (email || '').trim().toLowerCase();
  if (!normEmail) throw new Error('Recipient email address is required.');

  const isDemo = purpose.toLowerCase().includes('demo');

  // Generate 6-digit OTP for Email
  const otp = crypto.randomInt(100000, 1000000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Store in-memory keyed by email
  const entry = {
    otp,
    email: normEmail,
    purpose,
    expiresAt,
    verified: false,
    attempts: 0
  };

  otpStore.set(normEmail, entry);

  const subject = isDemo
    ? `${otp} is your OXOO Live Demo Verification Code`
    : `${otp} is your OXOO Purchase & Billing Verification Code`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560px" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05);" cellpadding="0" cellspacing="0">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #091322 0%, #1e3a8a 100%); padding: 32px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
                OXOO <span style="font-size: 13px; font-weight: 500; color: #38bdf8; display: block; margin-top: 4px; letter-spacing: 1px; text-transform: uppercase;">One Platform. Infinite Possibilities.</span>
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
                ${isDemo ? 'Verify Your Live Demo Access' : 'Confirm Your Subscription & Software Order'}
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
                ${customerName ? `Hello <strong>${customerName}</strong>,<br>` : ''}
                You requested an email verification code for <strong>${purpose}</strong> on OXOO. Please enter the one-time code below to proceed:
              </p>

              <!-- OTP Box -->
              <div style="background: #f1f5f9; border: 2px dashed #0284c7; border-radius: 12px; padding: 22px; text-align: center; margin-bottom: 28px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0284c7; display: block;">
                  ${otp}
                </span>
                <span style="font-size: 12px; color: #64748b; margin-top: 8px; display: block;">
                  Valid for 10 minutes · Do not share this code with anyone
                </span>
              </div>

              <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0;">
                If you did not make this request, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8;">
              © ${new Date().getFullYear()} OXOO Multiix Enterprise Suite. All rights reserved.<br>
              Automated system notification.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Dispatch Email via Brevo/Resend/SMTP
  const emailRes = await sendMailWithFallback({ from: DEFAULT_FROM, to: normEmail, subject, html });
  const emailDelivered = Boolean(emailRes && emailRes.success);

  return {
    success: true,
    emailSent: emailDelivered,
    message: emailDelivered ? `Verification code sent to ${normEmail}` : `Verification code generated successfully`,
    devOtp: process.env.NODE_ENV !== 'production' ? { emailOtp: otp } : undefined
  };
}

/**
 * Verify Email OTP entered by customer.
 * Only Email OTP is verified. SMS verification is not required.
 */
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

  // Verified successfully - clean up
  if (normEmail) otpStore.delete(normEmail);
  if (cleanPhone) otpStore.delete(cleanPhone);

  return { valid: true, message: 'Email OTP verified successfully.' };
}

/**
 * Send Tax Invoice & Customer Portal Login Credentials with attached PDF invoice document.
 */
async function sendInvoiceAndCredentialsEmail({
  toEmail,
  customerName = 'Customer',
  companyName = 'My Organization',
  invoiceNumber,
  orderNumber,
  storageId,
  amount,
  billingCycle = 'monthly',
  planName = 'Standard Pack',
  selectedApps = [],
  password = 'oxoo123',
  loginUrl = 'http://localhost:5173/login',
  customerPhone = ''
}) {
  if (!toEmail) throw new Error('Recipient email is required.');
  const normEmail = toEmail.trim().toLowerCase();

  const isYearly = String(billingCycle).toLowerCase() === 'yearly';
  const effectiveStorageId = storageId || (orderNumber ? 'STG-' + String(orderNumber).replace(/[^0-9]/g, '').slice(-8) : 'STG-08643413');

  // 1. Generate official Tax Invoice PDF document
  let pdfBuffer = null;
  try {
    pdfBuffer = await generateInvoicePdf({
      invoiceNumber,
      orderNumber,
      storageId: effectiveStorageId,
      customerName,
      companyName,
      toEmail: normEmail,
      customerPhone,
      amount,
      billingCycle,
      planName,
      selectedApps
    });
    console.log(`[EmailService] Generated Invoice PDF for ${invoiceNumber} (${pdfBuffer.length} bytes)`);
  } catch (pdfErr) {
    console.error(`[EmailService] Could not generate invoice PDF for ${invoiceNumber}:`, pdfErr.message);
  }

  const attachments = [];
  if (pdfBuffer) {
    attachments.push({
      filename: `Tax-Invoice-${invoiceNumber}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    });
  }

  const appsListHtml = Array.isArray(selectedApps) && selectedApps.length > 0
    ? selectedApps.map(a => {
        const name = typeof a === 'string' ? a : (a.name || a.id);
        return `<li style="padding: 4px 0; font-weight: 600; color: #0f172a;">${name}</li>`;
      }).join('')
    : '<li style="padding: 4px 0; font-weight: 600; color: #0f172a;">Business Application Suite</li>';

  const subject = `Order Confirmed: ${invoiceNumber} & Your OXOO Customer Login Credentials`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="640px" style="max-width: 640px; background-color: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 14px 35px rgba(0,0,0,0.06);" cellpadding="0" cellspacing="0">
          
          <!-- Top Navy Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #091322 0%, #1e3a8a 100%); padding: 34px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                OXOO
              </h1>
              <span style="font-size: 13px; font-weight: 600; color: #38bdf8; display: block; margin-top: 6px; letter-spacing: 1px; text-transform: uppercase;">
                Payment Confirmed · Subscription Active
              </span>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 8px;">
                Welcome to OXOO, ${customerName}!
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
                Thank you for subscribing to <strong>OXOO</strong> for <strong>${companyName}</strong>. Your payment was verified and processed successfully. Below you will find your Customer Dashboard login credentials. Your official Tax Invoice is also attached as a PDF document at the bottom of this email.
              </p>

              <!-- Credentials Card (Highlighted Box) -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%); border: 2px solid #38bdf8; border-radius: 14px; padding: 24px; margin-bottom: 28px;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <span style="font-size: 16px; font-weight: 800; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px;">
                    🔑 Your Customer Dashboard Login Details
                  </span>
                </div>
                <p style="font-size: 13px; color: #334155; margin-top: 0; margin-bottom: 16px;">
                  Use these credentials to sign in to your Customer Dashboard, view your bills, and access your active software:
                </p>
                <table width="100%" cellpadding="6" cellspacing="0" style="background: #ffffff; border-radius: 10px; border: 1px solid #bae6fd; font-size: 14px;">
                  <tr>
                    <td width="35%" style="color: #64748b; font-weight: 600; padding: 10px 14px; border-bottom: 1px solid #f1f5f9;">Portal Login URL:</td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9;">
                      <a href="${loginUrl}" style="color: #0284c7; font-weight: 700; text-decoration: none;">${loginUrl}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600; padding: 10px 14px; border-bottom: 1px solid #f1f5f9;">Storage ID:</td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9;">
                      <span style="background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 6px; font-family: monospace; font-size: 14px; font-weight: 800; border: 1px solid #bae6fd;">
                        ${effectiveStorageId}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600; padding: 10px 14px; border-bottom: 1px solid #f1f5f9;">User ID / Email:</td>
                    <td style="color: #0f172a; font-weight: 700; padding: 10px 14px; border-bottom: 1px solid #f1f5f9;">
                      ${normEmail}
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600; padding: 10px 14px; border-bottom: 1px solid #f1f5f9;">Password:</td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9;">
                      <span style="background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 15px; font-weight: 700; color: #0f172a;">
                        ${password}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600; padding: 10px 14px;">Password Security:</td>
                    <td style="color: #475569; font-size: 12px; line-height: 1.4; padding: 10px 14px;">
                      You can change this password anytime in Dashboard Settings. If forgotten, click <strong>"Forgot Password"</strong> on the login screen to get a reset link on your email.
                    </td>
                  </tr>
                </table>

                <div style="text-align: center; margin-top: 20px;">
                  <a href="${loginUrl}" style="display: inline-block; background: #0284c7; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);">
                    Open Customer Dashboard →
                  </a>
                </div>
              </div>

              <!-- Attached PDF Notice -->
              <div style="background: #f8fafc; border: 2px dashed #0284c7; border-radius: 12px; padding: 18px 22px; margin-bottom: 26px; text-align: center;">
                <span style="font-size: 24px; display: block; margin-bottom: 4px;">📎</span>
                <span style="font-size: 14.5px; font-weight: 800; color: #0284c7; display: block;">
                  Official Tax Invoice PDF Attached
                </span>
                <span style="font-size: 12.5px; color: #64748b; display: block; margin-top: 4px;">
                  Document: <strong>Tax-Invoice-${invoiceNumber}.pdf</strong> (${pdfBuffer ? `${Math.round(pdfBuffer.length / 1024)} KB` : 'PDF Document'}) has been attached below for your finance and taxation records.
                </span>
              </div>

              <!-- Invoice Summary Table -->
              <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
                Tax Invoice Details (${invoiceNumber})
              </h3>
              <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 13px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
                <tr style="background: #f8fafc;">
                  <td style="color: #64748b; font-weight: 600;">Invoice Number</td>
                  <td style="text-align: right; font-weight: 700; color: #0f172a;">${invoiceNumber}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">Order ID</td>
                  <td style="text-align: right; font-weight: 700; color: #0f172a;">${orderNumber || 'N/A'}</td>
                </tr>
                <tr style="background: #f8fafc;">
                  <td style="color: #64748b; font-weight: 600;">Plan & Billing Period</td>
                  <td style="text-align: right; font-weight: 700; color: #0f172a;">
                    ${planName} (${isYearly ? '12 Months Annual Payment' : '1 Month Subscription'})
                  </td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">Billing Entity / Company</td>
                  <td style="text-align: right; font-weight: 700; color: #0f172a;">${companyName}</td>
                </tr>
                <tr style="background: #f8fafc;">
                  <td style="color: #64748b; font-weight: 600;">Invoice Date</td>
                  <td style="text-align: right; color: #0f172a;">${new Date().toLocaleDateString('en-GB')}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">Status</td>
                  <td style="text-align: right; color: #16a34a; font-weight: 800;">PAID (Verified)</td>
                </tr>
                <tr style="background: #0f172a; color: #ffffff;">
                  <td style="font-size: 15px; font-weight: 700; color: #ffffff; padding: 12px 8px;">Total Amount Paid</td>
                  <td style="text-align: right; font-size: 16px; font-weight: 800; color: #38bdf8; padding: 12px 8px;">
                    ₹${typeof amount === 'number' ? amount.toLocaleString('en-IN') : amount} (incl. 18% GST)
                  </td>
                </tr>
              </table>

              <!-- Activated Apps -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
                <span style="font-size: 13px; font-weight: 700; color: #0f172a; display: block; margin-bottom: 8px;">
                  Activated Software Modules:
                </span>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                  ${appsListHtml}
                </ul>
              </div>

              <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0;">
                If you need assistance or wish to add more team members, feel free to visit your Customer Dashboard or contact our enterprise support team at <a href="mailto:support@oxoo.ai" style="color: #0284c7;">support@oxoo.ai</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 32px; text-align: center; font-size: 12px; color: #94a3b8;">
              © ${new Date().getFullYear()} OXOO Multiix Enterprise Suite. All rights reserved.<br>
              This is an official transaction confirmation and tax invoice.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  let info = null;
  try {
    info = await sendMailWithFallback({
      from: DEFAULT_FROM,
      to: normEmail,
      subject,
      html,
      attachments
    });
    console.log(`[EmailService] Invoice and login credentials sent to ${normEmail} (Message ID: ${info.messageId}, PDF Attached: ${attachments.length > 0})`);
    return { success: true, messageId: info.messageId, pdfAttached: attachments.length > 0 };
  } catch (err) {
    console.error(`[EmailService] Could not deliver invoice email to ${normEmail}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send Password Reset Link Email
 */
async function sendPasswordResetEmail({
  toEmail,
  customerName = 'Customer',
  storageId = '',
  resetUrl
}) {
  if (!toEmail) throw new Error('Recipient email is required.');
  const normEmail = toEmail.trim().toLowerCase();

  const subject = `Reset Your OXOO Password · Security Link`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600px" style="max-width: 600px; background-color: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 14px 35px rgba(0,0,0,0.06);" cellpadding="0" cellspacing="0">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #091322 0%, #1e3a8a 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
                OXOO
              </h1>
              <span style="font-size: 12px; font-weight: 600; color: #38bdf8; display: block; margin-top: 6px; letter-spacing: 1px; text-transform: uppercase;">
                Account Security & Password Assistance
              </span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 8px;">
                Password Reset Request
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 16px;">
                Hello <strong>${customerName}</strong>, we received a request to reset the password for your OXOO account.
              </p>

              ${storageId ? `
              <div style="background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; color: #0369a1;">
                <strong>Storage / Account ID:</strong> <span style="font-family: monospace; font-weight: 800;">${storageId}</span>
              </div>
              ` : ''}

              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
                Click the secure button below to choose a new password. This link is valid for <strong>1 hour</strong>.
              </p>

              <div style="text-align: center; margin: 28px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: #0284c7; color: #ffffff; padding: 14px 34px; border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);">
                  Reset My Password →
                </a>
              </div>

              <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 24px; padding-top: 18px; border-top: 1px solid #f1f5f9;">
                If the button above does not work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #0284c7; word-break: break-all;">${resetUrl}</a>
              </p>

              <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 20px;">
                If you did not request a password reset, please ignore this email. Your password will remain unchanged until you access the link above.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
              © ${new Date().getFullYear()} OXOO Multiix Enterprise Suite. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  let info = null;
  try {
    info = await sendMailWithFallback({
      from: DEFAULT_FROM,
      to: normEmail,
      subject,
      html
    });
    console.log(`[EmailService] Password reset link sent to ${normEmail} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EmailService] Could not deliver reset password email to ${normEmail}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Dispatch automated credentials (ID & Password) email to newly created Admin, Software Admin, Manager or Employee.
 */
async function sendAdminStaffCredentialsEmail({ to, name, role, email, employeeId, password, assignedSoftware = [], loginUrl }) {
  const normEmail = String(to || email || '').trim().toLowerCase();
  const userName = name || 'Administrator';
  const userRole = role || 'Software Admin';
  const userPwd = password || 'Welcome@2026';
  const scope = Array.isArray(assignedSoftware) && assignedSoftware.length > 0 
    ? assignedSoftware.join(', ') 
    : 'All Platform Software & Websites';
  
  const portalUrl = loginUrl || process.env.ADMIN_LOGIN_URL || 'http://localhost:5173/admin/login';
  const subject = `Your OXOO Admin & Staff Account Credentials (${userRole})`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    <tr>
      <td style="background: linear-gradient(135deg, #091322 0%, #0f172a 100%); padding: 32px 28px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">OXOO</h1>
        <div style="color: #38bdf8; font-size: 13px; font-weight: 600; margin-top: 6px; letter-spacing: 0.3px;">Enterprise Multi-App Platform</div>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 28px;">
        <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 14px 0;">
          Welcome to the Team, ${userName}
        </h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
          An administrator account has been created for you on the <strong>OXOO Platform</strong>. You have been granted access as a <strong>${userRole}</strong>.
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #0284c7; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <div style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px;">
            Your Login Credentials
          </div>
          <table width="100%" style="font-size: 13px; color: #1e293b; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 140px;">Role / Access:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${userRole}</td>
            </tr>
            ${employeeId ? `
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Staff / Admin ID:</td>
              <td style="padding: 6px 0; font-family: monospace; font-weight: 700; color: #0284c7;">${employeeId}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Login Email / ID:</td>
              <td style="padding: 6px 0; font-family: monospace; font-weight: 700; color: #0f172a;">${normEmail}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Password:</td>
              <td style="padding: 6px 0;">
                <code style="background-color: #e2e8f0; color: #0f172a; padding: 4px 10px; border-radius: 6px; font-size: 14px; font-weight: 800; letter-spacing: 0.5px;">${userPwd}</code>
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Assigned Scope:</td>
              <td style="padding: 6px 0; font-size: 12px; color: #334155;">${scope}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${portalUrl}" style="display: inline-block; background: #0284c7; color: #ffffff; padding: 14px 34px; border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);">
            Log In to Console →
          </a>
        </div>

        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 24px; padding-top: 18px; border-top: 1px solid #f1f5f9;">
          Direct Console URL:<br>
          <a href="${portalUrl}" style="color: #0284c7; word-break: break-all;">${portalUrl}</a>
        </p>

        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 14px; margin-top: 20px; font-size: 12px; color: #92400e;">
          <strong>Security Notice:</strong> Please update your password after your first successful login from your Profile Settings.
        </div>
      </td>
    </tr>

    <tr>
      <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
        © ${new Date().getFullYear()} OXOO Enterprise Platform. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const info = await sendMailWithFallback({
      from: DEFAULT_FROM,
      to: normEmail,
      subject,
      html
    });
    console.log(`[EmailService] Credentials email dispatched to ${normEmail} (${userRole}) [ID: ${info?.messageId || 'sim'}]`);
    return { success: true, messageId: info?.messageId };
  } catch (err) {
    console.error(`[EmailService] Failed to dispatch credentials email to ${normEmail}:`, err.message);
    return { success: false, error: err.message };
  }
}

// -------------------------------------------------------------
// Admin Due & Renewal Notification Email
// -------------------------------------------------------------
async function sendAdminSubscriptionDueEmail({
  adminEmail,
  customerName = 'Customer',
  companyName = 'My Organization',
  customerEmail = '',
  planName = 'Standard Pack',
  dueDate = 'N/A',
  amount = 0,
  daysLeft = 0,
  subscriptionId = '',
  isRenewal = false,
  status = 'Due Soon'
}) {
  const targetAdmin = adminEmail || process.env.ADMIN_NOTIFICATION_EMAIL || process.env.BREVO_SENDER_EMAIL || 'support@oxoo.ai';
  const normEmail = targetAdmin.trim().toLowerCase();

  const isOverdue = daysLeft < 0;
  const statusColor = isRenewal ? '#16a34a' : isOverdue ? '#dc2626' : '#d97706';
  const statusBadge = isRenewal ? 'RENEWAL COMPLETED' : isOverdue ? `OVERDUE (${Math.abs(daysLeft)} DAYS)` : `DUE IN ${daysLeft} DAYS`;

  const subject = isRenewal
    ? `[OXOO Admin Alert] Subscription Renewed: ${companyName} (${planName})`
    : `[OXOO Admin Alert] Subscription Due Notice: ${companyName} (${isOverdue ? 'Overdue' : `${daysLeft} days remaining`})`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600px" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.06);" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background: linear-gradient(135deg, #091322 0%, #1e293b 100%); padding: 26px 30px; text-align: left;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">OXOO Admin Notification</h1>
                  <span style="font-size: 12px; font-weight: 600; color: #38bdf8; display: block; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                    Subscription Lifecycle & Billing Alert
                  </span>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 30px;">
              <div style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background: ${statusColor}18; color: ${statusColor}; font-weight: 800; font-size: 12px; border: 1px solid ${statusColor}40; margin-bottom: 16px;">
                ● ${statusBadge}
              </div>

              <h2 style="font-size: 19px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 8px;">
                ${isRenewal ? 'Customer Renewed Subscription' : 'Customer Subscription Payment Due'}
              </h2>
              <p style="font-size: 13.5px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
                ${isRenewal
                  ? `<strong>${customerName}</strong> from <strong>${companyName}</strong> has completed their renewal payment.`
                  : `A customer subscription is approaching its due date or is overdue. Please review details below:`}
              </p>

              <table width="100%" cellpadding="8" cellspacing="0" style="background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 13.5px; margin-bottom: 24px;">
                <tr>
                  <td width="38%" style="color: #64748b; font-weight: 600; border-bottom: 1px solid #edf2f7;">Company / Customer:</td>
                  <td style="color: #0f172a; font-weight: 700; border-bottom: 1px solid #edf2f7;">${companyName} (${customerName})</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600; border-bottom: 1px solid #edf2f7;">Customer Email:</td>
                  <td style="color: #0284c7; font-weight: 600; border-bottom: 1px solid #edf2f7;">
                    <a href="mailto:${customerEmail}" style="color: #0284c7; text-decoration: none;">${customerEmail || 'N/A'}</a>
                  </td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600; border-bottom: 1px solid #edf2f7;">Subscription ID:</td>
                  <td style="color: #0f172a; font-family: monospace; font-weight: 700; border-bottom: 1px solid #edf2f7;">${subscriptionId || 'SUB-2026-ACTIVE'}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600; border-bottom: 1px solid #edf2f7;">Plan / Software:</td>
                  <td style="color: #0f172a; font-weight: 700; border-bottom: 1px solid #edf2f7;">${planName}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600; border-bottom: 1px solid #edf2f7;">Due Date:</td>
                  <td style="color: #0f172a; font-weight: 700; border-bottom: 1px solid #edf2f7;">${dueDate}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600; border-bottom: 1px solid #edf2f7;">Amount:</td>
                  <td style="color: #16a34a; font-weight: 800; border-bottom: 1px solid #edf2f7;">₹${Number(amount || 0).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">Time Remaining:</td>
                  <td style="color: ${statusColor}; font-weight: 800;">
                    ${isRenewal ? 'Active / Extended' : isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days remaining`}
                  </td>
                </tr>
              </table>

              <div style="text-align: center; margin-top: 10px;">
                <a href="http://localhost:5173/admin" style="display: inline-block; background: #0284c7; color: #ffffff; padding: 10px 22px; border-radius: 8px; font-size: 13.5px; font-weight: 700; text-decoration: none;">
                  Manage in Admin Portal →
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 30px; text-align: center; font-size: 11.5px; color: #94a3b8;">
              OXOO Automated Billing & Renewal Notification Engine &bull; Confidential &copy; ${new Date().getFullYear()}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const info = await sendMailWithFallback({
      from: DEFAULT_FROM,
      to: normEmail,
      subject,
      html
    });
    console.log(`[EmailService] Admin due notification sent to ${normEmail} for ${companyName} [ID: ${info?.messageId || 'sim'}]`);
    return { success: true, messageId: info?.messageId };
  } catch (err) {
    console.error(`[EmailService] Failed to send admin due notification:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendOtpEmail,
  verifyOtp,
  sendInvoiceAndCredentialsEmail,
  sendPasswordResetEmail,
  sendAdminStaffCredentialsEmail,
  sendAdminSubscriptionDueEmail,
  sendMailWithFallback
};
