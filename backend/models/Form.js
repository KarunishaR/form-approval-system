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
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  formData: {
    type: Map,
    of: String,
  },
  attachments: [{
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  status: {
    type: String,
    enum: ['pending', 'level1_approved', 'approved', 'rejected'],
    default: 'pending',
  },
  approvals: [{
    level: Number,
    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
    },
    remarks: String,
    actionDate: Date,
  }],
  currentApprovalLevel: {
    type: Number,
    default: 1,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
formSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Form', formSchema);