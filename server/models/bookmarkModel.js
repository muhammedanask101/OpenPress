const mongoose = require('mongoose');
const { Schema } = mongoose;


const BookmarkSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  itemType: {
    type: String,
    enum: ['article', 'question', 'answer'],
    required: [true, 'Item type is required'],
    index: true
  },
  itemId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Item ID is required'],
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  deleted: {
    type: Boolean,
    default: false,
    index: true,
  }
}, {
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

BookmarkSchema.index(
  { user: 1, itemType: 1, itemId: 1 },
  { unique: true }
);
BookmarkSchema.index({ user: 1, deleted: 1, createdAt: -1 });

BookmarkSchema.methods.softDelete = async function () {
  this.deleted = true;
  await this.save();
  return this;
};

BookmarkSchema.methods.restoredeleted = async function () {
  this.deleted = false;
  await this.save();
  return this;
};

// Toggle bookmark on/off for a given item
BookmarkSchema.statics.toggle = async function ({ userId, itemType, itemId }) {
  let doc = await this.findOne({ user: userId, itemType, itemId });

  if (!doc) {
    // create new bookmark
    doc = await this.create({
      user: userId,
      itemType,
      itemId,
      deleted: false,
      createdAt: new Date(),
    });
    return { bookmarked: true, bookmark: doc };
  }

  // flip deleted flag
  doc.deleted = !doc.deleted;
  await doc.save();
  return { bookmarked: !doc.deleted, bookmark: doc };
};

// Check if user has this bookmarked
BookmarkSchema.statics.isBookmarked = async function ({ userId, itemType, itemId }) {
  const doc = await this.findOne({
    user: userId,
    itemType,
    itemId,
    deleted: false,
  });
  return !!doc;
};

// Get all active bookmarks for a user (optionally filter by type)
BookmarkSchema.statics.getUserBookmarks = function (userId, { itemType, limit = 50, page = 1 } = {}) {
  const filter = {
    user: userId,
    deleted: false,
  };
  if (itemType) filter.itemType = itemType;

  return this.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

 BookmarkSchema.pre('save', function (next) {
   this.itemType = this.itemType.toLowerCase();
   next();
 });


module.exports = mongoose.model('Bookmark', BookmarkSchema);
