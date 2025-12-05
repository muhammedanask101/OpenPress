const mongoose = require('mongoose');
const { Schema } = mongoose;


const ReportSchema = new Schema({
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter is required'],
    index: true
  },
  itemType: {
    type: String,
    required: [true, 'Item type is required'],
    enum: ['article', 'question', 'answer', 'user', 'comment', 'other'],
    index: true
  },
  itemId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Item id is required'],
    index: true
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    minlength: [3, 'Reason must be at least 3 characters'],
    maxlength: [200, 'Reason cannot exceed 200 characters'],
    index: true
  },
  details: {
    type: String,
    trim: true,
    maxlength: 5000
  },
  snapshot: {
    type: Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['open', 'reviewing', 'resolved', 'rejected'],
    default: 'open',
    index: true
  },
  actionTaken: {
    type: String,
    trim: true,
    maxlength: 200,
    default: 'none'
  },
  handledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  addons: {
    type: Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  resolvedAt: {
    type: Date,
    index: true,
  },
  deleted: {
    type: Boolean,
    default: false,
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

ReportSchema.index({ itemType: 1, itemId: 1, status: 1 });
ReportSchema.index({ handledBy: 1, status: 1, createdAt: -1 });

ReportSchema.virtual('isOpen').get(function () {
  return this.status === 'open' || this.status === 'reviewing';
});

ReportSchema.methods.markResolved = async function ({
  handledBy,
  actionTaken = 'none',
  notes = '',
} = {}) {
  this.status = 'resolved';
  this.actionTaken = actionTaken;
  this.handledBy = handledBy || this.handledBy;
  this.notes = notes || this.notes;
  this.resolvedAt = new Date();
  await this.save();
  return this;
};

ReportSchema.methods.markRejected = async function ({
  handledBy,
  notes = '',
} = {}) {
  this.status = 'rejected';
  this.actionTaken = 'none';
  this.handledBy = handledBy || this.handledBy;
  this.notes = notes || this.notes;
  this.resolvedAt = new Date();
  await this.save();
  return this;
};

ReportSchema.methods.softDelete = async function () {
  this.deleted = true;
  await this.save();
  return this;
};

// all non-deleted
ReportSchema.statics.forItem = function (itemType, itemId) {
  return this.find({ itemType, itemId, deleted: false }).sort({ createdAt: -1 });
};

// all open reports
ReportSchema.statics.openForItem = function (itemType, itemId) {
  return this.find({
    itemType,
    itemId,
    deleted: false,
    status: { $in: ['open', 'reviewing'] },
  }).sort({ createdAt: 1 });
};

// get by status
ReportSchema.statics.byStatus = function (status, { page = 1, limit = 20 } = {}) {
  return this.find({ status, deleted: false })
    .sort({ createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(limit);
};


// sanitize snapshot to reduce storing secrets
ReportSchema.pre('save', function (next) {
  if (this.snapshot && typeof this.snapshot === 'object') {
    try {
      const snap = JSON.parse(JSON.stringify(this.snapshot));

      // reduce sensitive keys
      ['password', 'token', 'accessToken', 'refreshToken'].forEach((k) => {
        if (snap[k]) delete snap[k];
      });

      // truncate big bodies
      if (typeof snap.body === 'string' && snap.body.length > 2000) {
        snap.body = snap.body.slice(0, 2000) + '...[truncated]';
      }

      this.snapshot = snap;
    } catch (e) {
      // if error, drop snapshot rather than breaking save
      this.snapshot = undefined;
    }
  }
  next();
});

module.exports = mongoose.model('Report', ReportSchema);
