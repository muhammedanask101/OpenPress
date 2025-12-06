const express = require('express')
const router = express.Router()
const { registerUser, 
    loginUser, 
    getCurrentUser, 
    updateUser, 
    getUser, 
    softDeleteSelf,
    adminBanUser,
    adminUnbanUser,
    adminResetUserSecurity, 
    } = require('../controllers/userController')
const { protect, userprotect } = require('../middlewares/authMiddleware')
const { validateBody, schemas } = require('../middlewares/sanitizeMiddleware');
const { authLimiter } = require('../middlewares/ratelimiterMiddleware');


router.post('/registeruser', authLimiter, validateBody(schemas.userRegister), registerUser)
router.post('/loginuser', authLimiter, validateBody(schemas.userLogin), loginUser)
router.get('/currentuser', userprotect, getCurrentUser)
router.put('/updateuser', userprotect, validateBody(schemas.userRegister.fork(['name', 'password', 'email'], (field) => field.optional())), updateUser );
router.get('/getuser/:id', protect, getUser);
router.delete('/softdelete', userprotect, softDeleteSelf);
router.patch('/:id/ban', protect, adminBanUser);
router.patch('/:id/unban', protect, adminUnbanUser);
router.patch('/:id/resetsecurity', protect, adminResetUserSecurity);

module.exports = router;