const User = require('../models/User');
const Form = require('../models/Form');
const Category = require('../models/Category');
const sendEmail = require('../config/email');

// Complete staff profile setup
exports.completeProfile = async (req, res) => {
  try {
    const { staffId, designation, categoryId, approvalLevel } = req.body;

    if (!staffId || !designation || !categoryId || !approvalLevel) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const user = await User.findById(req.user.id);

    if (user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Only staff members can complete this profile',
      });
    }

    user.staffId = staffId;
    user.designation = designation;
    user.categoryHead = categoryId;
    user.approvalLevel = parseInt(approvalLevel);
    await user.save();

    // Update category approvers
    const category = await Category.findById(categoryId);
    
    if (category) {
      category.approvers = category.approvers.filter(
        a => a.staffId.toString() !== user._id.toString()
      );

      category.approvers.push({
        level: parseInt(approvalLevel),
        staffId: user._id,
      });

      category.approvers.sort((a, b) => a.level - b.level);
      await category.save();
    }

    res.status(200).json({
      success: true,
      message: 'Profile completed successfully',
      data: user,
    });
  } catch (error) {
    console.error('Profile completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile completion failed',
      error: error.message,
    });
  }
};

// Get forms pending for approval - FIXED VERSION
exports.getPendingForms = async (req, res) => {
  try {
    const staff = await User.findById(req.user.id);

    if (!staff.approvalLevel) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile setup first',
      });
    }

    console.log('Staff approval level:', staff.approvalLevel);

    // Get ALL pending forms based on approval level
    let query = {};
    
    if (staff.approvalLevel === 1) {
      // Level 1 sees all forms with status 'pending'
      query.status = 'pending';
      query.currentApprovalLevel = 1;
    } else if (staff.approvalLevel === 2) {
      // Level 2 sees all forms with status 'level1_approved'
      query.status = 'level1_approved';
      query.currentApprovalLevel = 2;
    }

    console.log('Query:', query);

    const forms = await Form.find(query)
      .populate('studentId', 'name email studentId department')
      .populate('category', 'name icon')
      .populate('approvals.approverId', 'name designation approvalLevel')
      .sort({ submittedAt: -1 });

    console.log('Found forms:', forms.length);

    res.status(200).json({
      success: true,
      count: forms.length,
      data: forms,
    });
  } catch (error) {
    console.error('Error fetching pending forms:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending forms',
      error: error.message,
    });
  }
};

