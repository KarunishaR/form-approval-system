import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import formService from '../../services/formService';
import LoadingSpinner from '../shared/LoadingSpinner';
import { ArrowLeft, FileText, Calendar, User, Download, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { FORM_STATUS_LABELS, FORM_STATUS_COLORS } from '../../utils/constants';

const FormReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [action, setAction] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchFormDetails();
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

  const handleActionClick = (actionType) => {
    setAction(actionType);
    setShowApprovalModal(true);
  };

  const handleSubmitAction = async () => {
    if (!remarks.trim()) {
      alert('Please provide remarks for your decision');
      return;
    }

    setProcessing(true);
    try {
      const response = await formService.processForm(id, action, remarks);
      if (response.success) {
        alert(`Form ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
        navigate('/staff/pending');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to process form');
    } finally {
      setProcessing(false);
      setShowApprovalModal(false);
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

  const canProcessForm = () => {
    if (!form || !user) return false;
    
    const myApproval = form.approvals?.find(a => a.approverId?._id === user.id);
    return myApproval && myApproval.status === 'pending';
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
          <Link to="/staff/pending" className="btn-primary inline-block mt-4">
            Back to Pending Forms
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
          to="/staff/pending"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Pending Forms</span>
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

        {/* Student Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium text-gray-900">{form.studentId?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Student ID</p>
              <p className="font-medium text-gray-900">{form.studentId?.studentId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{form.studentId?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="font-medium text-gray-900">{form.studentId?.department || 'N/A'}</p>
            </div>
            {form.studentId?.phone && (
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{form.studentId.phone}</p>
              </div>
            )}
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

        {/* Action Buttons */}
        {canProcessForm() && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <h2 className="text-lg font-semibold text-gray-900">Action Required</h2>
            </div>
            <p className="text-gray-600 mb-6">
              This form requires your approval. Please review carefully and make a decision.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleActionClick('approve')}
                className="btn-success flex items-center space-x-2 flex-1"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleActionClick('reject')}
                className="btn-danger flex items-center space-x-2 flex-1"
              >
                <XCircle className="h-5 w-5" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {action === 'approve' ? 'Approve Form' : 'Reject Form'}
              </h3>
              <p className="text-gray-600 mb-4">
                Please provide remarks for your decision:
              </p>
              <textarea
                className="input-field"
                rows="4"
                placeholder="Enter your remarks here..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setRemarks('');
                  }}
                  className="btn-secondary flex-1"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAction}
                  disabled={processing || !remarks.trim()}
                  className={`flex-1 flex items-center justify-center space-x-2 ${
                    action === 'approve' ? 'btn-success' : 'btn-danger'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {processing ? (
                    <>
                      <div className="spinner w-4 h-4 border-2"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {action === 'approve' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      <span>Confirm {action === 'approve' ? 'Approval' : 'Rejection'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormReview;
