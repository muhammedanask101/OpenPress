const mongoose = require('mongoose');
const { Schema } = mongoose;


const ReportSchema = new Schema({
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter is required'],
    index: true
  },
  itemType: {
    type: String,
    required: [true, 'Item type is required'],
    enum: ['article', 'question', 'answer', 'user', 'comment', 'other'],
    index: true
  },
  itemId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Item id is required'],
    index: true
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    index: true
  },
  details: {
    type: String,
    trim: true,
    maxlength: 5000
  },
  snapshot: {
    type: Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['open', 'reviewing', 'resolved', 'rejected'],
    default: 'open',
    index: true
  },
  actionTaken: {
    type: String,
    trim: true,
    default: 'none'
  },
  handledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  addons: {
    type: Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  resolvedAt: {
    type: Date
  },
  deleted: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: false,
});


module.exports = mongoose.model('Report', ReportSchema);
