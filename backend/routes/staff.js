const express = require('express');
const router = express.Router();
const { protect, authorize, verifyEmail } = require('../middleware/auth');
const {
  completeProfile,
  getPendingForms,
  getAllForms,
  processForm,
  getStaffStats,
  createCategory,
} = require('../controllers/staffController');

// ✅ complete-profile does NOT require verifyEmail
// Staff need to complete profile as part of onboarding, before email may be verified
router.post('/complete-profile', protect, authorize('staff', 'admin'), completeProfile);

// All other routes require email verification
router.use(protect);
router.use(authorize('staff', 'admin'));
router.use(verifyEmail);

router.get('/pending-forms', getPendingForms);
router.get('/all-forms', getAllForms);
router.post('/process-form/:formId', processForm);
router.get('/stats', getStaffStats);
router.post('/categories', authorize('admin'), createCategory);

module.exports = router;