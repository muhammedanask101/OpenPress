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
    default: Date.now
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: false,
});


module.exports = mongoose.model('Bookmark', BookmarkSchema);
