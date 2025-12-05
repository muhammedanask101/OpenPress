const mongoose = require('mongoose');
const { Schema } = mongoose;

const ModLogSchema = new Schema({

  itemType: {
    type: String,
    enum: [
      'article',
      'question',
      'answer',
      'comment',
      'user',
      'report',
      'settings',
      'system',
      'other'
    ],
    required: [true, 'Item type is required'],
    index: true
  },

  itemId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Item ID is required'],
    index: true
  },

  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true,
    maxlength: 200,
    index: true,
  },

  actor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },

  reason: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: ''
  },

  meta: {
    type: Schema.Types.Mixed,
    default: {}
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
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

ModLogSchema.index({ itemType: 1, itemId: 1, createdAt: -1 });
ModLogSchema.index({ actor: 1, createdAt: -1 });

ModLogSchema.virtual('summary').get(function () {
  const who = this.actor ? `user:${this.actor}` : 'system';
  return `[${this.itemType} ${this.itemId}] ${this.action} by ${who}`;
});

// Convenience logger to keep controllers clean
ModLogSchema.statics.log = function ({
  itemType,
  itemId,
  action,
  actor = null,
  reason = '',
  meta = {},
}) {
  return this.create({
    itemType,
    itemId,
    action,
    actor,
    reason,
    meta,
    createdAt: new Date(),
  });
};

// Get logs for an item
ModLogSchema.statics.forItem = function (itemType, itemId, { limit = 50 } = {}) {
  return this.find({ itemType, itemId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Get logs by actor
ModLogSchema.statics.forActor = function (actorId, { limit = 50 } = {}) {
  return this.find({ actor: actorId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Lightly sanitize meta to avoid storing obvious secrets
ModLogSchema.pre('save', function (next) {
  if (this.meta && typeof this.meta === 'object') {
    try {
      const m = JSON.parse(JSON.stringify(this.meta));
      ['password', 'token', 'accessToken', 'refreshToken'].forEach((k) => {
        if (m[k]) delete m[k];
      });
      this.meta = m;
    } catch (e) {
      // if meta is weird, just leave it as-is instead of crashing
    }
  }
  next();
});

module.exports = mongoose.model('ModLog', ModLogSchema);
