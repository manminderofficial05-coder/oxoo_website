const mongoose = require('mongoose');
const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  category: { type: String, required: true, index: true },
  description: { type: String, default: '' },
  color: { type: String, default: 'green' },
  icon: { type: String, default: 'BriefcaseBusiness' },
  featured: { type: Boolean, default: false, index: true },
  features: [{ type: String }],
  sortOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });
ServiceSchema.index({ name: 'text', description: 'text', category: 'text' });
module.exports = mongoose.model('Service', ServiceSchema);
