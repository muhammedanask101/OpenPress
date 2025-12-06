const express = require('express');
const router = express.Router();

const {
  createContact,
  createPublicContact,
  getContacts,
  getUnhandledContacts,
  getContactById,
  markContactHandled,
  deleteContact
} = require('../controllers/contactController');
const { userprotect, protect } = require('../middlewares/authMiddleware');
const { sanitizeMiddleware, validateBody, schemas } = require('../middlewares/sanitizeMiddleware');

// router.post( '/public', sanitizeMiddleware, validateBody(schemas.contactCreate), createPublicContact );
router.post( '/contact', userprotect, sanitizeMiddleware, validateBody(schemas.contactCreate), createContact );
router.get( '/getcontacts', protect, sanitizeMiddleware, getContacts );
router.get( '/unhandledcontacts', protect, sanitizeMiddleware, getUnhandledContacts );
router.get( '/:id/getcontact', protect, sanitizeMiddleware, getContactById );
router.patch('/:id/contacthandled', protect, sanitizeMiddleware, markContactHandled );
router.delete( '/:id/deletecontact', protect, sanitizeMiddleware, deleteContact );

module.exports = router;
