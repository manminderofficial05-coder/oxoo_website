require('dotenv').config();
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// In-memory OTP storage: Map<normalizedEmail, { otp, expiresAt, verified, attempts }>
const otpStore = new Map();

// Helper to create transport
function getMailTransporter() {
  const user = process.env.EMAIL_USER || 'manminder.singh@primepro.ai';
  const pass = (process.env.EMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass }
  });
}

const DEFAULT_FROM = process.env.EMAIL_FROM || '"OXOO" <manminder.singh@primepro.ai>';

/**
 * Generate and send 6-digit OTP for Demo or Billing verification
 */
async function sendOtpEmail({ email, purpose = 'Verification', customerName = '' }) {
  if (!email) throw new Error('Recipient email is required.');
  const normEmail = email.trim().toLowerCase();

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(normEmail, {
    otp,
    expiresAt,
    verified: false,
    attempts: 0
  });

  console.log(`[OTP Generated] ${normEmail} => ${otp}`);

  const transporter = getMailTransporter();

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

  const info = await transporter.sendMail({
    from: DEFAULT_FROM,
    to: normEmail,
    subject,
    html
  });

  console.log(`[EmailService] OTP sent to ${normEmail} (Message ID: ${info.messageId})`);
  return { success: true, message: 'OTP sent successfully to ' + normEmail };
}

/**
 * Verify OTP entered by customer
 */
function verifyOtp({ email, otp }) {
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
    return { valid: false, message: `Incorrect code. Please check your email and try again.` };
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
  amount,
  billingCycle = 'monthly',
  planName = 'Standard Pack',
  selectedApps = [],
  password = 'oxoo123',
  loginUrl = 'http://localhost:5173/login'
}) {
  if (!toEmail) throw new Error('Recipient email is required.');
  const normEmail = toEmail.trim().toLowerCase();

  const transporter = getMailTransporter();
  const isYearly = String(billingCycle).toLowerCase() === 'yearly';

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
                  Use these credentials to sign in to your Customer Dashboard, view your bills, and access all your active software applications:
                </p>
                <table width="100%" cellpadding="6" cellspacing="0" style="background: #ffffff; border-radius: 10px; border: 1px solid #bae6fd; font-size: 14px;">
                  <tr>
                    <td width="35%" style="color: #64748b; font-weight: 600; padding: 10px 14px; border-bottom: 1px solid #f1f5f9;">Portal Login URL:</td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9;">
                      <a href="${loginUrl}" style="color: #0284c7; font-weight: 700; text-decoration: none;">${loginUrl}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600; padding: 10px 14px; border-bottom: 1px solid #f1f5f9;">User ID / Email:</td>
                    <td style="color: #0f172a; font-weight: 700; padding: 10px 14px; border-bottom: 1px solid #f1f5f9;">
                      ${normEmail}
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600; padding: 10px 14px;">Password:</td>
                    <td style="padding: 10px 14px;">
                      <span style="background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 15px; font-weight: 700; color: #0f172a;">
                        ${password}
                      </span>
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

  const info = await transporter.sendMail({
    from: DEFAULT_FROM,
    to: normEmail,
    subject,
    html
  });

  console.log(`[EmailService] Invoice and login credentials sent to ${normEmail} (Message ID: ${info.messageId})`);
  return { success: true, messageId: info.messageId };
}

module.exports = {
  sendOtpEmail,
  verifyOtp,
  sendInvoiceAndCredentialsEmail
};
