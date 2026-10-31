const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { query } = require('./db');
const {
  sendProjectRequestNotificationEmail,
  sendConsultationRequestNotificationEmail,
  sendProjectStatusUpdateEmail
} = require('./emailService');

const publicProjectsRouter = express.Router();
const adminProjectsRouter = express.Router();

// Canonical categories and services catalogue
const PROJECT_SERVICE_CATALOG = [
  {
    id: 'websites-apps',
    title: 'Websites & Apps',
    services: [
      'AI Website Builder',
      'Android & iOS Apps',
      'eCommerce Websites',
      '3D Websites',
      'AI Chatbots',
      'Web Apps & Other'
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing',
    services: [
      'Social Marketing',
      'Email Marketing',
      'SMS Marketing',
      'Marketing Automation',
      'WhatsApp Marketing',
      'Surveys'
    ]
  },
  {
    id: 'whatsapp-chat-ai',
    title: 'WhatsApp Chat AI',
    services: [
      'WhatsApp AI Inbox',
      'WhatsApp Marketing & Broadcasts',
      'WhatsApp Flow Builder',
      'WhatsApp Commerce',
      'WhatsApp Booking & Reminders',
      'WhatsApp Integrations & Settings'
    ]
  }
];

const VALID_PROJECT_STATUSES = [
  'New',
  'Under Review',
  'Contacted',
  'Requirements Pending',
  'Proposal in Progress',
  'Proposal Sent',
  'Approved',
  'In Progress',
  'Completed',
  'Rejected',
  'Archived'
];

const VALID_CONSULTATION_STATUSES = [
  'New',
  'Contact Pending',
  'Contacted',
  'Appointment Requested',
  'Appointment Confirmed',
  'Completed',
  'Cancelled'
];

const DEFAULT_CONSULTATION_SLOTS = [
  '10:00 AM – 10:30 AM IST',
  '11:00 AM – 11:30 AM IST',
  '12:00 PM – 12:30 PM IST',
  '02:30 PM – 03:00 PM IST',
  '04:00 PM – 04:30 PM IST',
  '05:30 PM – 06:00 PM IST'
];

const ALLOWED_ATTACHMENT_MIMES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]);

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // 5 MB per file
const MAX_ATTACHMENTS_COUNT = 5;

function sanitizeText(val, maxLen = 500) {
  if (typeof val !== 'string') return '';
  return val
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLen);
}

function deriveCategoriesFromServices(serviceNames = []) {
  const catSet = new Set();
  const normalizedList = Array.isArray(serviceNames)
    ? serviceNames.map(s => String(s || '').trim().toLowerCase()).filter(Boolean)
    : [];

  for (const cat of PROJECT_SERVICE_CATALOG) {
    for (const svc of cat.services) {
      if (normalizedList.includes(svc.toLowerCase())) {
        catSet.add(cat.title);
      }
    }
  }
  return Array.from(catSet);
}

function normalizeSelectedServices(rawServices) {
  if (!Array.isArray(rawServices)) return [];
  const validServices = [];
  const seen = new Set();

  for (const item of rawServices) {
    const clean = sanitizeText(typeof item === 'string' ? item : item?.name || '', 120);
    if (!clean) continue;
    // Match against canonical catalogue (case-insensitive) or keep sanitized string
    let canonical = clean;
    for (const cat of PROJECT_SERVICE_CATALOG) {
      const found = cat.services.find(s => s.toLowerCase() === clean.toLowerCase());
      if (found) {
        canonical = found;
        break;
      }
    }
    const key = canonical.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      validServices.push(canonical);
    }
  }
  return validServices;
}

async function logProjectAudit(action, target, actor = 'system', ip = '127.0.0.1', details = {}) {
  try {
    await query(
      `INSERT INTO audit_logs (action, target, user_name, ip, details) VALUES ($1, $2, $3, $4, $5)`,
      [action, target, actor, ip, JSON.stringify(details)]
    );
  } catch (e) {
    // Non-blocking audit log
  }
}

const projectSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1',
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many project requests from this IP address. Please wait a few minutes and try again.'
  }
});

// ============================================================================
// PUBLIC ROUTES (/api/projects)
// ============================================================================

// 1. GET /api/projects/catalog
publicProjectsRouter.get('/catalog', (_req, res) => {
  res.json({
    success: true,
    categories: PROJECT_SERVICE_CATALOG,
    consultationSlots: DEFAULT_CONSULTATION_SLOTS
  });
});

// 2. GET /api/projects/consultation-slots?date=YYYY-MM-DD
publicProjectsRouter.get('/consultation-slots', async (req, res) => {
  try {
    const dateStr = sanitizeText(req.query.date || '', 20);
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.json({
        success: true,
        date: dateStr,
        slots: DEFAULT_CONSULTATION_SLOTS.map(slot => ({ slot, time: slot, available: true }))
      });
    }

    const bookedRes = await query(
      `SELECT preferred_time, confirmed_time, status
       FROM consultation_requests
       WHERE status NOT IN ('Cancelled')
         AND (preferred_date = $1 OR confirmed_date = $1)`,
      [dateStr]
    );

    const takenTimes = new Set();
    for (const row of bookedRes.rows) {
      if (row.confirmed_time) takenTimes.add(String(row.confirmed_time).trim());
      if (row.preferred_time) takenTimes.add(String(row.preferred_time).trim());
    }

    const slots = DEFAULT_CONSULTATION_SLOTS.map(slot => ({
      slot,
      time: slot,
      available: !takenTimes.has(slot)
    }));

    return res.json({
      success: true,
      date: dateStr,
      slots
    });
  } catch (err) {
    return res.json({
      success: true,
      date: req.query.date || '',
      slots: DEFAULT_CONSULTATION_SLOTS.map(slot => ({ slot, time: slot, available: true }))
    });
  }
});

