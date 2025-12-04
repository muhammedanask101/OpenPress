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
    index: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}, 
{
  timestamps: false,
}
);


module.exports = mongoose.model('Star', StarSchema);
