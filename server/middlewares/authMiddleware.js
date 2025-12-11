const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Admin = require('../models/adminModel');
const User = require('../models/temp');

const getBearerToken = (req) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  return auth.split(' ')[1];
};

const verifyAdminToken = (token) => {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error('ADMIN_JWT_SECRET is not defined');
  }
  return jwt.verify(token, secret);
};

const verifyUserToken = (token) => {
  const secret = process.env.USER_JWT_SECRET;
  if (!secret) {
    throw new Error('USER_JWT_SECRET is not defined');
  }
  return jwt.verify(token, secret);
};

const authEither = asyncHandler(async (req, res, next) => {
  const token = getBearerToken(req);
  if (!token) {
 
    return next();
  }

 
  try {
    const decodedAdmin = verifyAdminToken(token);
    if (decodedAdmin && decodedAdmin.type === 'admin') {
      const Admin = require('../models/adminModel');
      const admin = await Admin.findById(decodedAdmin.id).select('-password');
      if (admin && !admin.deleted) {
        req.admin = admin;
        return next();
      }
    }
  } catch (err) {
  }


  try {
    const decodedUser = verifyUserToken(token);
    if (decodedUser && decodedUser.type === 'user') {
      const User = require('../models/temp');
      const user = await User.findById(decodedUser.id).select('-password');
      if (user && !user.banned) {
        req.user = user;
        return next();
      }
    }
  } catch (err) {
  }

  return next();
});

const protect = asyncHandler(async (req, res, next) => {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token.');
  }

  try {
    const decoded = verifyAdminToken(token);

    if (decoded.type !== 'admin') {
      res.status(401);
      throw new Error('Not authorized as admin');
    }

    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin || admin.deleted) {
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
    const decoded = verifyUserToken(token);

    if (decoded.type !== 'user') {
      res.status(401);
      throw new Error('Not authorized as user');
    }

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

module.exports = { authEither, protect, userprotect };
