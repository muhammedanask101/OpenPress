const express = require('express')
const router = express.Router()
const { registerUser, loginUser, getCurrentUser } = require('../controllers/userController')
const { protect } = require('../middlewares/authMiddleware')

router.post('/', registerUser)
router.post('/login', loginUser)
router.get('/currentuser', protect, getCurrentUser)

module.exports = router;