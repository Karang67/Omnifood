import FeatureFlag from '../models/FeatureFlag.mjs';

async function getFeatureFlag(slug) {
  if (!slug) return null;
  return FeatureFlag.findOne({ slug }).lean();
}

export function checkFeatureEnabled(slug) {
  return async (req, res, next) => {
    const flag = await getFeatureFlag(slug);
    if (!flag || flag.enabled) {
      return next();
    }

    return res.status(403).json({ disabled: true, message: `${slug} is currently disabled.` });
  };
}

export function checkModuleEnabled(moduleName) {
  return async (req, res, next) => {
    const flags = await FeatureFlag.find({ module: moduleName }).lean();
    if (!flags.length || flags.every((flag) => flag.enabled)) {
      return next();
    }

    return res.status(403).json({ disabled: true, message: `${moduleName} module is currently disabled.` });
  };
}

export function checkApiAccess(slug) {
  return async (req, res, next) => {
    const flag = await getFeatureFlag(slug);
    if (!flag || flag.apiEnabled !== false) {
      return next();
    }

    return res.status(403).json({ disabled: true, message: `${slug} API access is disabled.` });
  };
}

export function checkMaintenanceMode(slug) {
  return async (req, res, next) => {
    const flag = await getFeatureFlag(slug);
    if (!flag || !flag.maintenance) {
      return next();
    }

    return res.status(503).json({ disabled: true, message: `${slug} is currently under maintenance.` });
  };
}
