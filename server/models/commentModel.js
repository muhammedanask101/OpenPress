const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },

    article: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, 'Article is required'],
      index: true,
    },

    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true,
    },

    body: {
      type: String,
      required: [true, 'Comment body is required'],
      trim: true,
      minlength: [1, 'Comment must not be empty'],
      maxlength: [5000, 'Comment cannot exceed 5000 characters'],
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


CommentSchema.index({ article: 1, createdAt: 1 });
CommentSchema.index({ article: 1, parent: 1, createdAt: 1 });
CommentSchema.index({ user: 1, createdAt: -1 });

// Is this a reply?
CommentSchema.virtual('isReply').get(function () {
  return !!this.parent;
});

// Short preview
CommentSchema.virtual('shortExcerpt').get(function () {
  if (!this.body) return '';
  const text = this.body.toString();
  if (text.length <= 120) return text;
  return text.slice(0, 120) + '...';
});

CommentSchema.methods.softDelete = async function () {
  this.deleted = true;
  await this.save();
  return this;
};

CommentSchema.methods.restore = async function () {
  this.deleted = false;
  await this.save();
  return this;
};

// Which user does this belong to?
CommentSchema.methods.belongsTo = function (userId) {
  return this.user && this.user.toString() === userId.toString();
};

// All non-deleted comments for an article, oldest first
CommentSchema.statics.findPublicForArticle = function (
  articleId,
  { page = 1, limit = 50 } = {}
) {
  return this.find({ article: articleId, deleted: false })
    .sort({ createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

CommentSchema.statics.countPublicForArticle = function (articleId) {
  return this.countDocuments({ article: articleId, deleted: false });
};

// Replies to a specific comment
CommentSchema.statics.findReplies = function (
  parentId,
  { page = 1, limit = 50 } = {}
) {
  return this.find({ parent: parentId, deleted: false })
    .sort({ createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

CommentSchema.pre('save', function (next) {
  if (typeof this.body === 'string') {
    this.body = this.body.replace(/\s+/g, ' ').trim();
  }
  next();
});

module.exports = mongoose.model('Comment', CommentSchema);
