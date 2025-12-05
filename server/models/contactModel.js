const mongoose = require('mongoose');

const contactSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            match: [/.+@.+\..+/, 'Please enter a valid email address'],
            index: true,
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true,
            minlength: [5, 'Message must be at least 5 characters'],
            maxlength: [5000, 'Message cannot exceed 5000 characters'],
        },
        handled: {
            type: Boolean,
            default: false,
            index: true,
        },
        handledAt: {
            type: Date,
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
)

ContactSchema.index({ createdAt: -1 }); 
ContactSchema.index({ handled: 1, createdAt: -1 });

// preview
ContactSchema.virtual('excerpt').get(function () {
  if (!this.message) return '';
  const text = this.message.toString();
  if (text.length <= 120) return text;
  return text.slice(0, 120) + '...';
});

ContactSchema.methods.markasHandled = async function () {
  this.handled = true;
  this.handledAt = new Date();
  await this.save();
  return this;
};

ContactSchema.statics.findUnhandled = function ({ page = 1, limit = 20 } = {}) {
  return this.find({ handled: false })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

ContactSchema.pre('save', function (next) {
  if (typeof this.message === 'string') {
    this.message = this.message.replace(/\s+/g, ' ').trim();
  }
  if (typeof this.name === 'string') {
    this.name = this.name.trim();
  }
  next();
});

module.exports = mongoose.model('Contact', contactSchema);