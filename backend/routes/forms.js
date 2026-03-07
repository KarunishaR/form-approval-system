const express = require('express');
const router = express.Router();
const { protect, authorize, verifyEmail } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  submitForm,
  getMyForms,
  getFormById,
  getCategories,
  deleteForm,
  getStudentStats,
} = require('../controllers/formController');

router.use(protect);
router.use(verifyEmail);

router.post('/submit', authorize('student'), upload.array('attachments', 5), submitForm);
router.get('/my-forms', authorize('student'), getMyForms);
router.get('/stats', authorize('student'), getStudentStats);
router.get('/categories', getCategories);
router.get('/:id', getFormById);
router.delete('/:id', authorize('student'), deleteForm);

module.exports = router;