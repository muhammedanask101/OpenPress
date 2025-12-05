const mongoose = require('mongoose');
const { Schema } = mongoose;

const SiteSettingsSchema = new Schema(
  {
    siteName: {
      type: String,
      default: 'My Community Site',
      trim: true,
      maxlength: 200,
    },

    tagline: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300,
    },

    siteDescription: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2000,
    },

    logoUrl: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },

    faviconUrl: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },

    contactEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
      match: [/^$|^\S+@\S+\.\S+$/, 'Please enter a valid contact email address'],
    },

    organizationName: {
      type: String,
      default: '',
      trim: true,
      maxlength: 200,
    },

    missionStatement: {
      type: String,
      default: '',
      trim: true,
      maxlength: 3000,
    },

    features: {
      allowRegistrations: { type: Boolean, default: true },
      enableComments: { type: Boolean, default: true },
      enableAnswers: { type: Boolean, default: true },
      enableArticles: { type: Boolean, default: true },
    },

    moderation: {
      autoApproveLowRisk: { type: Boolean, default: false },
      requireManualReview: { type: Boolean, default: true },
      enableAIModeration: { type: Boolean, default: false },
      aiModerationThreshold: {
        type: Number,
        default: 0.6,
        min: 0,
        max: 1,
      }, // 0–1
      bannedKeywords: {
        type: [String],
        default: [],
      },
    },

    social: {
      discord: { type: String, default: '', trim: true, maxlength: 500 },
      twitter: { type: String, default: '', trim: true, maxlength: 500 },
      instagram: { type: String, default: '', trim: true, maxlength: 500 },
      youtube: { type: String, default: '', trim: true, maxlength: 500 },
      facebook: { type: String, default: '', trim: true, maxlength: 500 },
      github: { type: String, default: '', trim: true, maxlength: 500 },
    },

    maintenanceMode: {
      enabled: { type: Boolean, default: false },
      message: {
        type: String,
        default: 'The site is under maintenance. Please check back later.',
        trim: true,
        maxlength: 500,
      },
    },

    theme: {
      primaryColor: {
        type: String,
        default: '#2563eb',
        trim: true,
        maxlength: 20,
      },
      darkModeEnabled: { type: Boolean, default: false },
    },

    analytics: {
      googleAnalyticsId: { type: String, default: '', trim: true, maxlength: 100 },
      plausibleDomain: { type: String, default: '', trim: true, maxlength: 200 },
    },

    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);


// If you ever have more than one, this helps find the active one
SiteSettingsSchema.index({ deleted: 1, createdAt: -1 });

// For quickly checking maintenance mode
SiteSettingsSchema.index({ 'maintenanceMode.enabled': 1 });

SiteSettingsSchema.virtual('isMaintenanceMode').get(function () {
  return !!(this.maintenanceMode && this.maintenanceMode.enabled);
});

// Always returns "the" settings doc (creates one if missing)
SiteSettingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne({ deleted: false });

  if (!settings) {
    settings = await this.create({});
  }

  return settings;
};

// Helper to update settings safely
SiteSettingsSchema.statics.updateSettings = async function (updates = {}) {
  const settings = await this.getSingleton();

  // shallow merge top-level fields
  Object.keys(updates).forEach((key) => {
    if (key in settings) {
      settings[key] = updates[key];
    }
  });

  await settings.save();
  return settings;
};

SiteSettingsSchema.pre('save', function (next) {
  // Clamp AI threshold just in case
  if (this.moderation && typeof this.moderation.aiModerationThreshold === 'number') {
    if (this.moderation.aiModerationThreshold < 0) {
      this.moderation.aiModerationThreshold = 0;
    }
    if (this.moderation.aiModerationThreshold > 1) {
      this.moderation.aiModerationThreshold = 1;
    }
  }

  // Normalize bannedKeywords (trim + lowercase + dedupe)
  if (this.moderation && Array.isArray(this.moderation.bannedKeywords)) {
    const cleaned = this.moderation.bannedKeywords
      .map((w) => (w || '').toString().trim().toLowerCase())
      .filter((w) => w.length > 0);

    this.moderation.bannedKeywords = Array.from(new Set(cleaned));
  }

  next();
});

module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);

