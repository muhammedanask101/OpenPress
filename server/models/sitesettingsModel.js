const mongoose = require('mongoose');
const { Schema } = mongoose;


const SiteSettingsSchema = new Schema({

  siteName: {
    type: String,
    default: 'My Community Site'
  },
  tagline: {
    type: String,
    default: ''
  },
  siteDescription: {
    type: String,
    default: ''
  },

  logoUrl: { type: String, default: '' },
  faviconUrl: { type: String, default: '' },

  contactEmail: { type: String, default: '' },
  organizationName: { type: String, default: '' },
  missionStatement: { type: String, default: '' },

  features: {
    allowRegistrations: { type: Boolean, default: true },
    allowAnonymousQuestions: { type: Boolean, default: false },
    enableComments: { type: Boolean, default: true },
    enableAnswers: { type: Boolean, default: true },
    enableArticles: { type: Boolean, default: true }
  },

  moderation: {
    autoApproveLowRisk: { type: Boolean, default: false },
    requireManualReview: { type: Boolean, default: true },
    enableAIModeration: { type: Boolean, default: true },
    aiModerationThreshold: { type: Number, default: 0.6 }, // 0-1 scale
    bannedKeywords: { type: [String], default: [] }
  },

  social: {
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    facebook: { type: String, default: '' },
    github: { type: String, default: '' }
  },

  maintenanceMode: {
    enabled: { type: Boolean, default: false },
    message: { type: String, default: 'The site is under maintenance. Please check back later.' }
  },

  theme: {
    primaryColor: { type: String, default: '#2563eb' },
    darkModeEnabled: { type: Boolean, default: false }
  },

  analytics: {
    googleAnalyticsId: { type: String, default: '' },
    plausibleDomain: { type: String, default: '' }
  },

  deleted: { type: Boolean, default: false }
}, {
  timestamps: true,
});


module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);
