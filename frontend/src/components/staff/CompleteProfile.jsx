import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import formService from '../../services/formService';
import LoadingSpinner from '../shared/LoadingSpinner';
import { User, AlertCircle, CheckCircle } from 'lucide-react';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    staffId: '',
    designation: '',
    categoryId: '',
    approvalLevel: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await formService.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.staffId || !formData.designation || !formData.categoryId || !formData.approvalLevel) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);

    try {
      const response = await formService.completeStaffProfile(formData);

      if (response.success) {
        // ✅ Save to 'user' key — matches what authService.getStoredUser() reads
        localStorage.setItem('user', JSON.stringify(response.data));
        updateUser(response.data);

        setSuccess('Profile completed successfully! Redirecting...');

        setTimeout(() => {
          navigate('/staff/dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error('ERROR:', err.response);
      setError(err.response?.data?.message || 'Failed to complete profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div>
          <div className="flex justify-center">
            <div className="bg-primary-600 p-3 rounded-full">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please provide additional information to set up your staff account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="staffId" className="label">
                Staff ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="staffId"
                name="staffId"
                required
                className="input-field"
                placeholder="e.g., STF001"
                value={formData.staffId}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="designation" className="label">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="designation"
                name="designation"
                required
                className="input-field"
                placeholder="e.g., Assistant Professor, HOD, Dean"
                value={formData.designation}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="label">
                Department/Category <span className="text-red-500">*</span>
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                className="input-field"
                value={formData.categoryId}
                onChange={handleChange}
              >
                <option value="">Select your department/category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              {formData.categoryId && (
                <p className="mt-2 text-sm text-gray-600">
                  {categories.find(c => c._id === formData.categoryId)?.description}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="approvalLevel" className="label">
                Approval Level <span className="text-red-500">*</span>
              </label>
              <select
                id="approvalLevel"
                name="approvalLevel"
                required
                className="input-field"
                value={formData.approvalLevel}
                onChange={handleChange}
              >
                <option value="">Select your approval level</option>
                <option value="1">Level 1 (First Approver)</option>
                <option value="2">Level 2 (Final Approver)</option>
              </select>
              <p className="mt-2 text-sm text-gray-600">
                {formData.approvalLevel === '1' && 'You will be the first approver for forms in your category'}
                {formData.approvalLevel === '2' && 'You will be the final approver after Level 1 approval'}
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary flex justify-center items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="spinner w-5 h-5 border-2"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Complete Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;