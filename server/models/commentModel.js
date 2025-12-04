const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema({
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

  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },

  body: {
    type: String,
    required: [true, 'Comment body is required'],
    trim: true,
    maxlength: 5000
  },

  deleted: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: false,
});


module.exports = mongoose.model('Comment', CommentSchema);
