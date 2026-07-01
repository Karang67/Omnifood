import mongoose from 'mongoose';

const featureFlagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, trim: true },
  module: { type: String, required: true, trim: true },
  parent: { type: String, default: null, trim: true },
  enabled: { type: Boolean, default: true },
  visible: { type: Boolean, default: true },
  roles: { type: [String], default: [] },
  apiEnabled: { type: Boolean, default: true },
  maintenance: { type: Boolean, default: false },
  beta: { type: Boolean, default: false },
  publicAccess: { type: Boolean, default: false },
  mobileEnabled: { type: Boolean, default: true },
  desktopEnabled: { type: Boolean, default: true },
  readOnly: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

featureFlagSchema.index({ module: 1, order: 1, slug: 1 });

export default mongoose.model('FeatureFlag', featureFlagSchema);
