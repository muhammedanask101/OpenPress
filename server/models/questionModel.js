const mongoose = require('mongoose');

const { Schema } = mongoose;

const QuestionSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    minlength: [5, 'Question must be at least 5 characters'],
    maxlength: [150, 'Question cannot exceed 150 characters'],
  },
  context: {
    type: String,
    trim: true,
    maxlength: [5000, 'Context cannot exceed 5000 characters'],
  },
  tags: {
    type: [String],
    default: [],
    validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length <= 10;
        },
        message: 'You can specify at most 10 tags',
      },
  },
  views: { type: Number, 
    default: 0,
    min: 0, 
  },
  deleted: { 
    type: Boolean, 
    default: false,
    index: true,
  }
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

QuestionSchema.index({ author: 1, createdAt: -1 });
QuestionSchema.index({ question: 'text', context: 'text' });

QuestionSchema.virtual('excerpt').get(function () {
  const src = this.context && this.context.trim().length > 0
    ? this.context
    : this.question || '';

  if (!src) return '';
  if (src.length <= 200) return src;
  return src.slice(0, 200) + '...';
});

QuestionSchema.methods.incrementViews = async function () {
  this.views = (this.views || 0) + 1;
  await this.save();
  return this.views;
};

QuestionSchema.methods.softDelete = async function () {
  this.deleted = true;
  await this.save();
  return this;
};

QuestionSchema.statics.findPublic = function (filter = {}, options = {}) {
  const { page = 1, limit = 10 } = options;
  return this.find({ deleted: false, ...filter })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

QuestionSchema.statics.searchPublic = function (query, options = {}) {
  const { page = 1, limit = 10 } = options;
  const filter = {
    $text: { $search: query },
    deleted: false,
  };

  return this.find(filter)
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .select({ score: { $meta: 'textScore' } })
    .skip((page - 1) * limit)
    .limit(limit);
};

QuestionSchema.pre('save', function (next) {
  if (Array.isArray(this.tags)) {
    this.tags = this.tags
      .map(t => (t || '').toString().trim().toLowerCase())
      .filter(t => t.length > 0);
  }
  next();
});

module.exports = mongoose.model('Question', QuestionSchema);
