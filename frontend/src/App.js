import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Navbar from './components/shared/Navbar';

// Pages
import HomePage from './pages/HomePage';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyEmail from './components/auth/VerifyEmail';

// Student Components
import StudentDashboard from './components/student/StudentDashboard';
import SubmitForm from './components/student/SubmitForm';
import MyForms from './components/student/MyForms';
import FormDetails from './components/student/FormDetails';

// Staff Components
import StaffDashboard from './components/staff/StaffDashboard';
import CompleteProfile from './components/staff/CompleteProfile';
import PendingForms from './components/staff/PendingForms';
import AllForms from './components/staff/AllForms';
import FormReview from './components/staff/FormReview';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<><HomePage /></>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />

            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Navbar />
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/submit"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Navbar />
                  <SubmitForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/forms"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Navbar />
                  <MyForms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/forms/:id"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Navbar />
                  <FormDetails />
                </ProtectedRoute>
              }
            />

            {/* Staff Routes */}
            <Route
              path="/staff/complete-profile"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <CompleteProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/dashboard"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <Navbar />
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/pending"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <Navbar />
                  <PendingForms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/all-forms"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <Navbar />
                  <AllForms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/forms/:id"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <Navbar />
                  <FormReview />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;