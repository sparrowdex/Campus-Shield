const mongoose = require('mongoose');
const { Schema } = mongoose;

const AdminRequestSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  experience: { type: String, required: true },
  responsibilities: { type: String, required: true },
  urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  contactInfo: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  reviewNotes: { type: String }
});

module.exports = mongoose.model('AdminRequest', AdminRequestSchema); 