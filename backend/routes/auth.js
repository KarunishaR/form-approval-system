const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  verifyEmail,
  getMe,
  updateProfile,
  resendVerification,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
if (process.env.NODE_ENV === 'development') {
  router.delete('/dev-delete-all-users', async (req, res) => {
    try {
      const User = require('../models/User');
      const result = await User.deleteMany({});
      
      res.status(200).json({
        success: true,
        message: `Deleted ${result.deletedCount} users`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete users',
        error: error.message,
      });
    }
  });
}

module.exports = router;