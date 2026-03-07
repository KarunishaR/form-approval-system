const Form = require('../models/Form');
const Category = require('../models/Category');
const User = require('../models/User');
const sendEmail = require('../config/email');

// Submit a new form
exports.submitForm = async (req, res) => {
  try {
    const { categoryId, title, description, formData } = req.body;

    const category = await Category.findById(categoryId).populate('approvers.staffId');

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (!category.isActive) {
      return res.status(400).json({ success: false, message: 'This category is currently inactive' });
    }

    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      path: file.path,
    })) : [];

    // ✅ FIXED: Filter out null staffId entries before mapping
    const approvals = category.approvers
      .filter(approver => approver.staffId && approver.staffId._id)
      .sort((a, b) => a.level - b.level)
      .map(approver => ({
        level: approver.level,
        approverId: approver.staffId._id,
        status: 'pending',
      }));

    if (approvals.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No approvers assigned to this category yet. Please contact admin.',
      });
    }

    const form = await Form.create({
      studentId: req.user.id,
      category: categoryId,
      title,
      description,
      formData: formData ? JSON.parse(formData) : {},
      attachments,
      approvals,
    });

    const populatedForm = await Form.findById(form._id)
      .populate('studentId', 'name email studentId department')
      .populate('category', 'name')
      .populate('approvals.approverId', 'name email designation');

    // Send email notification to Level 1 approver
    const level1Approver = category.approvers.find(a => a.level === 1 && a.staffId);
    if (level1Approver) {
      try {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">New Form Submission Awaiting Approval</h2>
            <p>Hello ${level1Approver.staffId.name},</p>
            <p>A new form has been submitted and requires your approval:</p>
            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Form Title:</strong> ${title}</p>
              <p><strong>Category:</strong> ${category.name}</p>
              <p><strong>Submitted by:</strong> ${req.user.name}</p>
              <p><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/staff/forms/${form._id}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Review Form
              </a>
            </div>
          </div>
        `;
        await sendEmail({
          email: level1Approver.staffId.email,
          subject: `New Form Approval Request - ${title}`,
          html,
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Form submitted successfully',
      data: populatedForm,
    });
  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({ success: false, message: 'Form submission failed', error: error.message });
  }
};

// Get all forms for a student
exports.getMyForms = async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = { studentId: req.user.id };
    if (status) query.status = status;
    if (category) query.category = category;

    const forms = await Form.find(query)
      .populate('category', 'name icon')
      .populate('approvals.approverId', 'name designation')
      .sort({ submittedAt: -1 });

    res.status(200).json({ success: true, count: forms.length, data: forms });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching forms', error: error.message });
  }
};

// Get single form details
exports.getFormById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id)
      .populate('studentId', 'name email studentId department phone')
      .populate('category', 'name description icon')
      .populate('approvals.approverId', 'name email designation staffId');

    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    if (req.user.role === 'student' && form.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this form' });
    }

    res.status(200).json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching form', error: error.message });
  }
};

// Get all categories WITH formFields
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('approvers.staffId', 'name designation')
      .lean();

    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Error fetching categories', error: error.message });
  }
};

// Delete form (only if pending)
exports.deleteForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    if (form.studentId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this form' });
    }

    if (form.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot delete a form that has been processed' });
    }

    await form.deleteOne();
    res.status(200).json({ success: true, message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting form', error: error.message });
  }
};

// Get dashboard statistics for student
exports.getStudentStats = async (req, res) => {
  try {
    const totalForms = await Form.countDocuments({ studentId: req.user.id });
    const pendingForms = await Form.countDocuments({ studentId: req.user.id, status: 'pending' });
    const approvedForms = await Form.countDocuments({ studentId: req.user.id, status: 'approved' });
    const rejectedForms = await Form.countDocuments({ studentId: req.user.id, status: 'rejected' });

    const recentForms = await Form.find({ studentId: req.user.id })
      .populate('category', 'name icon')
      .sort({ submittedAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: { totalForms, pendingForms, approvedForms, rejectedForms, recentForms },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching statistics', error: error.message });
  }
};