const mongoose = require('mongoose');

const articleSchema = mongoose.Schema(
{
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Admin'
    },
    fileurl: {
        type: String,
        trim: true
    },
    description: {
        type: String
    }
},
{
    timestamps: true
} 
)

module.exports = mongoose.model('Article', articleSchema);