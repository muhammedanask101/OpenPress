const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/adminModel');


const MAX_LOGIN_ATTEMPTS = 5;   
const LOCK_MINUTES = 10;         


const generateAdminJWT = (id) => {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error('ADMIN_JWT_SECRET is not defined');
  }

  return jwt.sign({ id, type: 'admin' }, secret, { expiresIn: '5d' });
};


const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const normalizedEmail = Admin.normalizeEmail(email);

  const existing = await Admin.findOne({ email: normalizedEmail, deleted: false });
  if (existing) {
    res.status(400);
    throw new Error('Admin with this email already exists.');
  }

  const admin = new Admin({
    name,
    email: normalizedEmail,
    password, // model will hash
  });

  await admin.save();

  res.status(201).json({
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    token: generateAdminJWT(admin._id),
  });
});


const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findActiveByEmail(email);

  if (!admin) {
    return res
      .status(400)
      .json({ message: 'Invalid admin credentials, try again...' });
  }

  if (admin.isLocked()) {
    return res.status(423).json({
      message:
        'Admin account locked due to multiple failed login attempts. Please try again later or contact another admin.',
    });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    await admin.incFailedLogin(MAX_LOGIN_ATTEMPTS, LOCK_MINUTES);
    return res
      .status(400)
      .json({ message: 'Invalid admin credentials, try again...' });
  }

  // if successful login, reset attempts and record login info
  await admin.resetLoginAttempts();
  await Admin.recordLoginSuccess(admin._id, req.ip);

  res.status(200).json({
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    token: generateAdminJWT(admin._id),
  });
});


const getCurrentAdmin = asyncHandler(async (req, res) => {
  if (!req.admin) {
    res.status(401);
    throw new Error('Not authorized');
  }

  res.status(200).json({
    id: req.admin._id,
    name: req.admin.name,
    email: req.admin.email,
  });
});


const updateCurrentAdmin = asyncHandler(async (req, res) => {
  const adminId = req.admin.id;
  const { name, email, password } = req.body;

  let hasChanges = false;

  // Need password selected so pre-save can rehash it if changed
  const admin = await Admin.findById(adminId).select(
    '+password +failedLoginAttempts +lockUntil'
  );

  if (!admin || admin.deleted) {
    res.status(404);
    throw new Error('Admin not found');
  }

  if (name && name !== admin.name) {
    admin.name = name;
    hasChanges = true;
  }

  if (email && email !== admin.email) {
    const normalizedEmail = Admin.normalizeEmail(email);

    const existingAdmin = await Admin.findOne({
      email: normalizedEmail,
      _id: { $ne: adminId },
      deleted: false,
    });

    if (existingAdmin) {
      res.status(400);
      throw new Error('Email is already in use by another admin');
    }

    admin.email = normalizedEmail;
    hasChanges = true;
  }

  if (password) {
    admin.password = password; // pre('save') hook will hash
    hasChanges = true;
  }

  if (!hasChanges) {
    res.status(400);
    throw new Error('No fields to update');
  }

  await admin.save();

  res.status(200).json({
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    token: generateAdminJWT(admin._id), // new token if changes are made
  });
});


const softDeleteCurrentAdmin = asyncHandler(async (req, res) => {
  const adminId = req.admin.id;

  const admin = await Admin.findById(adminId);
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  if (admin.deleted) {
    return res.status(400).json({ message: 'Admin account already deleted' });
  }

  admin.deleted = true;
  await admin.save();

  res.status(200).json({
    message: 'Admin account has been deactivated.',
  });
});

module.exports = {
  registerAdmin,
  loginAdmin,
  getCurrentAdmin,
  updateCurrentAdmin,
  softDeleteCurrentAdmin,
};
