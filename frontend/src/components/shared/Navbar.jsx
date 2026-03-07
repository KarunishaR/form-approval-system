import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, User, LogOut, FileText, Home } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isStudent = user?.role === 'student';
  const isStaff = user?.role === 'staff' || user?.role === 'admin';

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-primary-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Form Approval System
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to={isStudent ? '/student/dashboard' : '/staff/dashboard'}
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              {isStudent && (
                <>
                  <Link
                    to="/student/submit"
                    className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Submit Form</span>
                  </Link>
                  <Link
                    to="/student/forms"
                    className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>My Forms</span>
                  </Link>
                </>
              )}

              {isStaff && (
                <>
                  <Link
                    to="/staff/pending"
                    className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Pending Forms</span>
                  </Link>
                  <Link
                    to="/staff/all-forms"
                    className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>All Forms</span>
                  </Link>
                </>
              )}

              {/* User Menu */}
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="bg-primary-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          {user && (
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-primary-600 p-2"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {user && isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to={isStudent ? '/student/dashboard' : '/staff/dashboard'}
              className="flex items-center space-x-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>

            {isStudent && (
              <>
                <Link
                  to="/student/submit"
                  className="flex items-center space-x-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FileText className="h-5 w-5" />
                  <span>Submit Form</span>
                </Link>
                <Link
                  to="/student/forms"
                  className="flex items-center space-x-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FileText className="h-5 w-5" />
                  <span>My Forms</span>
                </Link>
              </>
            )}

            {isStaff && (
              <>
                <Link
                  to="/staff/pending"
                  className="flex items-center space-x-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FileText className="h-5 w-5" />
                  <span>Pending Forms</span>
                </Link>
                <Link
                  to="/staff/all-forms"
                  className="flex items-center space-x-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FileText className="h-5 w-5" />
                  <span>All Forms</span>
                </Link>
              </>
            )}

            <div className="border-t border-gray-200 my-2"></div>
            
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500 capitalize">{user.role}</p>
            </div>

            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-2 w-full text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-base font-medium"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;