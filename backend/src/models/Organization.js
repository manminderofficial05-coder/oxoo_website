const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  plan: { type: String, enum: ['Starter', 'Professional', 'Enterprise', 'Custom'], default: 'Professional' },
  activeApps: [{ type: String }],
  memberCount: { type: Number, default: 1 },
  status: { type: String, enum: ['Active', 'Suspended', 'Trialing'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);
