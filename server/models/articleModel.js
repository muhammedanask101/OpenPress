const mongoose = require('mongoose');

const articleSchema = mongoose.Schema(
{   author: { 
        type: Schema.Types.ObjectId, ref: 'User', required: true, index: true 
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    slug: { 
        type: String, required: true, index: true 
    },
    body: { 
        type: String, required: true 
    },
    preview: String,

    tags: {
        type: [String],
        default: [],
    },
    status: { 
        type: String, enum: ['pending','approved','rejected'], default: 'pending', index: true 
    },
    publishDate: Date,
    views: { type: Number, default: 0 },
    deleted: { type: Boolean, default: false }
},
{
    timestamps: true
} 
)


module.exports = mongoose.model('Article', articleSchema);