// 3. POST /api/projects/requests — Submit a Full Project Request
publicProjectsRouter.post('/requests', projectSubmissionLimiter, async (req, res) => {
  try {
    const b = req.body || {};

    // Honeypot anti-spam check
    if (b.website_hp || b.honeypot) {
      return res.status(400).json({ success: false, message: 'Spam check failed.' });
    }

    const customerName = sanitizeText(b.customerName || b.fullName || b.name || '', 140);
    const businessEmail = sanitizeText(b.businessEmail || b.email || '', 160).toLowerCase();
    const phoneNumber = sanitizeText(b.phoneNumber || b.phone || '', 60);
    const companyName = sanitizeText(b.companyName || b.company || 'Individual / Personal', 160);
    const companyWebsite = sanitizeText(b.companyWebsite || b.website || '', 250);
    const country = sanitizeText(b.country || '', 100);
    const industry = sanitizeText(b.industry || '', 120);
    const companySize = sanitizeText(b.companySize || '', 80);

    const selectedServices = normalizeSelectedServices(b.selectedServices || []);
    const selectedCategories = deriveCategoriesFromServices(selectedServices);

    const projectTitle = sanitizeText(b.projectTitle || '', 220);
    const projectDescription = sanitizeText(b.projectDescription || '', 5000);
    const businessProblem = sanitizeText(b.businessProblem || '', 3000);
    const requiredFeatures = sanitizeText(b.requiredFeatures || '', 3000);
    const targetAudience = sanitizeText(b.targetAudience || '', 1500);
    const preferredTechnology = sanitizeText(b.preferredTechnology || '', 250);
    const existingUrl = sanitizeText(b.existingUrl || '', 400);
    const referenceWebsites = sanitizeText(b.referenceWebsites || '', 2000);
    const designPreferences = sanitizeText(b.designPreferences || '', 2000);
    const expectedDeliverables = sanitizeText(b.expectedDeliverables || '', 2000);
    const preferredStartDate = sanitizeText(b.preferredStartDate || '', 60);
    const expectedCompletionDate = sanitizeText(b.expectedCompletionDate || '', 60);
    const budgetRange = sanitizeText(b.budgetRange || '', 120);
    const additionalRequirements = sanitizeText(b.additionalRequirements || '', 3000);
    const consentAccepted =
      b.consentAccepted === true ||
      b.consentAccepted === 'true' ||
      b.consent === true ||
      b.privacyConsent === true ||
      b.privacyConsent === 'true';

    // Field validation
    if (!customerName || customerName.length < 2) {
      return res.status(400).json({
        success: false,
        field: 'customerName',
        message: 'Full Name is required (minimum 2 characters).'
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!businessEmail || !emailRegex.test(businessEmail)) {
      return res.status(400).json({
        success: false,
        field: 'businessEmail',
        message: 'Please enter a valid email address.'
      });
    }

    const phoneDigits = phoneNumber.replace(/\D/g, '');
    if (!phoneNumber || phoneDigits.length !== 10) {
      return res.status(400).json({
        success: false,
        field: 'phoneNumber',
        message: 'Please enter a valid 10-digit mobile number.'
      });
    }

    if (!country || country.length < 2) {
      return res.status(400).json({
        success: false,
        field: 'country',
        message: 'Country is required.'
      });
    }

    if (selectedServices.length === 0) {
      return res.status(400).json({
        success: false,
        field: 'selectedServices',
        message: 'Please select at least one service for your project.'
      });
    }

    if (!projectTitle || projectTitle.length < 3) {
      return res.status(400).json({
        success: false,
        field: 'projectTitle',
        message: 'Project Title is required (minimum 3 characters).'
      });
    }

    if (!projectDescription || projectDescription.length < 10) {
      return res.status(400).json({
        success: false,
        field: 'projectDescription',
        message: 'Project Description is required (please describe your project in at least 10 characters).'
      });
    }

    if (!consentAccepted) {
      return res.status(400).json({
        success: false,
        field: 'consentAccepted',
        message: 'Please accept the privacy notice and consent to submit your project request.'
      });
    }

    // Validate optional URLs
    const urlFields = [
      { key: 'companyWebsite', val: companyWebsite, label: 'Company Website' },
      { key: 'existingUrl', val: existingUrl, label: 'Existing Website or Application URL' }
    ];
    for (const u of urlFields) {
      if (u.val) {
        const lower = u.val.toLowerCase();
        if (lower.startsWith('javascript:') || lower.startsWith('data:')) {
          return res.status(400).json({
            success: false,
            field: u.key,
            message: `Invalid ${u.label}.`
          });
        }
      }
    }

    // Validate attachments
    const rawAttachments = Array.isArray(b.attachments) ? b.attachments : [];
    if (rawAttachments.length > MAX_ATTACHMENTS_COUNT) {
      return res.status(400).json({
        success: false,
        field: 'attachments',
        message: `You can upload a maximum of ${MAX_ATTACHMENTS_COUNT} reference files.`
      });
    }

    const validatedAttachments = [];
    for (const att of rawAttachments) {
      const rawBase64 = att?.contentBase64 || att?.fileDataBase64;
      if (!att || !att.fileName || !rawBase64) continue;
      const cleanFileName = String(att.fileName)
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .slice(0, 180);
      const mimeType = String(att.mimeType || 'application/octet-stream').toLowerCase().trim();

      if (!ALLOWED_ATTACHMENT_MIMES.has(mimeType)) {
        return res.status(400).json({
          success: false,
          field: 'attachments',
          message: `File "${cleanFileName}" has an unsupported format (${mimeType}). Allowed: PDF, PNG, JPG, WEBP, DOC, DOCX, TXT.`
        });
      }

      let base64Payload = String(rawBase64).trim();
      if (base64Payload.includes(',')) {
        base64Payload = base64Payload.split(',')[1];
      }
      const byteLength = Buffer.byteLength(base64Payload, 'base64');
      if (byteLength > MAX_ATTACHMENT_BYTES) {
        return res.status(400).json({
          success: false,
          field: 'attachments',
          message: `File "${cleanFileName}" exceeds the 5 MB maximum size limit.`
        });
      }

      validatedAttachments.push({
        attachmentId: `PATT-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
        fileName: cleanFileName,
        mimeType,
        sizeBytes: byteLength,
        contentBase64: base64Payload,
        uploadedAt: new Date().toISOString()
      });
    }

    // Duplicate submission protection within 2 minutes
    const dupCheck = await query(
      `SELECT request_id FROM project_requests
       WHERE LOWER(business_email) = $1
         AND LOWER(project_title) = $2
         AND submission_date > NOW() - INTERVAL '2 minutes'
       LIMIT 1`,
      [businessEmail, projectTitle.toLowerCase()]
    );
    if (dupCheck.rows.length > 0) {
      return res.status(429).json({
        success: false,
        code: 'DUPLICATE_PROJECT_REQUEST',
        requestId: dupCheck.rows[0].request_id,
        message: `Your project request (${dupCheck.rows[0].request_id}) was just received. Please wait a moment before submitting again.`
      });
    }

    // Generate unique Project Request ID: PRJ-2026-XXXXXX
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const requestId = `PRJ-2026-${randomSuffix}`;

    const attachmentsMeta = validatedAttachments.map(a => ({
      attachmentId: a.attachmentId,
      fileName: a.fileName,
      mimeType: a.mimeType,
      sizeBytes: a.sizeBytes,
      uploadedAt: a.uploadedAt
    }));

    const initialStatusHistory = [
      {
        fromStatus: null,
        toStatus: 'New',
        changedBy: customerName,
        note: 'Project request submitted via OXOO.ai Projects Hub',
        changedAt: new Date().toISOString()
      }
    ];

    const insertRes = await query(
      `INSERT INTO project_requests (
        request_id, customer_name, business_email, phone_number, company_name, company_website,
        country, industry, company_size, selected_categories, selected_services,
        project_title, project_description, business_problem, required_features,
        target_audience, preferred_technology, existing_url, reference_websites,
        design_preferences, expected_deliverables, preferred_start_date, expected_completion_date,
        budget_range, additional_requirements, attachments_meta, consent_accepted,
        assigned_team_member, status, internal_notes, status_history,
        notification_delivered, source_ip, submission_date, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14, $15,
        $16, $17, $18, $19,
        $20, $21, $22, $23,
        $24, $25, $26, $27,
        'Unassigned', 'New', '[]'::jsonb, $28,
        false, $29, NOW(), NOW(), NOW()
      ) RETURNING *`,
      [
        requestId,
        customerName,
        businessEmail,
        phoneNumber,
        companyName,
        companyWebsite,
        country,
        industry,
        companySize,
        JSON.stringify(selectedCategories),
        JSON.stringify(selectedServices),
        projectTitle,
        projectDescription,
        businessProblem,
        requiredFeatures,
        targetAudience,
        preferredTechnology,
        existingUrl,
        referenceWebsites,
        designPreferences,
        expectedDeliverables,
        preferredStartDate,
        expectedCompletionDate,
        budgetRange,
        additionalRequirements,
        JSON.stringify(attachmentsMeta),
        true,
        JSON.stringify(initialStatusHistory),
        req.ip || ''
      ]
    );

    // Store attachments in project_attachments table
    for (const att of validatedAttachments) {
      await query(
        `INSERT INTO project_attachments (
          attachment_id, project_request_id, file_name, mime_type, size_bytes, content_base64, uploaded_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          att.attachmentId,
          requestId,
          att.fileName,
          att.mimeType,
          att.sizeBytes,
          att.contentBase64,
          businessEmail
        ]
      );
    }

    // Trigger notification email
    const notifyResult = await sendProjectRequestNotificationEmail({
      requestId,
      customerName,
      businessEmail,
      phoneNumber,
      companyName,
      country,
      selectedCategories,
      selectedServices,
      projectTitle,
      projectDescription,
      budgetRange,
      preferredStartDate,
      expectedCompletionDate
    });

    const notificationDelivered = Boolean(notifyResult?.delivered);
    if (notificationDelivered) {
      await query(
        `UPDATE project_requests SET notification_delivered = true WHERE request_id = $1`,
        [requestId]
      );
    }

    await logProjectAudit('Project Request Submitted', requestId, `${customerName} (${businessEmail})`, req.ip, {
      companyName,
      projectTitle,
      selectedCategories,
      selectedServices,
      attachmentsCount: attachmentsMeta.length
    });

    const saved = insertRes.rows[0];
    return res.status(201).json({
      success: true,
      requestId,
      status: saved.status,
      submissionDate: saved.submission_date,
      notificationDelivered,
      message: `Your project request (${requestId}) has been submitted. Our solutions architects will review your requirements and reach out shortly.`,
      request: {
        requestId: saved.request_id,
        customerName: saved.customer_name,
        businessEmail: saved.business_email,
        phoneNumber: saved.phone_number,
        companyName: saved.company_name,
        country: saved.country,
        selectedCategories,
        selectedServices,
        projectTitle: saved.project_title,
        budgetRange: saved.budget_range,
        preferredStartDate: saved.preferred_start_date,
        expectedCompletionDate: saved.expected_completion_date,
        attachmentsCount: attachmentsMeta.length,
        status: saved.status,
        submissionDate: saved.submission_date
      }
    });
  } catch (err) {
    console.error('[ProjectsRouter] Error saving project request:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while saving your project request. Please try again.'
    });
  }
});

// 4. POST /api/projects/consultations — Submit a Consultation Call Request
publicProjectsRouter.post('/consultations', projectSubmissionLimiter, async (req, res) => {
  try {
    const b = req.body || {};

    if (b.website_hp || b.honeypot) {
      return res.status(400).json({ success: false, message: 'Spam check failed.' });
    }

    const customerName = sanitizeText(b.customerName || b.fullName || b.name || '', 140);
    const businessEmail = sanitizeText(b.businessEmail || b.email || '', 160).toLowerCase();
    const phoneNumber = sanitizeText(b.phoneNumber || b.phone || '', 60);
    const companyName = sanitizeText(b.companyName || b.company || 'Individual / Personal', 160);
    const country = sanitizeText(b.country || '', 100);
    const preferredContactMethod = sanitizeText(
      b.preferredContactMethod || 'Video Consultation (Google Meet / Zoom)',
      100
    );
    const preferredDate = sanitizeText(b.preferredDate || '', 30);
    const preferredTime = sanitizeText(b.preferredTime || '', 60);
    const selectedServices = normalizeSelectedServices(b.selectedServices || []);
    const selectedCategories = deriveCategoriesFromServices(selectedServices);
    const projectSummary = sanitizeText(b.projectSummary || b.summary || '', 3000);
    const linkedProjectRequestId = sanitizeText(b.linkedProjectRequestId || '', 40) || null;

    if (!customerName || customerName.length < 2) {
      return res.status(400).json({
        success: false,
        field: 'customerName',
        message: 'Full Name is required.'
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!businessEmail || !emailRegex.test(businessEmail)) {
      return res.status(400).json({
        success: false,
        field: 'businessEmail',
        message: 'Please enter a valid email address.'
      });
    }

    const phoneDigits = phoneNumber.replace(/\D/g, '');
    if (!phoneNumber || phoneDigits.length !== 10) {
      return res.status(400).json({
        success: false,
        field: 'phoneNumber',
        message: 'Please enter a valid 10-digit mobile number.'
      });
    }

    if (!country || country.length < 2) {
      return res.status(400).json({
        success: false,
        field: 'country',
        message: 'Country is required.'
      });
    }

    if (!projectSummary || projectSummary.length < 5) {
      return res.status(400).json({
        success: false,
        field: 'projectSummary',
        message: 'Please provide a brief project summary (minimum 5 characters).'
      });
    }

    // If preferredDate is provided, validate date format & check slot conflict
    if (preferredDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
        return res.status(400).json({
          success: false,
          field: 'preferredDate',
          message: 'Preferred Date must be in YYYY-MM-DD format.'
        });
      }
      const todayIso = new Date().toISOString().slice(0, 10);
      if (preferredDate < todayIso) {
        return res.status(400).json({
          success: false,
          field: 'preferredDate',
          message: 'Preferred Date cannot be in the past.'
        });
      }

      if (preferredTime) {
        const conflictRes = await query(
          `SELECT request_id FROM consultation_requests
           WHERE status NOT IN ('Cancelled')
             AND (
               (preferred_date = $1 AND preferred_time = $2)
               OR (confirmed_date = $1 AND confirmed_time = $2)
             )
           LIMIT 1`,
          [preferredDate, preferredTime]
        );
        if (conflictRes.rows.length > 0) {
          return res.status(409).json({
            success: false,
            code: 'SLOT_UNAVAILABLE',
            field: 'preferredTime',
            message: `The requested time slot (${preferredDate} at ${preferredTime}) is already reserved. Please select another time slot.`
          });
        }
      }
    }

    // Duplicate check within 2 minutes
    const dupCheck = await query(
      `SELECT request_id FROM consultation_requests
       WHERE LOWER(business_email) = $1
         AND submission_date > NOW() - INTERVAL '2 minutes'
       LIMIT 1`,
      [businessEmail]
    );
    if (dupCheck.rows.length > 0) {
      return res.status(429).json({
        success: false,
        code: 'DUPLICATE_CONSULTATION_REQUEST',
        requestId: dupCheck.rows[0].request_id,
        message: `Your consultation request (${dupCheck.rows[0].request_id}) was just received. Please wait a moment before submitting again.`
      });
    }

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const requestId = `CNS-2026-${randomSuffix}`;
    const initialStatus = preferredDate ? 'Appointment Requested' : 'New';

    const initialAppointmentHistory = [
      {
        action: preferredDate ? 'Appointment Slot Requested' : 'Consultation Requested',
        date: preferredDate || 'Flexible',
        time: preferredTime || 'Flexible',
        actor: customerName,
        note: `Preferred contact method: ${preferredContactMethod}. Pending confirmation by OXOO.ai team.`,
        timestamp: new Date().toISOString()
      }
    ];

    const insertRes = await query(
      `INSERT INTO consultation_requests (
        request_id, linked_project_request_id, customer_name, business_email, phone_number,
        company_name, country, preferred_contact_method, preferred_date, preferred_time,
        selected_categories, selected_services, project_summary, assigned_team_member,
        status, internal_notes, appointment_history, notification_delivered, source_ip,
        submission_date, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, 'Unassigned',
        $14, '[]'::jsonb, $15, false, $16,
        NOW(), NOW(), NOW()
      ) RETURNING *`,
      [
        requestId,
        linkedProjectRequestId,
        customerName,
        businessEmail,
        phoneNumber,
        companyName,
        country,
        preferredContactMethod,
        preferredDate,
        preferredTime,
        JSON.stringify(selectedCategories),
        JSON.stringify(selectedServices),
        projectSummary,
        initialStatus,
        JSON.stringify(initialAppointmentHistory),
        req.ip || ''
      ]
    );

    const notifyResult = await sendConsultationRequestNotificationEmail({
      requestId,
      customerName,
      businessEmail,
      phoneNumber,
      companyName,
      country,
      preferredContactMethod,
      preferredDate,
      preferredTime,
      selectedServices,
      projectSummary
    });

    const notificationDelivered = Boolean(notifyResult?.delivered);
    if (notificationDelivered) {
      await query(
        `UPDATE consultation_requests SET notification_delivered = true WHERE request_id = $1`,
        [requestId]
      );
    }

    await logProjectAudit('Consultation Call Requested', requestId, `${customerName} (${businessEmail})`, req.ip, {
      companyName,
      preferredDate,
      preferredTime,
      selectedServices
    });

    const saved = insertRes.rows[0];
    return res.status(201).json({
      success: true,
      requestId,
      status: saved.status,
      appointmentConfirmed: false,
      notificationDelivered,
      message: preferredDate
        ? `Your consultation request (${requestId}) for ${preferredDate} ${preferredTime || ''} has been received and is pending confirmation by our team.`
        : `Your consultation request (${requestId}) has been received. A specialist will contact you shortly to schedule your call.`,
      consultation: {
        requestId: saved.request_id,
        customerName: saved.customer_name,
        businessEmail: saved.business_email,
        phoneNumber: saved.phone_number,
        companyName: saved.company_name,
        country: saved.country,
        preferredContactMethod: saved.preferred_contact_method,
        preferredDate: saved.preferred_date,
        preferredTime: saved.preferred_time,
        selectedCategories,
        selectedServices,
        projectSummary: saved.project_summary,
        status: saved.status,
        submissionDate: saved.submission_date
      }
    });
  } catch (err) {
    console.error('[ProjectsRouter] Error saving consultation request:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while submitting your consultation request. Please try again.'
    });
  }
});

// ============================================================================
// ADMIN ROUTES (/api/admin/projects — Protected by requireAdminAuth)
// ============================================================================

// 1. GET /api/admin/projects/summary — Real-time KPI summary cards & filter metadata
adminProjectsRouter.get('/summary', async (_req, res, next) => {
  try {
    const [projStats, consStats, staffRes] = await Promise.all([
      query(`
        SELECT
          COUNT(*) FILTER (WHERE status != 'Archived')::int AS total_requests,
          COUNT(*) FILTER (WHERE status = 'New')::int AS new_requests,
          COUNT(*) FILTER (WHERE status IN ('Under Review', 'Contacted', 'Requirements Pending', 'Proposal in Progress'))::int AS under_review,
          COUNT(*) FILTER (WHERE status = 'Proposal Sent')::int AS proposals_sent,
          COUNT(*) FILTER (WHERE status = 'Approved' OR status = 'In Progress')::int AS active_projects,
          COUNT(*) FILTER (WHERE status = 'Completed')::int AS completed_projects
        FROM project_requests
      `),
      query(`
        SELECT
          COUNT(*) FILTER (WHERE status != 'Cancelled')::int AS total_consultations,
          COUNT(*) FILTER (WHERE status = 'Appointment Confirmed')::int AS confirmed_consultations,
          COUNT(*) FILTER (WHERE status IN ('New', 'Contact Pending', 'Appointment Requested'))::int AS pending_consultations
        FROM consultation_requests
      `),
      query(`
        SELECT name, email, role FROM platform_staff WHERE status = 'Active'
        ORDER BY id ASC
      `).catch(() => ({ rows: [] }))
    ]);

    const p = projStats.rows[0] || {};
    const c = consStats.rows[0] || {};

    const defaultStaff = [
      { name: 'Manminder Singh', role: 'Super Admin' },
      { name: 'Aarav Verma (Solutions Architect)', role: 'Software Admin' },
      { name: 'Neha Kapoor (Enterprise Delivery)', role: 'Manager' },
      { name: 'Rohan Desai (Growth & Marketing)', role: 'Manager' },
      { name: 'Priya Nair (WhatsApp & AI Lead)', role: 'Manager' }
    ];

    const staffSet = new Map();
    for (const s of [...(staffRes.rows || []), ...defaultStaff]) {
      if (s && s.name && !staffSet.has(s.name)) {
        staffSet.set(s.name, { name: s.name, role: s.role || 'Specialist' });
      }
    }

    const summaryPayload = {
      totalProjectRequests: p.total_requests || 0,
      newRequests: p.new_requests || 0,
      underReview: p.under_review || 0,
      proposalsSent: p.proposals_sent || 0,
      activeProjects: p.active_projects || 0,
      completedProjects: p.completed_projects || 0,
      consultationRequests: c.total_consultations || 0,
      confirmedConsultations: c.confirmed_consultations || 0,
      pendingConsultations: c.pending_consultations || 0
    };

    res.json({
      success: true,
      ...summaryPayload,
      summary: summaryPayload,
      staffMembers: Array.from(staffSet.values()),
      projectStatuses: VALID_PROJECT_STATUSES,
      consultationStatuses: VALID_CONSULTATION_STATUSES,
      categories: PROJECT_SERVICE_CATALOG
    });
  } catch (err) {
    next(err);
  }
});

// 2. GET /api/admin/projects/requests — Filtered, Sorted, Paginated Project Requests
adminProjectsRouter.get('/requests', async (req, res, next) => {
  try {
    const {
      search = '',
      category = '',
      service = '',
      status = '',
      assignedTo = '',
      dateFrom = '',
      dateTo = '',
      sort = 'newest',
      page = 1,
      limit = 15
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 15));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      const idx = params.length;
      conditions.push(`(
        request_id ILIKE $${idx} OR
        customer_name ILIKE $${idx} OR
        company_name ILIKE $${idx} OR
        business_email ILIKE $${idx} OR
        phone_number ILIKE $${idx} OR
        project_title ILIKE $${idx}
      )`);
    }

    if (category && category !== 'All' && category !== 'All Categories') {
      params.push(`%${category.trim()}%`);
      conditions.push(`selected_categories::text ILIKE $${params.length}`);
    }

    if (service && service !== 'All' && service !== 'All Services') {
      params.push(`%${service.trim()}%`);
      conditions.push(`selected_services::text ILIKE $${params.length}`);
    }

    if (status && status !== 'All' && status !== 'All Statuses') {
      params.push(status.trim());
      conditions.push(`status = $${params.length}`);
    }

    if (assignedTo && assignedTo !== 'All' && assignedTo !== 'All Team Members') {
      params.push(assignedTo.trim());
      conditions.push(`assigned_team_member = $${params.length}`);
    }

    if (dateFrom && /^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
      params.push(dateFrom);
      conditions.push(`submission_date >= $${params.length}::date`);
    }

    if (dateTo && /^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
      params.push(dateTo);
      conditions.push(`submission_date < ($${params.length}::date + INTERVAL '1 day')`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'submission_date DESC, id DESC';
    if (sort === 'oldest') orderBy = 'submission_date ASC, id ASC';
    else if (sort === 'updated') orderBy = 'updated_at DESC, id DESC';

    const countRes = await query(
      `SELECT COUNT(*)::int AS total FROM project_requests ${whereClause}`,
      params
    );
    const total = countRes.rows[0]?.total || 0;

    const listRes = await query(
      `SELECT * FROM project_requests
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limitNum, offset]
    );

    res.json({
      success: true,
      requests: listRes.rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.max(1, Math.ceil(total / limitNum))
      }
    });
  } catch (err) {
    next(err);
  }
});

// 3. GET /api/admin/projects/requests/export/csv — Export Project Requests to CSV
adminProjectsRouter.get('/requests/export/csv', async (req, res, next) => {
  try {
    const { status = '', category = '', service = '', search = '' } = req.query;
    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      const idx = params.length;
      conditions.push(`(request_id ILIKE $${idx} OR customer_name ILIKE $${idx} OR company_name ILIKE $${idx} OR business_email ILIKE $${idx} OR project_title ILIKE $${idx})`);
    }
    if (status && status !== 'All' && status !== 'All Statuses') {
      params.push(status.trim());
      conditions.push(`status = $${params.length}`);
    }
    if (category && category !== 'All' && category !== 'All Categories') {
      params.push(`%${category.trim()}%`);
      conditions.push(`selected_categories::text ILIKE $${params.length}`);
    }
    if (service && service !== 'All' && service !== 'All Services') {
      params.push(`%${service.trim()}%`);
      conditions.push(`selected_services::text ILIKE $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rowsRes = await query(
      `SELECT * FROM project_requests ${whereClause} ORDER BY submission_date DESC LIMIT 2000`,
      params
    );

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = [
      'Project Request ID',
      'Customer Name',
      'Company Name',
      'Business Email',
      'Phone Number',
      'Country',
      'Industry',
      'Company Size',
      'Selected Categories',
      'Selected Services',
      'Project Title',
      'Project Description',
      'Budget Range',
      'Preferred Start Date',
      'Expected Completion Date',
      'Assigned Team Member',
      'Status',
      'Submission Date',
      'Last Updated'
    ];

    const lines = [headers.map(escapeCsv).join(',')];
    for (const r of rowsRes.rows) {
      const cats = Array.isArray(r.selected_categories) ? r.selected_categories.join('; ') : '';
      const svcs = Array.isArray(r.selected_services) ? r.selected_services.join('; ') : '';
      lines.push(
        [
          r.request_id,
          r.customer_name,
          r.company_name,
          r.business_email,
          r.phone_number,
          r.country,
          r.industry,
          r.company_size,
          cats,
          svcs,
          r.project_title,
          r.project_description,
          r.budget_range,
          r.preferred_start_date,
          r.expected_completion_date,
          r.assigned_team_member,
          r.status,
          r.submission_date ? new Date(r.submission_date).toISOString() : '',
          r.updated_at ? new Date(r.updated_at).toISOString() : ''
        ]
          .map(escapeCsv)
          .join(',')
      );
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="OXOO-Project-Requests-${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.send(lines.join('\n'));
  } catch (err) {
    next(err);
  }
});

// 4. GET /api/admin/projects/requests/:requestId — Single Project Request Details
adminProjectsRouter.get('/requests/:requestId', async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const reqRes = await query(
      `SELECT * FROM project_requests WHERE request_id = $1 OR id::text = $1 LIMIT 1`,
      [requestId]
    );
    if (reqRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project request not found.' });
    }
    const projectRequest = reqRes.rows[0];

    const [attRowsRes, linkedConsultationsRes] = await Promise.all([
      query(
        `SELECT attachment_id, project_request_id, file_name, mime_type, size_bytes AS file_size_bytes, size_bytes, uploaded_by, created_at
         FROM project_attachments
         WHERE project_request_id = $1
         ORDER BY id ASC`,
        [projectRequest.request_id]
      ),
      query(
        `SELECT * FROM consultation_requests
         WHERE linked_project_request_id = $1 OR LOWER(business_email) = LOWER($2)
         ORDER BY submission_date DESC`,
        [projectRequest.request_id, projectRequest.business_email]
      )
    ]);

    projectRequest.attachments = attRowsRes.rows;

    res.json({
      success: true,
      request: projectRequest,
      linkedConsultations: linkedConsultationsRes.rows
    });
  } catch (err) {
    next(err);
  }
});

// 5. GET /api/admin/projects/attachments/:attachmentId — Secure Admin-Only Attachment Download
adminProjectsRouter.get('/attachments/:attachmentId', async (req, res, next) => {
  try {
    const { attachmentId } = req.params;
    const attRes = await query(
      `SELECT * FROM project_attachments WHERE attachment_id = $1 LIMIT 1`,
      [attachmentId]
    );
    if (attRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Attachment not found.' });
    }

    const att = attRes.rows[0];
    const safeName = String(att.file_name || 'attachment').replace(/[^a-zA-Z0-9._-]/g, '_');
    const buffer = Buffer.from(att.content_base64 || '', 'base64');

    res.setHeader('Content-Type', att.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    return res.send(buffer);
  } catch (err) {
    next(err);
  }
});

// 6. PATCH /api/admin/projects/requests/:requestId — Update Status, Assignee, Internal Notes, or Contact Customer
adminProjectsRouter.patch('/requests/:requestId', async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const {
      status,
      assignedTeamMember,
      assignedTo,
      internalNote,
      note,
      messageToCustomer,
      customerEmailMessage,
      notifyCustomer = false,
      sendStatusEmail = false
    } = req.body || {};

    const effectiveAssignee = assignedTeamMember !== undefined ? assignedTeamMember : assignedTo;
    const effectiveNote = internalNote !== undefined ? internalNote : note;
    const effectiveMsg = messageToCustomer !== undefined ? messageToCustomer : customerEmailMessage;
    const effectiveNotify = Boolean(notifyCustomer || sendStatusEmail);

    const existingRes = await query(
      `SELECT * FROM project_requests WHERE request_id = $1 OR id::text = $1 LIMIT 1`,
      [requestId]
    );
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project request not found.' });
    }

    const cur = existingRes.rows[0];
    const adminActor = req.adminUser?.name || req.adminUser?.email || 'Super Administrator';

    let nextStatus = cur.status;
    if (status && status !== cur.status) {
      if (!VALID_PROJECT_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status "${status}". Allowed: ${VALID_PROJECT_STATUSES.join(', ')}`
        });
      }
      nextStatus = status;
    }

    const nextAssignee =
      effectiveAssignee !== undefined ? sanitizeText(effectiveAssignee, 160) || 'Unassigned' : cur.assigned_team_member;

    const notesList = Array.isArray(cur.internal_notes) ? [...cur.internal_notes] : [];
    if (effectiveNote && String(effectiveNote).trim()) {
      const cleanNote = sanitizeText(effectiveNote, 2000);
      notesList.unshift({
        id: `NOTE-${Date.now()}`,
        noteId: `NOTE-${Date.now()}`,
        author: adminActor,
        note: cleanNote,
        text: cleanNote,
        createdAt: new Date().toISOString()
      });
    }

    const historyList = Array.isArray(cur.status_history) ? [...cur.status_history] : [];
    if (nextStatus !== cur.status || (effectiveAssignee && effectiveAssignee !== cur.assigned_team_member)) {
      historyList.unshift({
        fromStatus: cur.status,
        toStatus: nextStatus,
        changedBy: adminActor,
        note: effectiveNote
          ? sanitizeText(effectiveNote, 500)
          : effectiveAssignee && effectiveAssignee !== cur.assigned_team_member
          ? `Assigned to ${nextAssignee}`
          : `Status updated to ${nextStatus}`,
        changedAt: new Date().toISOString()
      });
    }

    const updRes = await query(
      `UPDATE project_requests
       SET status = $1,
           assigned_team_member = $2,
           internal_notes = $3,
           status_history = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [
        nextStatus,
        nextAssignee,
        JSON.stringify(notesList),
        JSON.stringify(historyList),
        cur.id
      ]
    );

    let emailResult = null;
    if (effectiveNotify || (effectiveMsg && String(effectiveMsg).trim())) {
      emailResult = await sendProjectStatusUpdateEmail({
        to: cur.business_email,
        customerName: cur.customer_name,
        requestId: cur.request_id,
        newStatus: nextStatus,
        messageToCustomer: sanitizeText(effectiveMsg || '', 2000)
      });
    }

    await logProjectAudit(
      `Project Request Updated (${cur.request_id})`,
      cur.request_id,
      adminActor,
      req.ip,
      { status: nextStatus, assignedTeamMember: nextAssignee }
    );

    res.json({
      success: true,
      message: 'Project request updated successfully.',
      request: updRes.rows[0],
      emailNotified: Boolean(emailResult?.delivered)
    });
  } catch (err) {
    next(err);
  }
});

// 7. POST /api/admin/projects/requests/:requestId/create-consultation — Create Consultation from Project Request
adminProjectsRouter.post('/requests/:requestId/create-consultation', async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const {
      preferredContactMethod = 'Video Consultation (Google Meet / Zoom)',
      preferredDate = '',
      preferredTime = '',
      assignedTeamMember,
      note = ''
    } = req.body || {};

    const projRes = await query(
      `SELECT * FROM project_requests WHERE request_id = $1 OR id::text = $1 LIMIT 1`,
      [requestId]
    );
    if (projRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project request not found.' });
    }

    const proj = projRes.rows[0];
    const adminActor = req.adminUser?.name || 'Super Administrator';
    const cnsId = `CNS-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const initialStatus = preferredDate ? 'Appointment Confirmed' : 'Contact Pending';

    const history = [
      {
        action: 'Created from Project Request ' + proj.request_id,
        date: preferredDate || 'TBD',
        time: preferredTime || 'TBD',
        actor: adminActor,
        note: note || `Scheduled follow-up consultation for ${proj.project_title}`,
        timestamp: new Date().toISOString()
      }
    ];

    const insRes = await query(
      `INSERT INTO consultation_requests (
        request_id, linked_project_request_id, customer_name, business_email, phone_number,
        company_name, country, preferred_contact_method, preferred_date, preferred_time,
        confirmed_date, confirmed_time, selected_categories, selected_services,
        project_summary, assigned_team_member, status, internal_notes, appointment_history,
        submission_date, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14,
        $15, $16, $17, '[]'::jsonb, $18,
        NOW(), NOW(), NOW()
      ) RETURNING *`,
      [
        cnsId,
        proj.request_id,
        proj.customer_name,
        proj.business_email,
        proj.phone_number,
        proj.company_name,
        proj.country,
        preferredContactMethod,
        preferredDate,
        preferredTime,
        preferredDate || '',
        preferredTime || '',
        JSON.stringify(proj.selected_categories || []),
        JSON.stringify(proj.selected_services || []),
        `${proj.project_title}: ${proj.project_description}`,
        assignedTeamMember || proj.assigned_team_member || 'Unassigned',
        initialStatus,
        JSON.stringify(history)
      ]
    );

    await logProjectAudit('Consultation Created from Project Request', cnsId, adminActor, req.ip, {
      linkedProjectRequestId: proj.request_id
    });

    res.status(201).json({
      success: true,
      message: `Consultation request ${cnsId} created and linked to ${proj.request_id}.`,
      consultation: insRes.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// 8. GET /api/admin/projects/consultations — Filtered, Sorted, Paginated Consultation Requests
adminProjectsRouter.get('/consultations', async (req, res, next) => {
  try {
    const {
      search = '',
      service = '',
      status = '',
      assignedTo = '',
      dateFrom = '',
      dateTo = '',
      sort = 'newest',
      page = 1,
      limit = 15
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 15));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      const idx = params.length;
      conditions.push(`(
        request_id ILIKE $${idx} OR
        customer_name ILIKE $${idx} OR
        company_name ILIKE $${idx} OR
        business_email ILIKE $${idx} OR
        phone_number ILIKE $${idx} OR
        project_summary ILIKE $${idx}
      )`);
    }

    if (service && service !== 'All' && service !== 'All Services') {
      params.push(`%${service.trim()}%`);
      conditions.push(`selected_services::text ILIKE $${params.length}`);
    }

    if (status && status !== 'All' && status !== 'All Statuses') {
      params.push(status.trim());
      conditions.push(`status = $${params.length}`);
    }

    if (assignedTo && assignedTo !== 'All' && assignedTo !== 'All Team Members') {
      params.push(assignedTo.trim());
      conditions.push(`assigned_team_member = $${params.length}`);
    }

    if (dateFrom && /^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
      params.push(dateFrom);
      conditions.push(`submission_date >= $${params.length}::date`);
    }

    if (dateTo && /^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
      params.push(dateTo);
      conditions.push(`submission_date < ($${params.length}::date + INTERVAL '1 day')`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'submission_date DESC, id DESC';
    if (sort === 'oldest') orderBy = 'submission_date ASC, id ASC';
    else if (sort === 'updated') orderBy = 'updated_at DESC, id DESC';

    const countRes = await query(
      `SELECT COUNT(*)::int AS total FROM consultation_requests ${whereClause}`,
      params
    );
    const total = countRes.rows[0]?.total || 0;

    const listRes = await query(
      `SELECT * FROM consultation_requests
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limitNum, offset]
    );

    res.json({
      success: true,
      consultations: listRes.rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.max(1, Math.ceil(total / limitNum))
      }
    });
  } catch (err) {
    next(err);
  }
});

