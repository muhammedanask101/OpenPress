const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        unique: true,
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [40, 'Name cannot exceed 40 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
        index: true,
    },
    password: {
        type: String,
        required: [true, 'Passsword is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        maxlength: [20, 'Password cannot exceed 20 characters'],
        select: false,
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 500,
        default: '',
    },
    avatarlink: {
        type: String,
        trim: true,
        maxlength: 500,
        default: '',
    },
    role: { 
        type: String, 
        enum: ['member','moderator'], 
        default: 'member',
        index: true,
    },
    banned: { 
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
        type: Date 
    },
    lastLoginIp: { 
        type: String 
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
)

// userSchema.index({ email: 1 }, { unique: true });
// userSchema.index({ name: 1 }, { unique: true });
// userSchema.index({ banned: 1 });
// userSchema.index({ role: 1 });

userSchema.statics.normalizeEmail = function (email) {
  return email.toLowerCase().trim();
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incFailedLogin = async function (maxAttempts = 5, lockMinutes = 10) {
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

userSchema.methods.resetLoginAttempts = async function () {
  this.failedLoginAttempts = 0;
  this.lockUntil = null;
  await this.save();
  return this;
};

userSchema.methods.softDelete = async function () {
  this.banned = true;
  await this.save();
  return this;
};

userSchema.statics.findActiveByEmail = function (email) {
  return this.findOne({
    email: email.toLowerCase().trim(),
    banned: false,
  }).select('+password +failedLoginAttempts +lockUntil');
};

userSchema.statics.recordLoginSuccess = async function (userId, ip) {
  return this.findByIdAndUpdate(
    userId,
    { lastLoginAt: new Date(), lastLoginIp: ip },
    { new: true }
  );
};


userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (err) {
    next(err);
  }
});

userSchema.pre('save', function (next) {
  if (this.name) {
    this.name = this.name.trim();
  }
  next();
});



module.exports = mongoose.model('User', userSchema);