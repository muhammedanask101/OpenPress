const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'name is required'],
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"], 
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'email is required'],
            unique: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
            index: true,
        },
        password: {
            type: String,
            required: [true, 'password is required'],
            minlength: [8, "Password must be at least 8 characters"], 
            select: false,
        },
        deleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        failedLoginAttempts: {
            type: Number,
            default: 0,
            select: false,
        },
        lastLoginAt: {
            type: Date,
        },
            lastLoginIp: {
            type: String,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
        virtuals: true,
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.failedLoginAttempts;
            delete ret.lockUntil;
            return ret;
        },
        },
        toObject: {
        virtuals: true,
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.failedLoginAttempts;
            delete ret.lockUntil;
            return ret;
        },
        },
    }
);

AdminSchema.index({ email: 1 }, { unique: true });
AdminSchema.index({ deleted: 1 });
AdminSchema.index({ lockUntil: 1 });

AdminSchema.statics.incrementFailedLoginAttempts = async function (adminId) {
  return this.findByIdAndUpdate(
    adminId,
    { $inc: { failedLoginAttempts: 1 } },
    { new: true }
  );
};

AdminSchema.statics.recordLoginSuccess = async function (adminId, ip) {
  return this.findByIdAndUpdate(
    adminId,
    { lastLoginAt: new Date(), lastLoginIp: ip || undefined },
    { new: true }
  );
};

AdminSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();
    const saltRounds = 10;
    const hash = await bcrypt.hash(this.password, saltRounds);
    this.password = hash;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Admin', adminSchema);