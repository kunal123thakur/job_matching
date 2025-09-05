import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, MapPin, Building } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Application {
  id: number;
  internship_title: string;
  company_name: string;
  location: string;
  applied_date: string;
  status: 'pending' | 'accepted' | 'rejected' | 'under_review';
  stipend_range: string;
}

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch applications from API
    // For now, show mock data
    setTimeout(() => {
      setApplications([
        {
          id: 1,
          internship_title: 'Software Development Intern',
          company_name: 'TechCorp Inc.',
          location: 'Mumbai, Maharashtra',
          applied_date: '2025-01-15',
          status: 'under_review',
          stipend_range: '₹15,000 - ₹25,000',
        },
        {
          id: 2,
          internship_title: 'Data Science Intern',
          company_name: 'DataSolutions Ltd.',
          location: 'Bangalore, Karnataka',
          applied_date: '2025-01-12',
          status: 'pending',
          stipend_range: '₹20,000 - ₹30,000',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'under_review':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'under_review':
        return 'Under Review';
      default:
        return 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-2">
          Track the status of your internship applications • {applications.length} applications
        </p>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-600 mb-6">Start applying to internships to see them here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <div
              key={application.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Title and Status */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {application.internship_title}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Building className="h-4 w-4 mr-1" />
                        <span className="text-sm">{application.company_name}</span>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      <span className="text-sm font-medium">{getStatusText(application.status)}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{application.location}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">{application.stipend_range}</span>
                    </div>
                    <div className="flex items-center">
                      <span>Applied on {new Date(application.applied_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}