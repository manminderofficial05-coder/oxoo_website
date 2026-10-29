const mongoose = require('mongoose');

const ProjectRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true },
    businessEmail: { type: String, required: true, trim: true, lowercase: true, index: true },
    phoneNumber: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    companyWebsite: { type: String, default: '' },
    country: { type: String, required: true, trim: true },
    industry: { type: String, default: '' },
    companySize: { type: String, default: '' },
    selectedCategories: [{ type: String }],
    selectedServices: [{ type: String }],
    projectTitle: { type: String, required: true, trim: true },
    projectDescription: { type: String, required: true },
    businessProblem: { type: String, default: '' },
    requiredFeatures: { type: String, default: '' },
    targetAudience: { type: String, default: '' },
    preferredTechnology: { type: String, default: '' },
    existingUrl: { type: String, default: '' },
    referenceWebsites: { type: String, default: '' },
    designPreferences: { type: String, default: '' },
    expectedDeliverables: { type: String, default: '' },
    preferredStartDate: { type: String, default: '' },
    expectedCompletionDate: { type: String, default: '' },
    budgetRange: { type: String, default: '' },
    additionalRequirements: { type: String, default: '' },
    attachmentsMeta: [
      {
        attachmentId: String,
        fileName: String,
        mimeType: String,
        sizeBytes: Number,
        uploadedAt: Date
      }
    ],
    consentAccepted: { type: Boolean, default: true },
    assignedTeamMember: { type: String, default: 'Unassigned' },
    status: {
      type: String,
      enum: [
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
      ],
      default: 'New',
      index: true
    },
    internalNotes: [
      {
        noteId: String,
        author: String,
        text: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],
    statusHistory: [
      {
        fromStatus: String,
        toStatus: String,
        changedBy: String,
        note: String,
        changedAt: { type: Date, default: Date.now }
      }
    ],
    notificationDelivered: { type: Boolean, default: false },
    submissionDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const ConsultationRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    linkedProjectRequestId: { type: String, default: null },
    customerName: { type: String, required: true, trim: true },
    businessEmail: { type: String, required: true, trim: true, lowercase: true, index: true },
    phoneNumber: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    preferredContactMethod: { type: String, default: 'Video Consultation (Google Meet / Zoom)' },
    preferredDate: { type: String, default: '' },
    preferredTime: { type: String, default: '' },
    confirmedDate: { type: String, default: '' },
    confirmedTime: { type: String, default: '' },
    meetingLink: { type: String, default: '' },
    selectedCategories: [{ type: String }],
    selectedServices: [{ type: String }],
    projectSummary: { type: String, required: true },
    assignedTeamMember: { type: String, default: 'Unassigned' },
    status: {
      type: String,
      enum: [
        'New',
        'Contact Pending',
        'Contacted',
        'Appointment Requested',
        'Appointment Confirmed',
        'Completed',
        'Cancelled'
      ],
      default: 'New',
      index: true
    },
    internalNotes: [
      {
        noteId: String,
        author: String,
        text: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],
    appointmentHistory: [
      {
        action: String,
        date: String,
        time: String,
        actor: String,
        note: String,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    notificationDelivered: { type: Boolean, default: false },
    submissionDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = {
  ProjectRequest: mongoose.models.ProjectRequest || mongoose.model('ProjectRequest', ProjectRequestSchema),
  ConsultationRequest:
    mongoose.models.ConsultationRequest || mongoose.model('ConsultationRequest', ConsultationRequestSchema)
};

