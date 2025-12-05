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
    minlength: [1, 'Answer must not be empty'],
    maxlength: [10000, 'Answer cannot exceed 10000 characters'],
  },
  deleted: {
    type: Boolean,
    default: false,
    index: true,
  }
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

AnswerSchema.index({ question: 1, createdAt: 1 });
AnswerSchema.index({ author: 1, createdAt: -1 });

AnswerSchema.virtual('excerpt').get(function () {
  if (!this.body) return '';
  const text = this.body.toString();
  if (text.length <= 200) return text;
  return text.slice(0, 200) + '...';
});

AnswerSchema.methods.softDelete = async function () {
  this.deleted = true;
  await this.save();
  return this;
};

AnswerSchema.methods.updateBody = async function (newBody) {
  this.body = (newBody || '').toString();
  await this.save();
  return this;
};

AnswerSchema.statics.findPublicByQuestion = function (
  questionId,
  { page = 1, limit = 20 } = {}
) {
  return this.find({ question: questionId, deleted: false })
    .sort({ createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

AnswerSchema.statics.countPublicByQuestion = function (questionId) {
  return this.countDocuments({ question: questionId, deleted: false });
};

AnswerSchema.pre('save', function (next) {
  if (typeof this.body === 'string') {
    this.body = this.body.replace(/\s+/g, ' ').trim();
  }
  next();
});

module.exports = mongoose.model('Answer', AnswerSchema);
