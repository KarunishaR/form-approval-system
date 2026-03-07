import api from './api';

const formService = {
  // Student endpoints
  submitForm: async (formData) => {
    const response = await api.post('/forms/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyForms: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/forms/my-forms?${params}`);
    return response.data;
  },

  getFormById: async (formId) => {
    const response = await api.get(`/forms/${formId}`);
    return response.data;
  },

  deleteForm: async (formId) => {
    const response = await api.delete(`/forms/${formId}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/forms/categories');
    return response.data;
  },

  getStudentStats: async () => {
    const response = await api.get('/forms/stats');
    return response.data;
  },

  // Staff endpoints
  completeStaffProfile: async (profileData) => {
    const response = await api.post('/staff/complete-profile', profileData);
    return response.data;
  },

  getPendingForms: async () => {
    const response = await api.get('/staff/pending-forms');
    return response.data;
  },

  getAllStaffForms: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/staff/all-forms?${params}`);
    return response.data;
  },

  processForm: async (formId, action, remarks) => {
    const response = await api.post(`/staff/process-form/${formId}`, {
      action,
      remarks,
    });
    return response.data;
  },

  getStaffStats: async () => {
    const response = await api.get('/staff/stats');
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/staff/categories', categoryData);
    return response.data;
  },
};

export default formService;