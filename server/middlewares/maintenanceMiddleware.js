const SiteSettings = require('../models/sitesettingsModel');

let cachedSettings = null;
let lastFetch = 0;
const CACHE_DURATION = 30 * 1000; 


async function getSettings() {
  const now = Date.now();
  if (!cachedSettings || now - lastFetch > CACHE_DURATION) {
    cachedSettings = await SiteSettings.findOne();
    if (!cachedSettings) {
      cachedSettings = await SiteSettings.create({});
    }
    lastFetch = now;
  }
  return cachedSettings;
}

async function maintenanceMiddleware(req, res, next) {
  try {
    const settings = await getSettings();
    const mode = settings.maintenanceMode;

    if (!mode || !mode.enabled) {
      return next();
    }

    const allowedRoles = ['moderator'];

    const isPrivileged =
      req.user && req.user.role && allowedRoles.includes(req.user.role);

  
    if (isPrivileged) {
      return next();
    }


    if (req.path.startsWith('/api/admin')) {
      return next();
    }

 
    return res.status(503).json({
      message: mode.message || 'The site is under maintenance. Please check back later.'
    });

  } catch (err) {
    console.error('Maintenance middleware error:', err);
    next(err);
  }
}

module.exports = maintenanceMiddleware;

