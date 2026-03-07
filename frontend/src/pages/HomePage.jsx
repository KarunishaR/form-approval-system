import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText, CheckCircle, Users, Clock } from 'lucide-react';

const HomePage = () => {
  const { user } = useAuth();

  if (user) {
    if (user.role === 'student') {
      window.location.href = '/student/dashboard';
      return null;
    } else if (user.role === 'staff' || user.role === 'admin') {
      if (!user.staffId || !user.approvalLevel) {
        window.location.href = '/staff/complete-profile';
        return null;
      }
      window.location.href = '/staff/dashboard';
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-primary-600 p-4 rounded-2xl shadow-lg">
              <FileText className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            Online Form Approval System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your form submission and approval process with our modern, efficient platform.
            Submit requests, track status, and manage approvals all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors shadow-md"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition-colors shadow-md"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose Our Platform?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="bg-blue-100 p-3 rounded-full inline-block mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Submission</h3>
            <p className="text-gray-600">
              Submit forms quickly with our intuitive interface and file upload support
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="bg-green-100 p-3 rounded-full inline-block mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-Level Approval</h3>
            <p className="text-gray-600">
              Structured approval hierarchy ensures proper review and authorization
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="bg-yellow-100 p-3 rounded-full inline-block mb-4">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Tracking</h3>
            <p className="text-gray-600">
              Track your form status and receive instant notifications on updates
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="bg-purple-100 p-3 rounded-full inline-block mb-4">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Role-Based Access</h3>
            <p className="text-gray-600">
              Separate portals for students and staff with tailored experiences
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of users already streamlining their approval processes
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition-colors shadow-lg inline-block"
          >
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 Form Approval System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;