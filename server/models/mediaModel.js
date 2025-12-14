const mongoose = require('mongoose');
const { Schema } = mongoose;

const MediaSchema = new Schema(
  {
    key: {
      type: String,
      required: [true, 'Storage key is required'],
      trim: true,
      maxlength: 500,
      index: true,
    },

    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
      maxlength: 1000,
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    mimeType: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    size: {
      type: Number,
      default: 0,
      min: 0,
    },

    checksum: {
      type: String,
      trim: true,
      maxlength: 255,
    },

    usedin: {
      kind: {
        type: String,
        trim: true,
        maxlength: 100,
      },
      item: {
        type: Schema.Types.ObjectId,
      },
    },

    derivatives: {
      thumbnailUrl: { type: String, trim: true, maxlength: 1000 },
      smallUrl: { type: String, trim: true, maxlength: 1000 },
      mediumUrl: { type: String, trim: true, maxlength: 1000 },
    },

    storageProvider: {
      type: String,
      default: 's3',
      trim: true,
      maxlength: 50,
      index: true,
      enum: ['s3', 'local', 'gcs', 'cloudinary', 'other'],
    },

    storageRegion: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    meta: {
      type: Schema.Types.Mixed,
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

// same key+provider should generally be unique
MediaSchema.index(
  { key: 1, storageProvider: 1 },
  { unique: true }
);

MediaSchema.index({ 'usedin.kind': 1, 'usedin.item': 1 });

// list by uploader
// MediaSchema.index({ uploadedBy: 1, createdAt: -1 });

// find media attached to a given item
// MediaSchema.index({ 'usedin.kind': 1, 'usedin.item': 1 });

// provider + region for infra queries
// MediaSchema.index({ storageProvider: 1, storageRegion: 1 });

MediaSchema.virtual('isDeleted').get(function () {
  return !!this.deleted;
});

// Soft delete
MediaSchema.methods.softDelete = async function () {
  this.deleted = true;
  await this.save();
  return this;
};

// Attach usage record (e.g., link to article/question/answer)
MediaSchema.methods.attachUsage = async function (kind, itemId) {
  this.usedin = {
    kind: (kind || '').toString().trim(),
    item: itemId || null,
  };
  await this.save();
  return this;
};

// Clear usage (unlink from content)
MediaSchema.methods.clearUsage = async function () {
  this.usedin = { kind: undefined, item: undefined };
  await this.save();
  return this;
};

// Find by key + provider
MediaSchema.statics.findByKey = function (key, provider = 's3') {
  return this.findOne({
    key,
    storageProvider: provider,
    deleted: false,
  });
};

// All active media for a given item (kind + id)
MediaSchema.statics.findActiveForItem = function ({ kind, itemId }) {
  return this.find({
    'usedin.kind': kind,
    'usedin.item': itemId,
    deleted: false,
  }).sort({ createdAt: -1 });
};

// All media uploaded by a user
MediaSchema.statics.forUser = function (userId, { page = 1, limit = 20 } = {}) {
  return this.find({ uploadedBy: userId, deleted: false })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

MediaSchema.pre('save', function (next) {
  // normalize mimeType to lowercase
  if (typeof this.mimeType === 'string') {
    this.mimeType = this.mimeType.toLowerCase().trim();
  }

  // ensure non-negative size
  if (typeof this.size === 'number' && this.size < 0) {
    this.size = 0;
  }

  // normalize usedin.kind
  if (this.usedin && typeof this.usedin.kind === 'string') {
    this.usedin.kind = this.usedin.kind.trim().toLowerCase();
  }

  // lightweight scrub of obvious secrets in meta
  if (this.meta && typeof this.meta === 'object') {
    try {
      const m = JSON.parse(JSON.stringify(this.meta));
      ['password', 'token', 'accessToken', 'secret'].forEach((k) => {
        if (m[k]) delete m[k];
      });
      this.meta = m;
    } catch (e) {
      // if meta is weird, just leave it rather than erroring
    }
  }

  next();
});

module.exports = mongoose.model('Media', MediaSchema);

