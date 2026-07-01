import FeatureFlag from '../models/FeatureFlag.mjs';
import FeatureAuditLog from '../models/FeatureAuditLog.mjs';

function buildFeatureTree(flags) {
  const modules = ['Home', 'Authentication', 'Customer', 'Rider', 'Admin', 'System'];
  const grouped = new Map();

  modules.forEach((moduleName) => grouped.set(moduleName, []));

  flags.forEach((flag) => {
    if (!grouped.has(flag.module)) {
      grouped.set(flag.module, []);
    }
    grouped.get(flag.module).push(flag);
  });

  return modules.map((moduleName) => ({
    module: moduleName,
    flags: grouped.get(moduleName)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((flag) => ({
        ...flag,
        children: []
      }))
  }));
}

function sanitizePayload(body) {
  if (!body || typeof body !== 'object') {
    return {};
  }

  const allowedFields = [
    'enabled',
    'visible',
    'roles',
    'apiEnabled',
    'maintenance',
    'beta',
    'publicAccess',
    'mobileEnabled',
    'desktopEnabled',
    'readOnly',
    'order',
    'name',
    'module',
    'parent'
  ];

  return Object.fromEntries(Object.entries(body).filter(([key]) => allowedFields.includes(key)));
}

export async function getFeatureFlags(req, res) {
  try {
    const flags = await FeatureFlag.find({}).sort({ module: 1, order: 1, slug: 1 }).lean();
    res.json({ success: true, tree: buildFeatureTree(flags), count: flags.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateFeatureFlag(req, res) {
  try {
    const { slug } = req.params;
    const updates = sanitizePayload(req.body);

    if (!slug || !Object.keys(updates).length) {
      return res.status(400).json({ success: false, message: 'No valid updates provided.' });
    }

    const current = await FeatureFlag.findOne({ slug });
    if (!current) {
      return res.status(404).json({ success: false, message: 'Feature flag not found.' });
    }

    const updated = await FeatureFlag.findOneAndUpdate(
      { slug },
      { $set: updates },
      { new: true, runValidators: true }
    );

    await FeatureAuditLog.create({
      adminId: req.user?.id || null,
      adminEmail: req.user?.email || 'system',
      featureSlug: slug,
      action: 'update',
      oldValue: current.toObject(),
      newValue: updated.toObject(),
      ipAddress: req.ip || '',
      userAgent: req.get('user-agent') || ''
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('feature:updated', {
        slug,
        feature: updated.toObject()
      });
    }

    res.json({ success: true, feature: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function bulkAction(req, res) {
  try {
    const { action, payload } = req.body;
    const flags = await FeatureFlag.find({});

    if (action === 'enable-all') {
      await FeatureFlag.updateMany({}, { $set: { enabled: true } });
    } else if (action === 'disable-all') {
      await FeatureFlag.updateMany({}, { $set: { enabled: false } });
    } else if (action === 'reset-defaults') {
      await FeatureFlag.deleteMany({});
      const { seedFeatureFlags } = await import('../utils/seedFeatureFlags.mjs');
      await seedFeatureFlags();
    } else if (action === 'import') {
      if (!Array.isArray(payload)) {
        return res.status(400).json({ success: false, message: 'Import payload must be an array.' });
      }
      await Promise.all(payload.map((item) => FeatureFlag.findOneAndUpdate({ slug: item.slug }, { $set: item }, { upsert: true, new: true })));
    } else if (action === 'export') {
      return res.json({ success: true, payload: flags });
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported bulk action.' });
    }

    const refreshed = await FeatureFlag.find({}).sort({ module: 1, order: 1, slug: 1 }).lean();
    res.json({ success: true, count: refreshed.length, flags: refreshed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getFeatureAuditLogs(req, res) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 12);
    const filter = {};

    if (req.query.slug) filter.featureSlug = req.query.slug;
    if (req.query.adminEmail) filter.adminEmail = req.query.adminEmail;

    const logs = await FeatureAuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await FeatureAuditLog.countDocuments(filter);

    res.json({ success: true, logs, page, limit, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getPublicFeatureFlags(req, res) {
  try {
    const flags = await FeatureFlag.find({})
      .select('slug name module enabled visible readOnly maintenance beta roles publicAccess')
      .lean();
    res.json({ success: true, features: flags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
