const mongoose = require('mongoose');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  
    .replace(/[\s_-]+/g, '-') 
    .replace(/^-+|-+$/g, '');
}

const articleSchema = mongoose.Schema(
{   author: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        index: true 
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: { 
        type: String, 
        required: true, 
        index: true,
        trim: true,
    },
    body: { 
        type: String, 
        required: true,
        minlength: [20, 'Body must be at least 20 characters'],
        maxlength: [30000, 'Body cannot exceed 30000 characters'], 
    },
    preview: { 
        type: String,
        trim: true,
        maxlength: 500,
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
    },
    status: { 
        type: String, 
        enum: ['pending','approved','rejected'], 
        default: 'pending', 
        index: true,
    },
    publishDate: {
        type: Date,
        index: true,
    },
    views: { 
        type: Number, 
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

ArticleSchema.index({ status: 1, publishDate: -1 });
ArticleSchema.index({ author: 1, createdAt: -1 });
ArticleSchema.index({ title: 'text', body: 'text' });

ArticleSchema.virtual('excerpt').get(function () {
  if (this.preview && this.preview.trim().length > 0) {
    return this.preview;
  }
  if (!this.body) return '';
  const plain = this.body.toString();
  if (plain.length <= 200) return plain;
  return plain.slice(0, 200) + '...';
});

ArticleSchema.virtual('isPublished').get(function () {
  return this.status === 'approved' && !this.deleted;
});

ArticleSchema.methods.incrementViews = async function () {
  this.views = (this.views || 0) + 1;
  await this.save();
  return this.views;
};

ArticleSchema.methods.softDelete = async function () {
  this.deleted = true;
  await this.save();
  return this;
};

ArticleSchema.statics.findApproved = function (filter = {}, options = {}) {
  const { limit = 10, page = 1 } = options;
  return this.find({
    status: 'approved',
    deleted: false,
    ...filter,
  })
    .sort({ publishDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

ArticleSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, deleted: false });
};

ArticleSchema.statics.searchPublic = function (query, options = {}) {
  const { limit = 10, page = 1 } = options;
  const filter = {
    $text: { $search: query },
    status: 'approved',
    deleted: false,
  };

    return this.find(filter)
    .sort({ score: { $meta: 'textScore' } })
    .select({ score: { $meta: 'textScore' } })
    .skip((page - 1) * limit)
    .limit(limit);
};

ArticleSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title || '');
  }

  if (
    this.isModified('status') &&
    this.status === 'approved' &&
    !this.publishDate
  ) {
    this.publishDate = new Date();
  }

  next();
});


module.exports = mongoose.model('Article', articleSchema);