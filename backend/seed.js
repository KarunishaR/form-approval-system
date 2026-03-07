require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');

const categories = [
  {
    name: 'Leave Application',
    description: 'Apply for various types of leave (sick, casual, medical, etc.)',
    icon: '🏖️',
    formFields: [
      { name: 'leaveType', label: 'Type of Leave', type: 'select', required: true, options: ['Sick Leave', 'Casual Leave', 'Emergency Leave'] },
      { name: 'startDate', label: 'Start Date', type: 'date', required: true },
      { name: 'endDate', label: 'End Date', type: 'date', required: true },
      { name: 'reason', label: 'Reason for Leave', type: 'textarea', required: true, placeholder: 'Provide detailed reason' },
    ],
  },
  {
    name: 'Fee Concession',
    description: 'Request fee concession or financial assistance',
    icon: '💰',
    formFields: [
      { name: 'concessionType', label: 'Type of Concession', type: 'select', required: true, options: ['Full Fee Waiver', 'Partial Fee Waiver (50%)', 'Partial Fee Waiver (25%)'] },
      { name: 'academicYear', label: 'Academic Year', type: 'select', required: true, options: ['2024-2025', '2025-2026', '2026-2027'] },
      { name: 'currentFeeAmount', label: 'Current Fee Amount (₹)', type: 'number', required: true },
      { name: 'familyIncome', label: 'Annual Family Income (₹)', type: 'number', required: true },
      { name: 'reason', label: 'Reason for Fee Concession Request', type: 'textarea', required: true, placeholder: 'Explain your financial situation' },
    ],
  },
  {
    name: 'Certificate Request',
    description: 'Request bonafide, character, or other certificates',
    icon: '📜',
    formFields: [
      { name: 'certificateType', label: 'Type of Certificate', type: 'select', required: true, options: ['Bonafide Certificate', 'Character Certificate', 'Transfer Certificate'] },
      { name: 'purpose', label: 'Purpose of Certificate', type: 'select', required: true, options: ['Bank Loan', 'Scholarship', 'Job Application', 'Other'] },
      { name: 'numberOfCopies', label: 'Number of Copies Required', type: 'number', required: true, min: 1, max: 5 },
      { name: 'urgentRequest', label: 'Is this urgent?', type: 'select', required: true, options: ['Yes - Need within 2 days', 'No - Standard processing'] },
    ],
  },
  {
    name: 'Internship Approval',
    description: 'Get approval for internship or industrial training',
    icon: '💼',
    formFields: [
      { name: 'companyName', label: 'Company/Organization Name', type: 'text', required: true },
      { name: 'internshipType', label: 'Type of Internship', type: 'select', required: true, options: ['Full-time', 'Part-time', 'Remote', 'On-site'] },
      { name: 'startDate', label: 'Start Date', type: 'date', required: true },
      { name: 'endDate', label: 'End Date', type: 'date', required: true },
      { name: 'workDescription', label: 'Work Description/Role', type: 'textarea', required: true, placeholder: 'Describe your role' },
    ],
  },
  {
    name: 'Event Permission',
    description: 'Request permission for organizing events or activities',
    icon: '🎉',
    formFields: [
      { name: 'eventName', label: 'Event Name', type: 'text', required: true },
      { name: 'eventType', label: 'Type of Event', type: 'select', required: true, options: ['Cultural Event', 'Technical Event', 'Sports Event', 'Workshop'] },
      { name: 'eventDate', label: 'Event Date', type: 'date', required: true },
      { name: 'venue', label: 'Preferred Venue', type: 'select', required: true, options: ['Auditorium', 'Seminar Hall', 'Classroom', 'Sports Ground'] },
      { name: 'eventDescription', label: 'Event Description', type: 'textarea', required: true, placeholder: 'Provide detailed description' },
    ],
  },
  {
    name: 'Library Request',
    description: 'Book requests, renewals, and library-related services',
    icon: '📚',
    formFields: [
      { name: 'requestType', label: 'Type of Request', type: 'select', required: true, options: ['New Book Purchase', 'Book Renewal', 'Lost Book Report'] },
      { name: 'bookTitle', label: 'Book Title', type: 'text', required: false },
      { name: 'authorName', label: 'Author Name', type: 'text', required: false },
      { name: 'reason', label: 'Reason for Request', type: 'textarea', required: true, placeholder: 'Explain why this is needed' },
    ],
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Category.deleteMany({});
    console.log('🗑️  Cleared existing categories');

    await Category.insertMany(categories);
    console.log('✅ Categories seeded successfully with dynamic form fields');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();