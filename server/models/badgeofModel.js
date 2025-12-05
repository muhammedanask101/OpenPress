const mongoose = require('mongoose');
const { Schema } = mongoose;

const BadgeOfSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  badge: {
    type: Schema.Types.ObjectId,
    ref: 'Badge',
    required: true,
    index: true
  },

  awardedAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  reason: {
    type: String,
    trim: true,
    maxlength: 500,
    default: '',
  },

  awardedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  }
}, 
{
  timestamps: false,
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
});

BadgeOfSchema.index({ user: 1, badge: 1 }, { unique: true });
BadgeOfSchema.index({ user: 1, awardedAt: -1 });


BadgeOfSchema.methods.revoke = async function () {
  await this.deleteOne();
  return true;
};

BadgeOfSchema.statics.awardbadge = async function ({
  userId,
  badgeId,
  reason = '',
  awardedBy = null,
}) {
  let doc = await this.findOne({ user: userId, badge: badgeId });

  if (!doc) {
    doc = await this.create({
      user: userId,
      badge: badgeId,
      reason,
      awardedBy,
      awardedAt: new Date(),
    });
  }

  return doc;
};

// Get all badges for a user (populate Badge if you want)
BadgeOfSchema.statics.getUserBadges = function (userId) {
  return this.find({ user: userId }).sort({ awardedAt: -1 });
};

// Check if user has a specific badge
BadgeOfSchema.statics.hasBadge = async function (userId, badgeId) {
  const doc = await this.findOne({ user: userId, badge: badgeId });
  return !!doc;
};

BadgeOfSchema.pre('save', function (next) {
  if (typeof this.reason === 'string') {
    this.reason = this.reason.trim();
  }
  next();
});

module.exports = mongoose.model('BadgeOf', BadgeOfSchema);
