import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import formService from '../../services/formService';
import LoadingSpinner from '../shared/LoadingSpinner';
import { FileText, Clock, CheckCircle, XCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { FORM_STATUS_LABELS } from '../../utils/constants';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await formService.getStaffStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}!</h1>
          <p className="mt-2 text-gray-600">
            {user.designation} - Level {user.approvalLevel} Approver
          </p>
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
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
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

        {/* Pending Forms Alert */}
        {stats?.pendingForms > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900">
                  {stats.pendingForms} form{stats.pendingForms !== 1 ? 's' : ''} awaiting your review
                </h3>
                <p className="text-yellow-700 mt-1">
                  Please review and process pending forms to keep the approval workflow moving.
                </p>
                <Link
                  to="/staff/pending"
                  className="inline-block mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                >
                  Review Pending Forms
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Recent Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Actions</h2>
            <Link
              to="/staff/all-forms"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1"
            >
              <span>View All</span>
              <TrendingUp className="h-4 w-4" />
            </Link>
          </div>

          {stats?.recentActions && stats.recentActions.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActions.map((form) => {
                const myApproval = form.approvals?.find(a => a.approverId?.toString() === user.id);
                return (
                  <Link
                    key={form._id}
                    to={`/staff/forms/${form._id}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-2xl">{form.category?.icon || '📄'}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{form.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Submitted by: {form.studentId?.name || 'Unknown'}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <p className="text-xs text-gray-500">
                              {formatDate(form.updatedAt)}
                            </p>
                            {myApproval?.status && (
                              <span className={`badge ${
                                myApproval.status === 'approved' ? 'badge-approved' : 'badge-rejected'
                              }`}>
                                {myApproval.status.charAt(0).toUpperCase() + myApproval.status.slice(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent actions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;