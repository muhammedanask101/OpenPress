const mongoose = require('mongoose');
const { Schema } = mongoose;

const BadgeSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Badge name is required'],
      unique: true,         
      trim: true,
      minlength: [2, 'Badge name must be at least 2 characters'],
      maxlength: [100, 'Badge name cannot exceed 100 characters'],
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    iconUrl: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    autoAward: {
      enabled: { type: Boolean, default: false },
      rule: {
        type: Schema.Types.Mixed, // e.g. { type: 'answers_count', threshold: 10 }
        default: null,
      },
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

// This index helps queries on auto-award + soft delete
// BadgeSchema.index({ deleted: 1, 'autoAward.enabled': 1 });

BadgeSchema.virtual('isActive').get(function () {
  return !this.deleted;
});

BadgeSchema.methods.softDelete = async function () {
  this.deleted = true;
  await this.save();
  return this;
};

BadgeSchema.methods.restore = async function () {
  this.deleted = false;
  await this.save();
  return this;
};

// Enable / configure auto-award rule
BadgeSchema.methods.setAutoAward = async function (enabled, rule = null) {
  this.autoAward.enabled = !!enabled;
  if (rule !== undefined) {
    this.autoAward.rule = rule;
  }
  await this.save();
  return this;
};

// Get all non-deleted badges
BadgeSchema.statics.findActive = function () {
  return this.find({ deleted: false }).sort({ name: 1 });
};

// Find a badge by name (case-insensitive-ish)
BadgeSchema.statics.findByName = function (name) {
  return this.findOne({
    name: new RegExp('^' + name + '$', 'i'),
    deleted: false,
  });
};

module.exports = mongoose.model('Badge', BadgeSchema);
