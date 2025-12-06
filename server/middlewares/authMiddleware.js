const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/adminModel')

const getBearerToken = (req) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  return auth.split(' ')[1];
};

const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
};

const protect = asyncHandler(async (req, res, next) => {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token.');
  }

  try {
    const decoded = verifyToken(token);

    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      res.status(401);
      throw new Error('Admin not found');
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error(err);
    res.status(401);
    throw new Error('You are not authorized');
  }
});

const userprotect = asyncHandler(async (req, res, next) => {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    if (user.banned) {
      res.status(403);
      throw new Error('Account is banned');
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401);
    throw new Error('Not authorized');
  }
});


module.exports = { protect, userprotect }