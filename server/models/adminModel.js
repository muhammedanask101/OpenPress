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
            lowercase: true, 
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
        lockUntil: {
          type: Date,
          default: null,
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

// adminSchema.index({ email: 1 }, { unique: true });
// adminSchema.index({ deleted: 1 });
// adminSchema.index({ lockUntil: 1 });

adminSchema.statics.normalizeEmail = function (email) {
  return email.toLowerCase().trim();
};

adminSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

adminSchema.methods.incFailedLogin = async function (
  maxAttempts = 5,
  lockMinutes = 10
) {
  // If lock expired, reset counters
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.failedLoginAttempts = 0;
    this.lockUntil = null;
  }

  this.failedLoginAttempts += 1;

  if (this.failedLoginAttempts >= maxAttempts) {
    this.lockUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
  }

  await this.save();
  return this;
};

adminSchema.methods.resetLoginAttempts = async function () {
  this.failedLoginAttempts = 0;
  this.lockUntil = null;
  await this.save();
  return this;
};

adminSchema.statics.recordLoginSuccess = async function (adminId, ip) {
  return this.findByIdAndUpdate(
    adminId,
    { lastLoginAt: new Date(), lastLoginIp: ip || undefined },
    { new: true }
  );
};

adminSchema.statics.findActiveByEmail = function (email) {
  const normalized = this.normalizeEmail(email);
  return this.findOne({
    email: normalized,
    deleted: false,
  }).select('+password +failedLoginAttempts +lockUntil');
};

adminSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();

    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Admin', adminSchema);