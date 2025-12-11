const mongoose = require('mongoose');
const { Schema } = mongoose;
const slugify = require('slugify');

function makeSlugBase(text = '') {
  return slugify(String(text), {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  }).slice(0, 80);
}

// strip HTML tags and collapse whitespace
function stripHtml(input = '') {
  if (!input) return '';
  // remove tags
  let s = String(input).replace(/<[^>]*>/g, ' ');
  // decode common HTML entities minimally (optional)
  s = s.replace(/&nbsp;/gi, ' ');
  // collapse whitespace
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

// create a preview: use first paragraph or first N chars (preserve word boundary)
function makePreviewFromBody(body, maxLen = 200) {
  const text = stripHtml(body);
  if (!text) return '';
  // split by two or more newlines (paragraphs)
  const parts = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  const source = parts.length ? parts[0] : text;
  if (source.length <= maxLen) return source;
  // attempt to cut at last space before maxLen to avoid mid-word truncation
  const cut = source.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > Math.floor(maxLen * 0.6) ? cut.slice(0, lastSpace) : cut) + '...';
}

const articleSchema = new Schema(
  {
    author: {
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
      unique: true,
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
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
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
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
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

// virtuals
articleSchema.virtual('excerpt').get(function () {
  if (this.preview && this.preview.trim().length > 0) {
    return this.preview;
  }
  if (!this.body) return '';
  const plain = this.body.toString();
  if (plain.length <= 200) return plain;
  return plain.slice(0, 200) + '...';
});

articleSchema.virtual('isPublished').get(function () {
  return this.status === 'approved' && !this.deleted;
});

// instance methods
articleSchema.methods.incrementViews = function () {
  return this.constructor
    .findByIdAndUpdate(this._id, { $inc: { views: 1 } }, { new: true })
    .select('views');
};

articleSchema.methods.softDelete = async function () {
  this.deleted = true;
  await this.save();
  return this;
};

// statics
articleSchema.statics.findApproved = function (filter = {}, options = {}) {
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

articleSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, deleted: false });
};

articleSchema.statics.searchPublic = function (query, options = {}) {
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


articleSchema.pre('validate', async function (next) {
  try {
    // generate slug if missing or title changed
    if ((this.isNew || this.isModified('title')) && !this.slug) {
      const base = makeSlugBase(this.title) || Date.now().toString();
      let candidate = base;
      let counter = 0;

      // build filter to exclude current doc _id when checking (useful on updates)
      const existsFilter = (slug) => {
        const q = { slug };
        if (this._id) q._id = { $ne: this._id };
        return q;
      };

      // check for collisions and append suffix if needed
      while (await mongoose.models.Article.exists(existsFilter(candidate))) {
        counter += 1;
        candidate = `${base}-${counter}`;
      }

      this.slug = candidate;
    }

    // auto-generate preview when missing and body exists
    if ((!this.preview || String(this.preview).trim().length === 0) && this.body) {
      // generate with 200-char max preview (you may change to 300/500)
      const generated = makePreviewFromBody(this.body, 200);
      // ensure it respects maxlength (500)
      this.preview = generated.slice(0, 500);
    }

    // preserve publishDate logic
    if (this.isModified('status') && this.status === 'approved' && !this.publishDate) {
      this.publishDate = new Date();
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Article', articleSchema);