// Get all forms for staff dashboard
exports.getAllForms = async (req, res) => {
  try {
    const { status, category } = req.query;
    
    const query = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    const forms = await Form.find(query)
      .populate('studentId', 'name email studentId department')
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

// Process form (approve/reject) - FIXED VERSION
exports.processForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const { action, remarks } = req.body;

    console.log('Processing form:', formId, 'Action:', action);

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "approve" or "reject"',
      });
    }

    const form = await Form.findById(formId)
      .populate('studentId', 'name email')
      .populate('category', 'name')
      .populate('approvals.approverId', 'name email designation approvalLevel');

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    const staff = await User.findById(req.user.id);
    
    console.log('Staff level:', staff.approvalLevel, 'Form status:', form.status);

    // Check if correct approval level
    if (staff.approvalLevel === 2 && form.status !== 'level1_approved') {
      return res.status(400).json({
        success: false,
        message: 'This form must be approved by Level 1 first',
      });
    }

    if (staff.approvalLevel === 1 && form.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This form has already been processed',
      });
    }

    // Find or create approval entry
    let approvalIndex = form.approvals.findIndex(
      a => a.level === staff.approvalLevel && a.status === 'pending'
    );

    console.log('Approval index:', approvalIndex);

    // If no approval entry exists, create one
    if (approvalIndex === -1) {
      console.log('Creating new approval entry for level', staff.approvalLevel);
      form.approvals.push({
        level: staff.approvalLevel,
        approverId: req.user.id,
        status: 'pending',
      });
      approvalIndex = form.approvals.length - 1;
    }

    // Update the approval
    form.approvals[approvalIndex].status = action === 'approve' ? 'approved' : 'rejected';
    form.approvals[approvalIndex].remarks = remarks || '';
    form.approvals[approvalIndex].actionDate = new Date();
    form.approvals[approvalIndex].approverId = req.user.id;

    // Update form status
    if (action === 'reject') {
      form.status = 'rejected';
    } else if (staff.approvalLevel === 1) {
      form.status = 'level1_approved';
      form.currentApprovalLevel = 2;
    } else if (staff.approvalLevel === 2) {
      form.status = 'approved';
    }

    console.log('New form status:', form.status);

    await form.save();

    // Send email notification
    try {
      const studentEmail = form.studentId.email;
      const studentName = form.studentId.name;
      const statusText = form.status === 'approved' ? 'Approved' : 
                         form.status === 'rejected' ? 'Rejected' : 
                         'Partially Approved (Level 1)';

      let nextStepMessage = '';
      if (form.status === 'level1_approved') {
        nextStepMessage = '<p style="color: #F59E0B;">Your form is now pending Level 2 approval.</p>';
      }

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Form Status Update</h2>
          <p>Hello ${studentName},</p>
          <p>Your form submission has been processed:</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Form Title:</strong> ${form.title}</p>
            <p><strong>Category:</strong> ${form.category.name}</p>
            <p><strong>Status:</strong> <span style="color: ${form.status === 'approved' ? '#10B981' : form.status === 'rejected' ? '#EF4444' : '#F59E0B'};">${statusText}</span></p>
            <p><strong>Processed by:</strong> ${staff.name} (${staff.designation}) - Level ${staff.approvalLevel}</p>
            ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ''}
          </div>
          ${nextStepMessage}
        </div>
      `;

      await sendEmail({
        email: studentEmail,
        subject: `Form ${statusText} - ${form.title}`,
        html,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    // Notify Level 2 if approved by Level 1
    if (form.status === 'level1_approved') {
      try {
        // Find a Level 2 staff member
        const level2Staff = await User.findOne({ 
          role: 'staff', 
          approvalLevel: 2 
        });

        if (level2Staff) {
          const level2Html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">Form Awaiting Your Approval (Level 2)</h2>
              <p>Hello ${level2Staff.name},</p>
              <p>A form has been approved by Level 1 and now requires your approval:</p>
              <div style="background-color: #F3F4F6; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Form Title:</strong> ${form.title}</p>
                <p><strong>Category:</strong> ${form.category.name}</p>
                <p><strong>Submitted by:</strong> ${form.studentId.name}</p>
                <p><strong>Level 1 Approved by:</strong> ${staff.name}</p>
              </div>
            </div>
          `;

          await sendEmail({
            email: level2Staff.email,
            subject: `Level 2 Approval Required - ${form.title}`,
            html: level2Html,
          });
        }
      } catch (emailError) {
        console.error('Level 2 notification email failed:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: `Form ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      data: form,
    });
  } catch (error) {
    console.error('Form processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing form',
      error: error.message,
    });
  }
};

// Get staff dashboard statistics
exports.getStaffStats = async (req, res) => {
  try {
    const staff = await User.findById(req.user.id);

    const totalForms = await Form.countDocuments({});

    let pendingQuery = {};
    
    if (staff.approvalLevel === 1) {
      pendingQuery.status = 'pending';
      pendingQuery.currentApprovalLevel = 1;
    } else if (staff.approvalLevel === 2) {
      pendingQuery.status = 'level1_approved';
      pendingQuery.currentApprovalLevel = 2;
    }

    const pendingForms = await Form.countDocuments(pendingQuery);

    const approvedForms = await Form.countDocuments({
      'approvals.approverId': req.user.id,
      'approvals.status': 'approved',
    });

    const rejectedForms = await Form.countDocuments({
      'approvals.approverId': req.user.id,
      'approvals.status': 'rejected',
    });

    const recentActions = await Form.find({
      'approvals.approverId': req.user.id,
      'approvals.status': { $in: ['approved', 'rejected'] },
    })
      .populate('studentId', 'name')
      .populate('category', 'name icon')
      .sort({ updatedAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalForms,
        pendingForms,
        approvedForms,
        rejectedForms,
        recentActions,
        approvalLevel: staff.approvalLevel,
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

// Create a new category (admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon, formFields } = req.body;

    const category = await Category.create({
      name,
      description,
      icon: icon || '📄',
      formFields: formFields || [],
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message,
    });
  }
};