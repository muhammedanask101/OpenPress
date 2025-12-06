const asyncHandler = require('express-async-handler');
const Contact = require('../models/contactModel');


function buildRequestMetadata(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip =
    (typeof forwardedFor === 'string' && forwardedFor.split(',')[0].trim()) ||
    req.ip;

  const user = req.user || {};

  return {
    userId:
      user.id ||
      (user._id ? user._id.toString() : null),
    username: user.name || null,
    userEmail: user.email || null,
    ip,
    timestamp: new Date().toISOString(),
  };
}


const createContact = asyncHandler(async (req, res) => {

  const { name, email, message } = req.body;

  const contact = await Contact.create({ name, email, message });
  const metadata = buildRequestMetadata(req);

  res.status(201).json({
    contact,
    metadata,
  });
});


const createPublicContact = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  const contact = await Contact.create({ name, email, message });

 
  const metadata = buildRequestMetadata(req);
  console.log('Public contact metadata:', metadata);

  res.status(201).json({
    contact,
  });
});


const getContacts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const rawLimit = parseInt(req.query.limit, 10) || 20;
  const limit = Math.min(Math.max(rawLimit, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (typeof req.query.handled !== 'undefined') {
    filter.handled = req.query.handled === 'true';
  }

  const [items, total] = await Promise.all([
    Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Contact.countDocuments(filter),
  ]);

  const metadata = buildRequestMetadata(req);

  res.status(200).json({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
    metadata,
  });
});


const getUnhandledContacts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const rawLimit = parseInt(req.query.limit, 10) || 20;
  const limit = Math.min(Math.max(rawLimit, 1), 100);

  const [items, total] = await Promise.all([
    Contact.findUnhandled({ page, limit }),
    Contact.countDocuments({ handled: false }),
  ]);

  const metadata = buildRequestMetadata(req);

  res.status(200).json({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
    metadata,
  });
});


const getContactById = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }

  const metadata = buildRequestMetadata(req);

  res.status(200).json({
    contact,
    metadata,
  });
});


const markContactHandled = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }


  const updated = await contact.markasHandled();
  const metadata = buildRequestMetadata(req);

  res.status(200).json({
    contact: updated,
    metadata,
  });
});


const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }

  await contact.deleteOne();
  const metadata = buildRequestMetadata(req);

  res.status(200).json({
    id: req.params.id,
    deleted: true,
    metadata,
  });
});

module.exports = {
  createContact,
  createPublicContact,
  getContacts,
  getUnhandledContacts,
  getContactById,
  markContactHandled,
  deleteContact,
};