// 9. GET /api/admin/projects/consultations/:requestId — Consultation Details
adminProjectsRouter.get('/consultations/:requestId', async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const resRow = await query(
      `SELECT * FROM consultation_requests WHERE request_id = $1 OR id::text = $1 LIMIT 1`,
      [requestId]
    );
    if (resRow.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Consultation request not found.' });
    }
    res.json({
      success: true,
      consultation: resRow.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// 10. PATCH /api/admin/projects/consultations/:requestId — Confirm, Reschedule, Cancel, Assign, or Add Note
adminProjectsRouter.patch('/consultations/:requestId', async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const {
      status,
      assignedTeamMember,
      assignedTo,
      confirmedDate,
      confirmedTime,
      meetingLink,
      internalNote,
      note,
      appointmentAction,
      messageToCustomer,
      notifyCustomer = false
    } = req.body || {};

    const effectiveAssignee = assignedTeamMember !== undefined ? assignedTeamMember : assignedTo;
    const effectiveNote = internalNote !== undefined ? internalNote : note;

    const existingRes = await query(
      `SELECT * FROM consultation_requests WHERE request_id = $1 OR id::text = $1 LIMIT 1`,
      [requestId]
    );
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Consultation request not found.' });
    }

    const cur = existingRes.rows[0];
    const adminActor = req.adminUser?.name || req.adminUser?.email || 'Super Administrator';

    let nextStatus = cur.status;
    if (status && status !== cur.status) {
      if (!VALID_CONSULTATION_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid consultation status "${status}". Allowed: ${VALID_CONSULTATION_STATUSES.join(', ')}`
        });
      }
      nextStatus = status;
    } else if (appointmentAction === 'confirm') {
      nextStatus = 'Appointment Confirmed';
    } else if (appointmentAction === 'cancel') {
      nextStatus = 'Cancelled';
    }

    const nextConfirmedDate =
      confirmedDate !== undefined ? sanitizeText(confirmedDate, 30) : (cur.confirmed_date || cur.preferred_date || '');
    const nextConfirmedTime =
      confirmedTime !== undefined ? sanitizeText(confirmedTime, 60) : (cur.confirmed_time || cur.preferred_time || '');
    const nextMeetingLink =
      meetingLink !== undefined ? sanitizeText(meetingLink, 400) : (cur.meeting_link || '');
    const nextAssignee =
      effectiveAssignee !== undefined ? sanitizeText(effectiveAssignee, 160) || 'Unassigned' : cur.assigned_team_member;

    // Check slot conflict if confirming or rescheduling to a specific date + time
    if (
      (nextStatus === 'Appointment Confirmed' || appointmentAction === 'confirm' || appointmentAction === 'reschedule') &&
      nextConfirmedDate &&
      nextConfirmedTime
    ) {
      const conflictRes = await query(
        `SELECT request_id FROM consultation_requests
         WHERE id != $1
           AND status = 'Appointment Confirmed'
           AND confirmed_date = $2
           AND confirmed_time = $3
         LIMIT 1`,
        [cur.id, nextConfirmedDate, nextConfirmedTime]
      );
      if (conflictRes.rows.length > 0) {
        return res.status(409).json({
          success: false,
          code: 'SLOT_ALREADY_CONFIRMED',
          message: `Slot ${nextConfirmedDate} at ${nextConfirmedTime} is already confirmed for consultation ${conflictRes.rows[0].request_id}.`
        });
      }
    }

    const notesList = Array.isArray(cur.internal_notes) ? [...cur.internal_notes] : [];
    if (effectiveNote && String(effectiveNote).trim()) {
      const cleanNote = sanitizeText(effectiveNote, 2000);
      notesList.unshift({
        id: `NOTE-${Date.now()}`,
        noteId: `NOTE-${Date.now()}`,
        author: adminActor,
        note: cleanNote,
        text: cleanNote,
        createdAt: new Date().toISOString()
      });
    }

    const apptHistory = Array.isArray(cur.appointment_history) ? [...cur.appointment_history] : [];
    if (
      appointmentAction ||
      nextStatus !== cur.status ||
      nextConfirmedDate !== cur.confirmed_date ||
      nextConfirmedTime !== cur.confirmed_time
    ) {
      const actionLabel =
        appointmentAction === 'confirm' || nextStatus === 'Appointment Confirmed'
          ? 'Appointment Confirmed'
          : appointmentAction === 'reschedule'
          ? 'Appointment Rescheduled'
          : appointmentAction === 'cancel' || nextStatus === 'Cancelled'
          ? 'Appointment Cancelled'
          : `Status Updated to ${nextStatus}`;

      apptHistory.unshift({
        id: `HIST-${Date.now()}`,
        action: actionLabel,
        date: nextConfirmedDate || cur.preferred_date || 'Flexible',
        time: nextConfirmedTime || cur.preferred_time || 'Flexible',
        actor: adminActor,
        note: effectiveNote || messageToCustomer || `Updated by ${adminActor}`,
        timestamp: new Date().toISOString()
      });
    }

    const updRes = await query(
      `UPDATE consultation_requests
       SET status = $1,
           assigned_team_member = $2,
           confirmed_date = $3,
           confirmed_time = $4,
           meeting_link = $5,
           internal_notes = $6,
           appointment_history = $7,
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        nextStatus,
        nextAssignee,
        nextConfirmedDate,
        nextConfirmedTime,
        nextMeetingLink,
        JSON.stringify(notesList),
        JSON.stringify(apptHistory),
        cur.id
      ]
    );

    let emailResult = null;
    if (notifyCustomer || nextStatus === 'Appointment Confirmed' || (messageToCustomer && String(messageToCustomer).trim())) {
      emailResult = await sendProjectStatusUpdateEmail({
        to: cur.business_email,
        customerName: cur.customer_name,
        requestId: cur.request_id,
        newStatus: nextStatus,
        messageToCustomer: sanitizeText(messageToCustomer || '', 2000),
        confirmedDate: nextConfirmedDate,
        confirmedTime: nextConfirmedTime,
        meetingLink: nextMeetingLink
      });
    }

    await logProjectAudit(
      `Consultation Request Updated (${cur.request_id})`,
      cur.request_id,
      adminActor,
      req.ip,
      { status: nextStatus, confirmedDate: nextConfirmedDate, confirmedTime: nextConfirmedTime }
    );

    res.json({
      success: true,
      message: 'Consultation request updated successfully.',
      consultation: updRes.rows[0],
      emailNotified: Boolean(emailResult?.delivered)
    });
  } catch (err) {
    next(err);
  }
});

module.exports = {
  publicProjectsRouter,
  adminProjectsRouter
};
