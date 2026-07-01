import mongoose from 'mongoose';

const featureAuditLogSchema = new mongoose.Schema({
  adminId: { type: String, default: null },
  adminEmail: { type: String, default: '' },
  featureSlug: { type: String, required: true, trim: true },
  action: { type: String, required: true, trim: true },
  oldValue: { type: mongoose.Schema.Types.Mixed, default: null },
  newValue: { type: mongoose.Schema.Types.Mixed, default: null },
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

featureAuditLogSchema.index({ featureSlug: 1, timestamp: -1 });

export default mongoose.model('FeatureAuditLog', featureAuditLogSchema);
