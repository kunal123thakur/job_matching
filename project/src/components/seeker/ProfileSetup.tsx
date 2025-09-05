import React, { useState } from 'react';
import { Save, Upload, FileText, DollarSign } from 'lucide-react';
import { candidateApi } from '../../services/api';

export default function ProfileSetup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    father_income: 0,
    preferred_location: '',
  });
  const [files, setFiles] = useState({
    resume: null as File | null,
    income_certificate: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.resume || !files.income_certificate) {
      setError('Please upload both resume and income certificate');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Submitting candidate profile:', formData);
      await candidateApi.createCandidate({
        ...formData,
        resume: files.resume,
        income_certificate: files.income_certificate,
      });
      console.log('Profile created successfully');
      setSuccess(true);
    } catch (err) {
      console.error('Error creating profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'resume' | 'income_certificate') => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles({
        ...files,
        [fileType]: file,
      });
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-2xl">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Created Successfully!</h2>
        <p className="text-gray-600 mb-6">
          Your profile has been saved and our AI is analyzing your resume to find the best internship matches.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Recommendations
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Setup Your Profile</h1>
        <p className="text-gray-600 mt-2">
          Complete your profile to get AI-powered internship recommendations
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your email"
            />
          </div>

          {/* Father's Income */}
          <div>
            <label htmlFor="father_income" className="block text-sm font-medium text-gray-700 mb-2">
              Family Annual Income (₹) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="number"
                id="father_income"
                name="father_income"
                required
                min="0"
                value={formData.father_income}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., 500000"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This information is used for need-based ranking and is kept confidential
            </p>
          </div>

          {/* Preferred Location */}
          <div>
            <label htmlFor="preferred_location" className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Work Location *
            </label>
            <input
              type="text"
              id="preferred_location"
              name="preferred_location"
              required
              value={formData.preferred_location}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., Mumbai, Maharashtra"
            />
          </div>

          {/* Resume Upload */}
          <div>
            <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
              Resume * (PDF format recommended)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="resume"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange(e, 'resume')}
                className="hidden"
              />
              <label htmlFor="resume" className="cursor-pointer">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {files.resume ? (
                      <span className="text-blue-600 font-medium">{files.resume.name}</span>
                    ) : (
                      'Click to upload your resume'
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX (max 5MB)</p>
                </div>
              </label>
            </div>
          </div>

          {/* Income Certificate Upload */}
          <div>
            <label htmlFor="income_certificate" className="block text-sm font-medium text-gray-700 mb-2">
              Income Certificate * (PDF format recommended)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="income_certificate"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'income_certificate')}
                className="hidden"
              />
              <label htmlFor="income_certificate" className="cursor-pointer">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {files.income_certificate ? (
                      <span className="text-blue-600 font-medium">{files.income_certificate.name}</span>
                    ) : (
                      'Click to upload income certificate'
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG (max 5MB)</p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}