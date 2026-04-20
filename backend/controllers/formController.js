const Form = require('../models/Form');
const Category = require('../models/Category');
const User = require('../models/User');
const sendEmail = require('../config/email');

// Submit a new form
exports.submitForm = async (req, res) => {
  try {
    const { categoryId, title, description, formData } = req.body;

    console.log('Form submission received:', { categoryId, title, formData, body: req.body });

    // Validate required fields early
    if (!categoryId || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'categoryId, title, and description are required',
      });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    if (!category.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This category is currently inactive',
      });
    }

    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      path: file.path,
    })) : [];

    // Safe formData parsing — handles string, object, or undefined
    let parsedFormData = {};
    if (formData) {
      if (typeof formData === 'string') {
        try {
          parsedFormData = JSON.parse(formData);
        } catch (e) {
          console.warn('formData is not valid JSON, using empty object');
        }
      } else if (typeof formData === 'object') {
        parsedFormData = formData;
      }
    }

    // Don't set approverId at all — let schema default handle it
    const approvals = [
      { level: 1, status: 'pending' },
      { level: 2, status: 'pending' },
    ];

    const form = await Form.create({
      studentId: req.user.id,
      category: categoryId,
      title,
      description,
      formData: parsedFormData,
      attachments,
      approvals,
      status: 'pending',
      currentApprovalLevel: 1,
    });

    const populatedForm = await Form.findById(form._id)
      .populate('studentId', 'name email studentId department')
      .populate('category', 'name icon');

    console.log('Form created successfully:', form._id);

    // Email errors won't affect form submission response
    try {
      const level1Staff = await User.findOne({
        role: 'staff',
        approvalLevel: 1,
      });

      if (level1Staff) {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">New Form Submission Awaiting Approval</h2>
            <p>Hello ${level1Staff.name},</p>
            <p>A new form has been submitted and requires your approval:</p>
            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Form Title:</strong> ${title}</p>
              <p><strong>Category:</strong> ${category.name}</p>
              <p><strong>Submitted by:</strong> ${req.user.name}</p>
              <p><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `;

        await sendEmail({
          email: level1Staff.email,
          subject: `New Form Approval Request - ${title}`,
          html,
        });
      } else {
        console.warn('No level 1 staff found to notify');
      }
    } catch (emailError) {
      console.error('Email sending failed (non-fatal):', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Form submitted successfully',
      data: populatedForm,
    });

  } catch (error) {
    console.error('Form submission error:', error.name, error.message);
    if (error.errors) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    res.status(500).json({
      success: false,
      message: 'Form submission failed',
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
};

// Get all forms for a student
exports.getMyForms = async (req, res) => {
  try {
    const { status, category } = req.query;

    const query = { studentId: req.user.id };

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    const forms = await Form.find(query)
      .populate('category', 'name icon')
      .populate('approvals.approverId', 'name designation')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: forms.length,
      data: forms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching forms',
      error: error.message,
    });
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
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    // Check permissions
    if (req.user.role === 'student' && form.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this form',
      });
    }

    res.status(200).json({
      success: true,
      data: form,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching form',
      error: error.message,
    });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).lean();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message,
    });
  }
};

// Delete form
exports.deleteForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    if (form.studentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this form',
      });
    }

    if (form.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a form that has been processed',
      });
    }

    await form.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Form deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting form',
      error: error.message,
    });
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
      data: {
        totalForms,
        pendingForms,
        approvedForms,
        rejectedForms,
        recentForms,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
};