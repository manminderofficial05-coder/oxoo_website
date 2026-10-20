const mongoose = require('mongoose');
const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, default: '', maxlength: 40 },
  company: { type: String, default: '', maxlength: 160 },
  service: { type: String, default: '', maxlength: 160 },
  message: { type: String, required: true, maxlength: 5000 },
  status: { type: String, enum: ['New','Contacted','Qualified','Proposal Sent','Negotiation','Won','Lost'], default: 'New', index: true },
  source: { type: String, default: 'website' },
  assignedTo: { type: String, default: '' }
}, { timestamps: true });
module.exports = mongoose.model('Lead', LeadSchema);
