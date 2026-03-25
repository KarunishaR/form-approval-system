require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const Category = require('./models/Category');

const app = express();

// 🔥 Connect to MongoDB
connectDB();

// ✅ CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ================= DEBUG ROOT ROUTE =================
app.get('/', (req, res) => {
  console.log("🔥 Root route hit");
  res.send('Backend is running 🚀');
});


// ================= ROUTES =================

// 1. Categories
app.get('/api/categories', async (req, res) => {
  try {
    console.log("🔥 Categories route hit");

    const categories = await Category.find({ isActive: true }).lean();
    res.json({ success: true, data: categories });

  } catch (error) {
    console.error('❌ Categories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 2. Other Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/forms', require('./routes/forms'));
app.use('/api/staff', require('./routes/staff'));


// ================= HEALTH CHECK =================
app.get('/api/health', (req, res) => {
  console.log("🔥 Health route hit");

  res.json({ 
    success: true, 
    message: "Working",
    routes: [
      '/api/categories',
      '/api/forms/submit',
      '/api/staff/complete-profile'
    ]
  });
});


// ================= ERROR HANDLING =================
app.use((err, req, res, next) => {
  console.error('❌ GLOBAL ERROR:', err.message);
  res.status(500).json({ success: false, message: 'Server error occurred' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});


// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SERVER STARTED on ${PORT}`);
});