const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        unique: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Passsword is required'],
        select: false,
    },
    bio: {
        type: String,
    },
    avatarlink: {
        type: String,
    },
    role: { 
        type: String, enum: ['member','moderator'], default: 'member' 
    },
    banned: { 
        type: Boolean, default: false 
    },
    },
    { timestamps: true }
)

module.exports = mongoose.model('User', userSchema);