const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '📄',
  },
  formFields: [{
    name: String,
    label: String,
    type: String,
    required: Boolean,
    options: [String],
    placeholder: String,
    min: Number,
    max: Number,
  }],
  approvers: [{
    level: {
      type: Number,
      required: true,
      enum: [1, 2],
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Category', categorySchema);