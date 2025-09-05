import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { internshipApi } from '../../services/api';

export default function CreateInternshipForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    internship_title: '',
    company_name: '',
    location: '',
    is_remote: false,
    stipend_min: 0,
    stipend_max: 0,
    duration_months: 3,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Submitting internship data:', formData);
      await internshipApi.createInternship(formData);
      console.log('Internship created successfully');
      navigate('/admin/internships');
    } catch (err) {
      console.error('Error creating internship:', err);
      setError('Failed to create internship. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate('/admin/internships')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Internships</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Internship</h1>
          <p className="text-gray-600 mt-2">Fill in the details for your internship posting</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Internship Title */}
          <div>
            <label htmlFor="internship_title" className="block text-sm font-medium text-gray-700 mb-2">
              Internship Title *
            </label>
            <input
              type="text"
              id="internship_title"
              name="internship_title"
              required
              value={formData.internship_title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., Software Development Intern"
            />
          </div>

          {/* Company Name */}
          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              required
              value={formData.company_name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., TechCorp Inc."
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., Mumbai, Maharashtra"
            />
          </div>

          {/* Remote Option */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_remote"
              name="is_remote"
              checked={formData.is_remote}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_remote" className="ml-3 text-sm font-medium text-gray-700">
              Remote work option available
            </label>
          </div>

          {/* Stipend Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="stipend_min" className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Stipend (₹)
              </label>
              <input
                type="number"
                id="stipend_min"
                name="stipend_min"
                min="0"
                value={formData.stipend_min}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="10000"
              />
            </div>
            <div>
              <label htmlFor="stipend_max" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Stipend (₹)
              </label>
              <input
                type="number"
                id="stipend_max"
                name="stipend_max"
                min="0"
                value={formData.stipend_max}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="25000"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration_months" className="block text-sm font-medium text-gray-700 mb-2">
              Duration (months)
            </label>
            <select
              id="duration_months"
              name="duration_months"
              value={formData.duration_months}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value={1}>1 month</option>
              <option value={2}>2 months</option>
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/admin/internships')}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:border-gray-400 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Create Internship</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}