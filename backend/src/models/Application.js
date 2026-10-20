const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  concept: { type: String, default: '' },
  mainColor: { type: String, default: '#2563eb' },
  bgColor: { type: String, default: '#eff6ff' },
  iconSrc: { type: String, required: true },
  svgSrc: { type: String, default: '' },
  tagline: { type: String, default: '' },
  description: { type: String, default: '' },
  features: [{ type: String }],
  enabled: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

applicationSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Application', applicationSchema);
