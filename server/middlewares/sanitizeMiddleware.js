const mongoSanitize = require('express-mongo-sanitize');
const sanitizeHtml = require('sanitize-html');
const Joi = require('joi');

function deepSanitize(input) {
  if (typeof input === 'string') {
    return sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: 'discard'
    }).trim();
  }

  if (Array.isArray(input)) {
    return input.map(v => deepSanitize(v));
  }

  if (input && typeof input === 'object') {
    const out = {};
    for (const key of Object.keys(input)) {
      out[key] = deepSanitize(input[key]);
    }
    return out;
  }

  return input;
}


function sanitizeMiddleware(req, res, next) {
  mongoSanitize({ replaceWith: '_' })(req, res, () => {
    if (req.body) req.body = deepSanitize(req.body);
    if (req.query) req.query = deepSanitize(req.query);
    if (req.params) req.params = deepSanitize(req.params);
    next();
  });
}


function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(d => d.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }

    req.body = value;
    next();
  };
}

const objectId = () => Joi.string().length(24).hex();

const userRegister = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).max(128).required(),
  bio: Joi.string().max(500).allow('', null),
  avatarlink: Joi.string().uri().allow('', null)
});


const userLogin = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).max(128).required()
});


const adminRegister = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).max(128).required()
});


const adminLogin = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).max(128).required()
});


const articleCreate = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  body: Joi.string().min(20).max(20000).required(),
  preview: Joi.string().max(500).allow('', null),
  tags: Joi.array().items(Joi.string().max(50)).max(10).default([])
});


const articleUpdate = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  body: Joi.string().min(20).max(30000).optional(),
  preview: Joi.string().max(500).allow('', null).optional(),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
  status: Joi.string().valid('pending', 'approved', 'rejected').optional()
});


const questionCreate = Joi.object({
  question: Joi.string()
    .min(5)
    .max(150)
    .required(),
  context: Joi.string().max(5000).allow('', null),
  tags: Joi.array().items(Joi.string().max(50)).max(10).default([])
});

const questionUpdate = Joi.object({
  question: Joi.string()
    .min(5)
    .max(150)
    .optional(),
  context: Joi.string()
    .max(5000)
    .allow('', null)
    .optional(),
  tags: Joi.array()
    .items(Joi.string().max(50))
    .max(10)
    .optional(),
});


const answerCreate = Joi.object({
  question: objectId().required(),
  body: Joi.string().min(1).max(10000).required()
});


const commentCreate = Joi.object({
  user: objectId().required(),
  article: objectId().required(),
  parent: objectId().allow(null).optional(),
  body: Joi.string().min(1).max(5000).required()
});


const contactCreate = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().lowercase().required(),
  message: Joi.string().min(5).max(5000).required()
});


const reportCreate = Joi.object({
  itemType: Joi.string()
    .valid('article', 'question', 'answer', 'user', 'comment', 'other')
    .required(),
  itemId: objectId().required(),
  reason: Joi.string().min(3).max(200).required(),
  details: Joi.string().max(5000).allow('', null)
});


const bookmarkToggle = Joi.object({
  itemType: Joi.string().valid('article', 'question', 'answer').required(),
  itemId: objectId().required()
});


const starToggle = Joi.object({
  itemType: Joi.string().valid('article', 'answer').required(),
  itemId: objectId().required()
});


const badgeCreate = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).allow('', null),
  iconUrl: Joi.string().uri().allow('', null),
  autoAward: Joi.object({
    enabled: Joi.boolean().default(false),
    rule: Joi.any()
  }).default({ enabled: false })
});


const badgeAward = Joi.object({
  user: objectId().required(),
  badge: objectId().required(),
  reason: Joi.string().max(500).allow('', null)
});


const siteSettingsUpdate = Joi.object({
  siteName: Joi.string().max(200).optional(),
  tagline: Joi.string().max(300).optional(),
  siteDescription: Joi.string().max(2000).optional(),
  logoUrl: Joi.string().uri().allow('', null).optional(),
  faviconUrl: Joi.string().uri().allow('', null).optional(),
  contactEmail: Joi.string().email().allow('', null).optional(),
  organizationName: Joi.string().max(200).optional(),
  missionStatement: Joi.string().max(2000).optional(),
  features: Joi.object({
    allowRegistrations: Joi.boolean(),
    enableComments: Joi.boolean(),
    enableAnswers: Joi.boolean(),
    enableArticles: Joi.boolean()
  }).optional(),
  moderation: Joi.object({
    autoApproveLowRisk: Joi.boolean(),
    requireManualReview: Joi.boolean(),
    enableAIModeration: Joi.boolean(),
    aiModerationThreshold: Joi.number().min(0).max(1),
    bannedKeywords: Joi.array().items(Joi.string().max(100))
  }).optional(),
  social: Joi.object({
    discord: Joi.string().uri().allow('', null),
    twitter: Joi.string().uri().allow('', null),
    instagram: Joi.string().uri().allow('', null),
    youtube: Joi.string().uri().allow('', null),
    facebook: Joi.string().uri().allow('', null),
    github: Joi.string().uri().allow('', null)
  }).optional(),
  maintenanceMode: Joi.object({
    enabled: Joi.boolean(),
    message: Joi.string().max(500)
  }).optional(),
  theme: Joi.object({
    primaryColor: Joi.string().max(20),
    darkModeEnabled: Joi.boolean()
  }).optional(),
  analytics: Joi.object({
    googleAnalyticsId: Joi.string().max(100).allow('', null),
    plausibleDomain: Joi.string().max(200).allow('', null)
  }).optional()
});

const mediaCreate = Joi.object({
  key: Joi.string().max(500).required(),          
  url: Joi.string().uri().max(1000).required(),   
  mimeType: Joi.string().max(100).optional(),
  size: Joi.number().integer().min(0).optional(),
  storageProvider: Joi.string()
    .valid('s3', 'local', 'gcs', 'cloudinary', 'other')
    .optional(),
  storageRegion: Joi.string().max(100).allow('', null),
  usedin: Joi.object({
    kind: Joi.string().max(100),
    item: objectId()
  }).optional()
});

const schemas = {
  userRegister,
  userLogin,
  adminRegister,
  adminLogin,
  articleCreate,
  articleUpdate,
  questionCreate,
  questionUpdate,
  answerCreate,
  commentCreate,
  contactCreate,
  reportCreate,
  bookmarkToggle,
  starToggle,
  badgeCreate,
  badgeAward,
  siteSettingsUpdate,
  mediaCreate 
};

module.exports = {
  sanitizeMiddleware,
  validateBody,
  schemas,
};
