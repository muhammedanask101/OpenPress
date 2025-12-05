const mongoose = require('mongoose');
const { Schema } = mongoose;


const StarSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },

  itemType: {
    type: String,
    enum: ['article', 'answer'],
    required: [true, 'Item type is required'],
    index: true
  },

  itemId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Item ID is required'],
    index: true
  },

  deleted: {
    type: Boolean,
    default: false,
    index: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
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
}
);

StarSchema.index(
  { user: 1, itemType: 1, itemId: 1 },
  { unique: true }
);

StarSchema.index({ itemType: 1, itemId: 1, deleted: 1 });
StarSchema.index({ user: 1, createdAt: -1 });

StarSchema.methods.softDelete = async function () {
  this.deleted = true;
  await this.save();
  return this;
};

StarSchema.methods.restoredeleted = async function () {
  this.deleted = false;
  await this.save();
  return this;
};

// Ensure a star exists (create or restore)
StarSchema.statics.star = async function ({ userId, itemType, itemId }) {
  let star = await this.findOne({ user: userId, itemType, itemId });

  if (!star) {
    star = await this.create({
      user: userId,
      itemType,
      itemId,
      deleted: false,
      createdAt: new Date(),
    });
    return star;
  }

  if (star.deleted) {
    star.deleted = false;
    await star.save();
  }

  return star;
};

// Mark star as deleted (unstar) if exists
StarSchema.statics.unstar = async function ({ userId, itemType, itemId }) {
  const star = await this.findOne({ user: userId, itemType, itemId });
  if (!star) return null;
  if (!star.deleted) {
    star.deleted = true;
    await star.save();
  }
  return star;
};

// Toggle star state, return { starred: boolean, star }
StarSchema.statics.toggle = async function ({ userId, itemType, itemId }) {
  let star = await this.findOne({ user: userId, itemType, itemId });

  if (!star) {
    star = await this.create({
      user: userId,
      itemType,
      itemId,
      deleted: false,
      createdAt: new Date(),
    });
    return { starred: true, star };
  }

  star.deleted = !star.deleted;
  await star.save();
  return { starred: !star.deleted, star };
};

// Count active stars for an item
StarSchema.statics.countStars = function ({ itemType, itemId }) {
  return this.countDocuments({ itemType, itemId, deleted: false });
};

// Check if a given user currently starred an item
StarSchema.statics.hasStarred = async function ({ userId, itemType, itemId }) {
  const star = await this.findOne({
    user: userId,
    itemType,
    itemId,
    deleted: false,
  });
  return !!star;
};


module.exports = mongoose.model('Star', StarSchema);
