require('dotenv').config();
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// In-memory OTP storage: Map<normalizedEmail, { otp, expiresAt, verified, attempts }>
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
async function sendViaBrevo({ to, subject, html }) {
  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  if (!apiKey) return null;

  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || 'manminder.singh@primepro.ai';
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'accept': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'OXOO', email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html
    })
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

  // 2. Try Brevo HTTPS REST API (Port 443) or Brevo SMTP relay
  const brevoApiKey = (process.env.BREVO_API_KEY || '').trim();
  if (brevoApiKey) {
    try {
      const res = await sendViaBrevo({ to, subject, html });
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
        const info = await relay.sendMail({ ...mailOptions, from: `"OXOO" <${sender}>` });
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

  throw new Error('Email delivery failed: Brevo / Resend credentials failed to authenticate or are not configured.');
}

const DEFAULT_FROM = process.env.EMAIL_FROM || '"OXOO" <manminder.singh@primepro.ai>';

// Normalize an Indian mobile number to 10 digits (accepts +91 / 91 / 0 prefixes)
function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  const ten = digits.length > 10 ? digits.slice(-10) : digits;
  return /^[6-9]\d{9}$/.test(ten) ? ten : null;
}

// Send SMS OTP via Fast2SMS (HTTPS) - Graceful fallback if not configured
async function sendSmsOtp({ phone, otp }) {
  const apiKey = (process.env.FAST2SMS_API_KEY || '').trim();
  if (!apiKey) {
    return { success: false, skipped: true, reason: 'FAST2SMS_API_KEY not set' };
  }
  const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: { authorization: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ route: 'otp', variables_values: otp, numbers: phone, flash: 0 })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.return === false) {
    throw new Error(`SMS failed: ${data.message || res.status}`);
  }
  return { success: true };
}

/**
 * Generate and send 6-digit OTP for Demo or Billing verification.
 * If phone & FAST2SMS_API_KEY are configured, a separate SMS OTP is also sent.
 */
async function sendOtpEmail({ email, phone = '', purpose = 'Verification', customerName = '' }) {
  if (!email) throw new Error('Recipient email is required.');
  const normEmail = email.trim().toLowerCase();

  // Generate 6-digit OTP for Email
  const otp = crypto.randomInt(100000, 1000000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Feature toggle: Mobile SMS OTP is turned OFF by default (code is preserved below).
  // To enable mobile SMS OTP in the future, set ENABLE_SMS_OTP=true in your environment variables (.env).
  const ENABLE_SMS_OTP = process.env.ENABLE_SMS_OTP === 'true';
  const hasSmsConfig = ENABLE_SMS_OTP && !!(process.env.FAST2SMS_API_KEY || '').trim();
  const cleanPhone = (phone && hasSmsConfig) ? normalizePhone(phone) : null;
  let smsOtp = null;
  if (cleanPhone) {
    do { smsOtp = crypto.randomInt(100000, 1000000).toString(); } while (smsOtp === otp);
  }

  otpStore.set(normEmail, {
    otp,
    smsOtp,
    phone: cleanPhone,
    expiresAt,
    verified: false,
    attempts: 0
  });

  const isDemo = purpose.toLowerCase().includes('demo');
  const subject = isDemo
    ? `${otp} is your OXOO Live Demo Verification Code`
    : `${otp} is your OXOO Billing Verification Code`;

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
                ${isDemo ? 'Verify Your Live Demo Access' : 'Confirm Your Billing Details'}
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
                ${customerName ? `Hello <strong>${customerName}</strong>,<br>` : ''}
                You recently requested an email verification code for <strong>${purpose}</strong> on OXOO. Please enter the one-time code below to proceed:
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
                If you did not make this request, you can safely ignore this email. No changes will be made to your account.
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

  // Attempt Email delivery + Optional SMS delivery
  const [emailRes, smsRes] = await Promise.allSettled([
    sendMailWithFallback({ from: DEFAULT_FROM, to: normEmail, subject, html }),
    cleanPhone ? sendSmsOtp({ phone: cleanPhone, otp: smsOtp }) : Promise.resolve({ skipped: true })
  ]);

  if (emailRes.status === 'rejected') {
    otpStore.delete(normEmail);
    console.error(`[EmailService] Email OTP delivery failed to ${normEmail}:`, emailRes.reason?.message);
    return {
      success: false,
      message: `Could not send verification email to ${normEmail}: ${emailRes.reason?.message || 'Email delivery failed'}. Please configure Brevo or Resend in Render Dashboard.`
    };
  }

  let actualSmsSent = false;
  if (cleanPhone && smsRes.status === 'fulfilled' && smsRes.value?.success) {
    actualSmsSent = true;
  } else if (cleanPhone && smsRes.status === 'rejected') {
    console.warn(`[EmailService] SMS delivery failed (${smsRes.reason?.message}). Falling back to email verification only.`);
    const entry = otpStore.get(normEmail);
    if (entry) entry.smsOtp = null;
  }

  return {
    success: true,
    smsSent: actualSmsSent,
    message: actualSmsSent
      ? `Verification codes sent to ${normEmail} and +91 ${cleanPhone}`
      : `Verification code sent to ${normEmail}`
  };
}

/**
 * Verify OTP entered by customer
 */
function verifyOtp({ email, otp, smsOtp }) {
  if (!email || !otp) return { valid: false, message: 'Email and OTP code are required.' };
  const normEmail = email.trim().toLowerCase();
  const entry = otpStore.get(normEmail);

  if (!entry) {
    return { valid: false, message: 'No OTP code was requested for this email or it has expired.' };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normEmail);
    return { valid: false, message: 'This OTP has expired. Please request a new code.' };
  }

  if (entry.attempts >= 5) {
    otpStore.delete(normEmail);
    return { valid: false, message: 'Too many incorrect attempts. Please request a new code.' };
  }

  if (entry.otp !== String(otp).trim()) {
    entry.attempts += 1;
    return { valid: false, message: `Incorrect email code. Please check your email and try again.` };
  }

  // If SMS OTP was dispatched and user supplied an SMS OTP code, verify it
  if (entry.smsOtp && smsOtp) {
    if (entry.smsOtp !== String(smsOtp).trim()) {
      entry.attempts += 1;
      return { valid: false, message: 'Incorrect SMS code. Please check your mobile messages and try again.' };
    }
  }

  // Verified successfully
  entry.verified = true;
  return { valid: true, message: 'OTP successfully verified.' };
}

/**
 * Send Tax Invoice & Customer Portal Login Credentials
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
  loginUrl = 'http://localhost:5173/login'
}) {
  if (!toEmail) throw new Error('Recipient email is required.');
  const normEmail = toEmail.trim().toLowerCase();

  const isYearly = String(billingCycle).toLowerCase() === 'yearly';
  const effectiveStorageId = storageId || (orderNumber ? 'STG-' + String(orderNumber).replace(/[^0-9]/g, '').slice(-8) : 'STG-08643413');

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
                Thank you for subscribing to <strong>OXOO</strong> for <strong>${companyName}</strong>. Your payment was verified and processed successfully. Below you will find your official invoice receipt along with your Customer Dashboard login credentials.
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
      html
    });
    console.log(`[EmailService] Invoice and login credentials sent to ${normEmail} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
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

module.exports = {
  sendOtpEmail,
  verifyOtp,
  sendInvoiceAndCredentialsEmail,
  sendPasswordResetEmail
};
