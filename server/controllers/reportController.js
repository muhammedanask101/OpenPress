const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Report = require('../models/reportModel');

//  USER: CREATE REPORT 

// @desc    Create a new report
// @route   POST /api/reports
// @access  User (userprotect)
exports.createReport = asyncHandler(async (req, res) => {
  const reporterId = req.user._id;
  const { itemType, itemId, reason, details } = req.body; // validated by schemas.reportCreate

  const report = await Report.create({
    reporter: reporterId,
    itemType,
    itemId,
    reason,
    details: details || '',
    // snapshot/addons intentionally NOT set from user input for security
  });

  res.status(201).json(report);
});

//  ADMIN: LIST + GET REPORTS 

// @desc    Get reports with filters (admin)
// @route   GET /api/reports
// @access  Admin (protect)
exports.getReports = asyncHandler(async (req, res) => {
  const {
    status,
    itemType,
    reporter,
    handledBy,
    itemId,
    page = 1,
    limit = 20,
  } = req.query;

  const filter = { deleted: false };

  if (status) {
    const allowedStatuses = ['open', 'reviewing', 'resolved', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    filter.status = status;
  }

  if (itemType) {
    const allowedTypes = [
      'article',
      'question',
      'answer',
      'user',
      'comment',
      'other',
    ];
    const lower = String(itemType).toLowerCase();
    if (!allowedTypes.includes(lower)) {
      return res.status(400).json({ message: 'Invalid itemType' });
    }
    filter.itemType = lower;
  }

  if (reporter) {
    if (!mongoose.Types.ObjectId.isValid(reporter)) {
      return res.status(400).json({ message: 'Invalid reporter id' });
    }
    filter.reporter = reporter;
  }

  if (handledBy) {
    if (!mongoose.Types.ObjectId.isValid(handledBy)) {
      return res.status(400).json({ message: 'Invalid handledBy id' });
    }
    filter.handledBy = handledBy;
  }

  if (itemId) {
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid itemId' });
    }
    filter.itemId = itemId;
  }

  let pageNum = parseInt(page, 10) || 1;
  let limitNum = parseInt(limit, 10) || 20;

  if (pageNum < 1) pageNum = 1;
  if (limitNum < 1) limitNum = 1;
  if (limitNum > 100) limitNum = 100;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Report.countDocuments(filter),
  ]);

  res.json({
    page: pageNum,
    limit: limitNum,
    total,
    reports,
  });
});

// @desc    Get a single report by ID
// @route   GET /api/reports/:id
// @access  Admin (protect)
exports.getReportById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid report id' });
  }

  const report = await Report.findOne({ _id: id, deleted: false });
  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }

  res.json(report);
});

// @desc    Get reports for a specific item
// @route   GET /api/reports/item
// @access  Admin (protect)
// @query   itemType, itemId, onlyOpen=true|false
exports.getReportsForItem = asyncHandler(async (req, res) => {
  const { itemType, itemId, onlyOpen = 'false' } = req.query;

  const allowedTypes = [
    'article',
    'question',
    'answer',
    'user',
    'comment',
    'other',
  ];

  if (!itemType || !itemId) {
    return res
      .status(400)
      .json({ message: 'itemType and itemId are required' });
  }

  const lower = String(itemType).toLowerCase();
  if (!allowedTypes.includes(lower)) {
    return res.status(400).json({ message: 'Invalid itemType' });
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ message: 'Invalid itemId' });
  }

  const onlyOpenBool = onlyOpen === 'true';

  const reports = onlyOpenBool
    ? await Report.openForItem(lower, itemId)
    : await Report.forItem(lower, itemId);

  res.json(reports);
});

// ADMIN: UPDATE / RESOLVE / REJECT / DELETE

// @desc    Update report status (open/reviewing) and notes
// @route   PATCH /api/reports/:id
// @access  Admin (protect)
exports.updateReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid report id' });
  }

  const report = await Report.findOne({ _id: id, deleted: false });
  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }

  if (status) {
    const allowedIntermediate = ['open', 'reviewing'];
    if (!allowedIntermediate.includes(status)) {
      return res.status(400).json({
        message:
          'Invalid status. Use /resolve or /reject endpoints for final states.',
      });
    }
    report.status = status;
    // moving back to open/reviewing should clear resolvedAt
    report.resolvedAt = null;
  }

  if (typeof notes === 'string') {
    report.notes = notes;
  }

  await report.save();
  res.json(report);
});

// @desc    Mark report as resolved
// @route   POST /api/reports/:id/resolve
// @access  Admin (protect)
exports.resolveReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { actionTaken = 'none', notes = '' } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid report id' });
  }

  const report = await Report.findOne({ _id: id, deleted: false });
  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }

  await report.markResolved({
    handledBy: req.admin._id,
    actionTaken,
    notes,
  });

  res.json(report);
});

// @desc    Mark report as rejected
// @route   POST /api/reports/:id/reject
// @access  Admin (protect)
exports.rejectReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes = '' } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid report id' });
  }

  const report = await Report.findOne({ _id: id, deleted: false });
  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }

  await report.markRejected({
    handledBy: req.admin._id,
    notes,
  });

  res.json(report);
});

// @desc    Soft delete a report
// @route   DELETE /api/reports/:id
// @access  Admin (protect)
exports.deleteReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid report id' });
  }

  const report = await Report.findOne({ _id: id, deleted: false });
  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }

  await report.softDelete();

  res.json({ message: 'Report soft-deleted', report });
});
