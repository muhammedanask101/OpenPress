const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

// Prefer user ID; fall back to safe IP-based key
function userOrIpKey(req, res) {
  if (req.user && req.user._id) {
    return req.user._id.toString();
  }

  // Use the helper for IPv4/IPv6 instead of req.ip
  return ipKeyGenerator(req, res);
}

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 120,                  // 120 requests / minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  handler: (req, res) => {
    return res.status(429).json({
      message: 'Too many requests. Please slow down.',
    });
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                   // 10 requests / window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  handler: (req, res) => {
    return res.status(429).json({
      message: 'Too many auth attempts. Please try again later.',
    });
  },
});

const contentCreateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 minutes
  max: 20,                   // 20 create actions / window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  handler: (req, res) => {
    return res.status(429).json({
      message:
        'You are creating content too quickly. Please wait a bit and try again.',
    });
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  contentCreateLimiter,
};
