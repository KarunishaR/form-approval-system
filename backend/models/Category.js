const mongoose = require('mongoose');

const formFieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'email', 'tel', 'number', 'date', 'time', 'select', 'textarea']
  },
  required: { type: Boolean, default: false },
  placeholder: { type: String },
  options: [{ type: String }],
  min: { type: Number },
  max: { type: Number }
}, { _id: false });

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
  formFields: [formFieldSchema],
  approvers: [{
    level: {
      type: Number,
      required: true,
      enum: [1, 2],
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // ✅ FIXED: was 'required: true', caused save() to crash
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
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);