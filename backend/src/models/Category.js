const mongoose = require('mongoose');
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  color: { type: String, default: 'green' },
  icon: { type: String, default: 'BriefcaseBusiness' },
  services: [{ type: String }],
  sortOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('Category', CategorySchema);
