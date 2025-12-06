const express = require('express');
const router = express.Router();

const {
  registerAdmin,
  loginAdmin,
  getCurrentAdmin,
  updateCurrentAdmin,
  softDeleteCurrentAdmin,
} = require('../controllers/adminController');

const { protect } = require('../middlewares/authMiddleware');
const { validateBody, schemas } = require('../middleware/sanitizeMiddleware');
const { authLimiter } = require('../middleware/ratelimiterMiddleware');


router.post('/login', authLimiter, validateBody(schemas.adminLogin), loginAdmin);
router.post('/register', protect, validateBody(schemas.adminRegister), registerAdmin);
router.get('/currentadmin', protect, getCurrentAdmin);
router.put('/updatecurrentadmin', protect, validateBody(schemas.adminRegister.fork(['name', 'email', 'password'], (field) => field.optional())), updateCurrentAdmin );
router.delete('/currentadmin', protect, softDeleteCurrentAdmin);

module.exports = router;

