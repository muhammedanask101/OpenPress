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
    trim: true
  },

  awardedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: false,
});

BadgeOfSchema.index({ user: 1, badge: 1 }, { unique: true });

module.exports = mongoose.model('BadgeOf', BadgeOfSchema);
