import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import formService from '../../services/formService';
import LoadingSpinner from '../shared/LoadingSpinner';
import { ArrowLeft, FileText, Calendar, Trash2, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { FORM_STATUS_LABELS, FORM_STATUS_COLORS } from '../../utils/constants';

const FormDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchFormDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchFormDetails = async () => {
    try {
      const response = await formService.getFormById(id);
      if (response.success) {
        setForm(response.data);
      }
    } catch (error) {
      console.error('Error fetching form details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await formService.deleteForm(id);
      if (response.success) {
        navigate('/student/forms');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete form');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    const color = FORM_STATUS_COLORS[status] || 'gray';
    return `badge-${color === 'yellow' ? 'pending' : color === 'blue' ? 'level1' : color === 'green' ? 'approved' : 'rejected'}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getApprovalIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Form not found</p>
          <Link to="/student/forms" className="btn-primary inline-block mt-4">
            Back to My Forms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/student/forms"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to My Forms</span>
        </Link>

        {/* Form Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <div className="text-4xl">{form.category?.icon || '📄'}</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
                <p className="text-gray-600 mt-1">Category: {form.category?.name}</p>
              </div>
            </div>
            <span className={`badge ${getStatusColor(form.status)}`}>
              {FORM_STATUS_LABELS[form.status]}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Submitted:</span>
              <span className="font-medium">{formatDate(form.submittedAt)}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-medium">{formatDate(form.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{form.description}</p>
        </div>

        {/* Attachments */}
        {form.attachments && form.attachments.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h2>
            <div className="space-y-2">
              {form.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{attachment.filename}</span>
                  </div>
                  <a
                    href={`http://localhost:5000/${attachment.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approval Timeline */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval Timeline</h2>
          <div className="space-y-4">
            {form.approvals && form.approvals.map((approval, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getApprovalIcon(approval.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Level {approval.level} - {approval.approverId?.name || 'Pending Assignment'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {approval.approverId?.designation || 'Position not specified'}
                      </p>
                    </div>
                    <span className={`badge ${
                      approval.status === 'approved' ? 'badge-approved' :
                      approval.status === 'rejected' ? 'badge-rejected' :
                      'badge-pending'
                    }`}>
                      {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                    </span>
                  </div>
                  {approval.remarks && (
                    <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Remarks:</span> {approval.remarks}
                      </p>
                    </div>
                  )}
                  {approval.actionDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      Processed on {formatDate(approval.actionDate)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {form.status === 'pending' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
                <p className="text-sm text-gray-600 mt-1">
                  You can delete this form while it's still pending
                </p>
              </div>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger flex items-center space-x-2 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <div className="spinner w-4 h-4 border-2"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Form</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormDetails;
