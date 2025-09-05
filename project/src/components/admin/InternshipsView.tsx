import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, DollarSign, Clock, Users, Building } from 'lucide-react';
import { internshipApi } from '../../services/api';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Internship {
  id: number;
  internship_title: string;
  company_name: string;
  location: string;
  is_remote: boolean;
  stipend_min: number;
  stipend_max: number;
  duration_months: number;
}

export default function InternshipsView() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      console.log('Fetching internships...');
      const data = await internshipApi.getInternships();
      console.log('Internships fetched:', data);
      setInternships(data);
    } catch (err) {
      console.error('Error fetching internships:', err);
      setError('Failed to load internships. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchInternships}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Internships</h1>
          <p className="text-gray-600 mt-1">Manage your internship postings</p>
        </div>
        <Link
          to="/admin/create"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Create Internship</span>
        </Link>
      </div>

      {/* Internships Grid */}
      {internships.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl">
          <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No internships yet</h3>
          <p className="text-gray-600 mb-6">Start by creating your first internship posting</p>
          <Link
            to="/admin/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Internship</span>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <div
              key={internship.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {internship.internship_title}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Building className="h-4 w-4 mr-1" />
                    <span className="text-sm">{internship.company_name}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    {internship.location}
                    {internship.is_remote && (
                      <span className="ml-2 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                        Remote
                      </span>
                    )}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    ₹{internship.stipend_min.toLocaleString()} - ₹{internship.stipend_max.toLocaleString()}/month
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm">{internship.duration_months} months</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <Link
                  to={`/admin/internships/${internship.id}/applicants`}
                  className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
                >
                  <Users className="h-4 w-4" />
                  <span>View Applicants</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}