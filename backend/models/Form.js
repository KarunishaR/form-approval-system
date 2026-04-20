const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  formData: {
    type: Object,
    default: {},
  },
  attachments: [{
    filename: String,
    path: String,
  }],
  status: {
    type: String,
    enum: ['pending', 'level1_approved', 'approved', 'rejected'],
    default: 'pending',
  },
  currentApprovalLevel: {
    type: Number,
    default: 1,
  },
  approvals: [{
    level: {
      type: Number,
      required: true,
      enum: [1, 2],
    },
    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    remarks: {
      type: String,
      default: '',
    },
    actionDate: {
      type: Date,
    },
  }],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,  // ✅ handled by default, no pre-save hook needed
  },
});

// ✅ No pre-save hook needed — removed

module.exports = mongoose.model('Form', formSchema);