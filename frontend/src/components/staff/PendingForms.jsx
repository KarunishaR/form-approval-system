import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import formService from '../../services/formService';
import LoadingSpinner from '../shared/LoadingSpinner';
import { FileText, Eye, Clock, User } from 'lucide-react';

const PendingForms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingForms();
  }, []);

  const fetchPendingForms = async () => {
    try {
      const response = await formService.getPendingForms();
      if (response.success) {
        setForms(response.data);
      }
    } catch (error) {
      console.error('Error fetching pending forms:', error);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pending Forms</h1>
          <p className="mt-2 text-gray-600">Forms awaiting your review and approval</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {forms.length} form{forms.length !== 1 ? 's' : ''} pending review
            </p>
            {forms.length > 0 && (
              <div className="flex items-center space-x-2 text-yellow-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Action Required</span>
              </div>
            )}
          </div>

          {forms.length > 0 ? (
            <div className="space-y-4">
              {forms.map((form) => (
                <div
                  key={form._id}
                  className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 hover:border-yellow-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="text-3xl">{form.category?.icon || '📄'}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{form.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Category: {form.category?.name || 'N/A'}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <p className="text-sm text-gray-700">
                            Submitted by: <span className="font-medium">{form.studentId?.name}</span>
                            {form.studentId?.studentId && ` (${form.studentId.studentId})`}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                          {form.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-3">
                          <p className="text-xs text-gray-500">
                            Submitted: {formatDate(form.submittedAt)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Department: {form.studentId?.department || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/staff/forms/${form._id}`}
                      className="ml-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Review</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-green-100 p-4 rounded-full inline-block mb-4">
                <FileText className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-600">No forms pending your review at the moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingForms;