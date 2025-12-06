const express = require('express');
const router = express.Router();

const { protect, userprotect } = require('../middlewares/authMiddleware');
const { sanitizeMiddleware, validateBody, schemas, } = require('../middlewares/sanitizeMiddleware');

const reportController = require('../controllers/reportController');

router.use(sanitizeMiddleware);

// user

// Create a new report
router.post( '/createreport', userprotect, validateBody(schemas.reportCreate), reportController.createReport );

// admin

// List reports with filters
router.get('/getreports', protect, reportController.getReports);

// Reports for specific item
router.get('/itemreport', protect, reportController.getReportsForItem);

// Get single report
router.get('/getreport/:id', protect, reportController.getReportById);

// Update intermediate status (open/reviewing) & notes
router.patch('/updatereport/:id', protect, reportController.updateReport);

// Resolve report
router.post('/:id/resolvereport', protect, reportController.resolveReport);

// Reject report
router.post('/:id/rejectreport', protect, reportController.rejectReport);

// Soft delete report
router.delete('/deletereport/:id', protect, reportController.deleteReport);

module.exports = router;
