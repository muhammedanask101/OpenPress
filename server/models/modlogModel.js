const mongoose = require('mongoose');
const { Schema } = mongoose;

const ModLogSchema = new Schema({

  itemType: {
    type: String,
    enum: [
      'article',
      'question',
      'answer',
      'comment',
      'user',
      'report',
      'settings',
      'system',
      'other'
    ],
    required: [true, 'Item type is required'],
    index: true
  },

  itemId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Item ID is required'],
    index: true
  },

  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true,
    index: true
  },

  actor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },

  reason: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: ''
  },

  meta: {
    type: Schema.Types.Mixed,
    default: {}
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }

}, {
  timestamps: false,
});

module.exports = mongoose.model('ModLog', ModLogSchema);
