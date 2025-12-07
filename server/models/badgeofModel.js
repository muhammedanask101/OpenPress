const mongoose = require('mongoose');
const { Schema } = mongoose;

const BadgeOfSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    badge: {
      type: Schema.Types.ObjectId,
      ref: 'Badge',
      required: true,
      index: true,
    },

    awardedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    awardedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
      index: true,
    },
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
  }
);

// A user can only have a given badge once
// BadgeOfSchema.index({ user: 1, badge: 1 }, { unique: true });
// BadgeOfSchema.index({ user: 1, awardedAt: -1 });

BadgeOfSchema.methods.revoke = async function () {
  await this.deleteOne();
  return true;
};

// Robust award with upsert to avoid race-condition on unique index
BadgeOfSchema.statics.awardBadge = async function ({
  userId,
  badgeId,
  reason = '',
  awardedBy = null,
}) {
  const filter = { user: userId, badge: badgeId };

  const update = {
    $setOnInsert: {
      user: userId,
      badge: badgeId,
      awardedAt: new Date(),
    },
    $set: {
      reason,
      awardedBy,
    },
  };

  const options = {
    new: true,
    upsert: true,
  };

  const doc = await this.findOneAndUpdate(filter, update, options);
  return doc;
};

// Backwards compatibility: keep old name if used elsewhere
BadgeOfSchema.statics.awardbadge = BadgeOfSchema.statics.awardBadge;

// Get all badges for a user (populate Badge if you want)
BadgeOfSchema.statics.getUserBadges = function (userId) {
  return this.find({ user: userId }).sort({ awardedAt: -1 });
};

// Check if user has a specific badge
BadgeOfSchema.statics.hasBadge = async function (userId, badgeId) {
  const doc = await this.findOne({ user: userId, badge: badgeId });
  return !!doc;
};

module.exports = mongoose.model('BadgeOf', BadgeOfSchema);
