import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import formService from '../../services/formService';
import LoadingSpinner from '../shared/LoadingSpinner';
import { Send, Upload, X, AlertCircle, CheckCircle, Info } from 'lucide-react';

const SubmitForm = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    description: '',
  });
  const [dynamicFields, setDynamicFields] = useState({});

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

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const category = categories.find(c => c._id === categoryId);
    
    setFormData({
      ...formData,
      categoryId,
      title: '',
      description: '',
    });
    
    setSelectedCategory(category);
    setDynamicFields({});
    setError('');
  };

  const handleDynamicFieldChange = (fieldName, value) => {
    setDynamicFields({
      ...dynamicFields,
      [fieldName]: value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    const validFiles = selectedFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });

    setFiles([...files, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const generateAutoTitle = () => {
    if (!selectedCategory) return '';
    
    let title = selectedCategory.name;
    
    if (selectedCategory.formFields?.[0]?.name && dynamicFields[selectedCategory.formFields[0].name]) {
      title += ` - ${dynamicFields[selectedCategory.formFields[0].name]}`;
    }
    
    return title;
  };

  const generateAutoDescription = () => {
    if (!selectedCategory?.formFields) return '';
    
    let description = '';
    selectedCategory.formFields.forEach(field => {
      if (dynamicFields[field.name]) {
        description += `${field.label}: ${dynamicFields[field.name]}\n`;
      }
    });
    
    return description.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }

    if (selectedCategory?.formFields) {
      for (const field of selectedCategory.formFields) {
        if (field.required && !dynamicFields[field.name]) {
          setError(`Please fill in: ${field.label}`);
          return;
        }
      }
    }

    setSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('categoryId', formData.categoryId);
      submitData.append('title', generateAutoTitle());
      submitData.append('description', generateAutoDescription());
      submitData.append('formData', JSON.stringify(dynamicFields));

      files.forEach((file) => {
        submitData.append('attachments', file);
      });

      const response = await formService.submitForm(submitData);

      if (response.success) {
        setSuccess('Form submitted successfully!');
        setTimeout(() => {
          navigate('/student/forms');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderDynamicField = (field) => {
    const value = dynamicFields[field.name] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
      case 'date':
      case 'time':
        return (
          <input
            type={field.type}
            className="input-field"
            placeholder={field.placeholder || ''}
            value={value}
            onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
            required={field.required}
            min={field.min}
            max={field.max}
          />
        );

      case 'select':
        return (
          <select
            className="input-field"
            value={value}
            onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
            required={field.required}
          >
            <option value="">-- Select {field.label} --</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            className="input-field"
            rows="4"
            placeholder={field.placeholder || ''}
            value={value}
            onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        );

      default:
        return <input type="text" className="input-field" />;
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Submit New Form</h1>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 px-6 py-4 rounded-xl mb-6 flex items-start gap-3">
              <AlertCircle className="h-6 w-6 mt-0.5 flex-shrink-0" />
              <span className="text-sm leading-relaxed">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-300 text-green-800 px-6 py-4 rounded-xl mb-6 flex items-start gap-3">
              <CheckCircle className="h-6 w-6 mt-0.5 flex-shrink-0" />
              <span className="text-sm leading-relaxed">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Category Selection */}
            <div>
              <label htmlFor="categoryId" className="label">
                Form Category <span className="text-red-500 font-bold">*</span>
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                className="input-field"
                value={formData.categoryId}
                onChange={handleCategoryChange}
              >
                <option value="">-- Select a category --</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              {selectedCategory && (
                <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                    <p className="text-sm text-blue-800 leading-relaxed">{selectedCategory.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Form Fields */}
            {selectedCategory?.formFields?.length > 0 && (
              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  {selectedCategory.icon} {selectedCategory.name} Details
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {selectedCategory.formFields.map((field, index) => (
                    <div key={index}>
                      <label className="label">
                        {field.label}
                        {field.required && <span className="text-red-500 font-bold ml-1">*</span>}
                      </label>
                      {renderDynamicField(field)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Attachments */}
            {selectedCategory && (
              <div className="border-t border-gray-200 pt-8">
                <label className="label mb-4 block">📎 Supporting Documents (Optional)</label>
                <div className="mt-4">
                  <label className="flex flex-col items-center justify-center w-full px-8 py-12 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group">
                    <Upload className="h-12 w-12 text-gray-400 group-hover:text-blue-500 mb-4 transition-colors" />
                    <div className="text-center">
                      <p className="text-lg font-medium text-gray-700 mb-1">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, DOC, DOCX, JPG, PNG (max 5MB each)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="mt-6 space-y-3">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Upload className="h-5 w-5 text-gray-400" />
                          <div>
                            <span className="text-sm font-medium text-gray-900 block">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-all"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit Buttons */}
            {selectedCategory && (
              <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t-2 border-gray-200 justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/student/dashboard')}
                  className="btn-secondary flex-1 sm:flex-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 sm:flex-none"
                >
                  {submitting ? (
                    <>
                      <div className="spinner" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Submit Form</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitForm;
