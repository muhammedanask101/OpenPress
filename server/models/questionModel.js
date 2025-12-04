// models/questionModel.js
const mongoose = require('mongoose');

const { Schema } = mongoose;

const QuestionSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    maxlength: 100,
  },
  context: {
    type: String,
    trim: true
  },
  tags: {
    type: [String],
    default: [],
  },
  views: { type: Number, default: 0 },
  deleted: { type: Boolean, default: false }
}, 
{
  timestamps: true,
}
);

module.exports = mongoose.model('Question', QuestionSchema);
