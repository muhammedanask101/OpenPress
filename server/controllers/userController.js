const asyncHandler = require('express-async-handler');
const User = require('../models/userModel')
const jwt = require('jsonwebtoken');

const generateJWTtoken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '5d' });
};

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, bio, avatarlink } = req.body;

    const normalizedEmail = User.normalizeEmail(email);

    const userExists = await User.findOne({ email: normalizedEmail })
    if (userExists) {
        res.status(400)
        throw new Error('User exists.')
    }


    const user = new User({
        name,
        email: normalizedEmail,
        password, // plain text here – model hook hashes it
        bio: bio ?? '',
        avatarlink: avatarlink ?? '',
    });

    await user.save();

    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateJWTtoken(user._id),
    });

})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const user = await User.findActiveByEmail(email);

    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (user.isLocked()) {
        return res.status(423).json({
        message:
            'Account temporarily locked due to multiple failed login attempts. Please try again later.',
        });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        await user.incFailedLogin();
        return res.status(400).json({ message: 'Invalid email or password' });
    }   

    await user.resetLoginAttempts();
    await User.recordLoginSuccess(user._id, req.ip);

    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateJWTtoken(user._id),
    });
})

const getCurrentUser = asyncHandler(async (req, res) => {

    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    res.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email,
    });
})


const updateUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, email, password, bio, avatarlink } = req.body;

  let hasChanges = false;

  // Select password so pre('save') can re-hash it if changed
  const user = await User.findById(userId).select('+password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (typeof bio !== 'undefined' && bio !== user.bio) {
    user.bio = bio;
    hasChanges = true;
  }

  if (typeof avatarlink !== 'undefined' && avatarlink !== user.avatarlink) {
    user.avatarlink = avatarlink;
    hasChanges = true;
  }

  if (name && name !== user.name) {
    user.name = name;
    hasChanges = true;
  }

    if (email && email !== user.email) {
    const normalizedEmail = User.normalizeEmail(email);

    const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: userId },
    });

    if (existingUser) {
        res.status(400);
        throw new Error('Email is already in use');
    }

    user.email = normalizedEmail;
    hasChanges = true;
  }

  if (password) {
    user.password = password; // plain; model pre('save') will hash
    hasChanges = true;
  }

    if (!hasChanges) {
    res.status(400);
    throw new Error('No fields to update');
  }

  await user.save();

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateJWTtoken(user._id), // new token after changes
  });

});

const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    avatarlink: user.avatarlink,
    banned: user.banned,
  });
});

const softDeleteSelf = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // Uses userSchema.methods.softDelete
  await req.user.softDelete();

  res.status(200).json({
    message: 'Account has been deactivated.',
  });
});

const adminBanUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.banned) {
    return res.status(400).json({ message: 'User is already banned' });
  }

  user.banned = true;
  await user.save();

  res.status(200).json({
    message: 'User banned successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      banned: user.banned,
    },
  });
});

const adminUnbanUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.banned) {
    return res.status(400).json({ message: 'User is not banned' });
  }

  user.banned = false;
  await user.save();

  res.status(200).json({
    message: 'User unbanned successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      banned: user.banned,
    },
  });
});

const adminResetUserSecurity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Need to select fields that are normally select:false
  const user = await User.findById(id).select('+failedLoginAttempts +lockUntil');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.resetLoginAttempts(); // sets failedLoginAttempts = 0 and lockUntil = null

  res.status(200).json({
    message: 'User login attempts and lock have been reset',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      banned: user.banned,
    },
  });
});


module.exports = { 
    registerUser, 
    loginUser, 
    getCurrentUser, 
    updateUser, 
    getUser, 
    softDeleteSelf, 
    adminBanUser, 
    adminUnbanUser, 
    adminResetUserSecurity,
};