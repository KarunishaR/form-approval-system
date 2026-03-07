import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import formService from '../../services/formService';
import LoadingSpinner from '../shared/LoadingSpinner';
import { FileText, Clock, CheckCircle, XCircle, TrendingUp, Send } from 'lucide-react';
import { FORM_STATUS_LABELS, FORM_STATUS_COLORS } from '../../utils/constants';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await formService.getStudentStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const color = FORM_STATUS_COLORS[status] || 'gray';
    return `badge-${color === 'yellow' ? 'pending' : color === 'blue' ? 'level1' : color === 'green' ? 'approved' : 'rejected'}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="mt-2 text-gray-600">Here's an overview of your form submissions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Forms</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalForms || 0}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-full">
                <FileText className="h-8 w-8 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats?.pendingForms || 0}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats?.approvedForms || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats?.rejectedForms || 0}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold">Ready to submit a new form?</h2>
              <p className="mt-2 text-primary-100">Choose from various categories and get started</p>
            </div>
            <Link
              to="/student/submit"
              className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center space-x-2"
            >
              <Send className="h-5 w-5" />
              <span>Submit New Form</span>
            </Link>
          </div>
        </div>

        {/* Recent Forms */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Submissions</h2>
            <Link
              to="/student/forms"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1"
            >
              <span>View All</span>
              <TrendingUp className="h-4 w-4" />
            </Link>
          </div>

          {stats?.recentForms && stats.recentForms.length > 0 ? (
            <div className="space-y-4">
              {stats.recentForms.map((form) => (
                <Link
                  key={form._id}
                  to={`/student/forms/${form._id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="text-2xl">{form.category?.icon || '📄'}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{form.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Category: {form.category?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Submitted on {formatDate(form.submittedAt)}
                        </p>
                      </div>
                    </div>
                    <span className={`badge ${getStatusColor(form.status)}`}>
                      {FORM_STATUS_LABELS[form.status]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No forms submitted yet</p>
              <Link
                to="/student/submit"
                className="btn-primary inline-block mt-4"
              >
                Submit Your First Form
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;