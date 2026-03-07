import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import formService from '../../services/formService';
import LoadingSpinner from '../shared/LoadingSpinner';
import { FileText, Filter, Search, Eye } from 'lucide-react';
import { FORM_STATUS_LABELS, FORM_STATUS_COLORS } from '../../utils/constants';

const MyForms = () => {
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, forms]);

  const fetchData = async () => {
    try {
      const [formsResponse, categoriesResponse] = await Promise.all([
        formService.getMyForms(),
        formService.getCategories(),
      ]);

      if (formsResponse.success) {
        setForms(formsResponse.data);
        setFilteredForms(formsResponse.data);
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...forms];

    if (filters.status) {
      filtered = filtered.filter(form => form.status === filters.status);
    }

    if (filters.category) {
      filtered = filtered.filter(form => form.category?._id === filters.category);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(form =>
        form.title.toLowerCase().includes(searchLower) ||
        form.description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredForms(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Forms</h1>
          <p className="mt-2 text-gray-600">View and manage all your form submissions</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  className="input-field pl-10"
                  placeholder="Search by title or description"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </div>
            </div>

            <div>
              <label className="label">Status</label>
              <select
                name="status"
                className="input-field"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="level1_approved">Level 1 Approved</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="label">Category</label>
              <select
                name="category"
                className="input-field"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Forms List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredForms.length} of {forms.length} forms
            </p>
          </div>

          {filteredForms.length > 0 ? (
            <div className="space-y-4">
              {filteredForms.map((form) => (
                <div
                  key={form._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="text-3xl">{form.category?.icon || '📄'}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{form.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Category: {form.category?.name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                          {form.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-3">
                          <p className="text-xs text-gray-500">
                            Submitted: {formatDate(form.submittedAt)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Updated: {formatDate(form.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-3">
                      <span className={`badge ${getStatusColor(form.status)}`}>
                        {FORM_STATUS_LABELS[form.status]}
                      </span>
                      <Link
                        to={`/student/forms/${form._id}`}
                        className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No forms found matching your criteria</p>
              <Link
                to="/student/submit"
                className="btn-primary inline-block mt-4"
              >
                Submit New Form
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyForms;