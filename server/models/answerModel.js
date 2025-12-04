// models/answerModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const AnswerSchema = new Schema({
  question: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
    index: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
    index: true
  },
  body: {
    type: String,
    required: [true, 'Answer body is required'],
    trim: true,
    maxlength: 10000
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, 
{
  timestamps: true,
}
);


module.exports = mongoose.model('Answer', AnswerSchema);
