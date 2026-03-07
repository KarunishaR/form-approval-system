require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const Category = require('./models/Category');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 1. CATEGORIES
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).lean();
    console.log('✅ Categories:', categories.length);
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('❌ Categories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 2. ROUTES
// ⚠️ IMPORTANT: Register routers BEFORE any catch-all or 404 handler
// The inline app.post('/api/staff/complete-profile') was REMOVED — 
// it was conflicting with routes/staff.js which handles this properly.
app.use('/api/auth', require('./routes/auth'));
app.use('/api/forms', require('./routes/forms'));
app.use('/api/staff', require('./routes/staff'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '✅ ALL ROUTES WORKING',
    routes: ['/api/categories', '/api/forms/submit', '/api/staff/complete-profile']
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ GLOBAL ERROR:', err.message);
  res.status(500).json({ success: false, message: 'Server error occurred' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n🚀 SERVER STARTED!');
  console.log(`📍 http://localhost:${PORT}`);
  console.log('✅ AUTH:         /api/auth');
  console.log('✅ FORMS:        /api/forms/submit');
  console.log('✅ STAFF:        /api/staff/complete-profile');
  console.log('✅ CATEGORIES:   /api/categories');
  console.log('===================\n');
});