const rateLimit = require('express-rate-limit');


function userOrIpKey(req) {
  if (req.user && req.user._id) {
    return req.user._id.toString();
  }
  return req.ip;
}


const apiLimiter = rateLimit({
  windowMs: 60 * 1000,       
  max: 120,                  
  standardHeaders: true,     
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  handler: (req, res) => {
    return res.status(429).json({
      message: 'Too many requests. Please slow down.'
    });
  }
});


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  
  max: 10,                  
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  handler: (req, res) => {
    return res.status(429).json({
      message: 'Too many auth attempts. Please try again later.'
    });
  }
});


const contentCreateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 20,                   
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  handler: (req, res) => {
    return res.status(429).json({
      message: 'You are creating content too quickly. Please wait a bit and try again.'
    });
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  contentCreateLimiter
};
