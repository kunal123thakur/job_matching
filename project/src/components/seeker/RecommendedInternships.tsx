import { useState, useEffect } from 'react';
import { MapPin, DollarSign, Clock, Building, Star, ExternalLink } from 'lucide-react';
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
  match_score?: number;
}

export default function RecommendedInternships() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appliedInternships, setAppliedInternships] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      // For now, we'll fetch all internships and add mock match scores
      // In the future, this will use the searchApi.searchInternships with user skills
      const data = await internshipApi.getInternships();
      
      // Add mock match scores for demonstration
      const internshipsWithScores = data.map((internship: Internship) => ({
        ...internship,
        match_score: Math.floor(Math.random() * 20) + 80, // Random score between 80-100
      }));

      // Sort by match score
      internshipsWithScores.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
      
      setInternships(internshipsWithScores);
    } catch (err) {
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (internshipId: number) => {
    // TODO: Implement application API call
    setAppliedInternships(prev => new Set(prev).add(internshipId));
    // Show success message or redirect to applications
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
          onClick={fetchRecommendations}
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Recommended for You</h1>
        <p className="text-gray-600 mt-2">
          AI-curated internships based on your skills and preferences • {internships.length} matches
        </p>
      </div>

      {/* Internships Grid */}
      {internships.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl">
          <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No recommendations yet</h3>
          <p className="text-gray-600 mb-6">Complete your profile to get personalized recommendations</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <div
              key={internship.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100"
            >
              {/* Match Score Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold text-gray-700">{internship.match_score}% match</span>
                </div>
                {internship.is_remote && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                    Remote
                  </span>
                )}
              </div>

              {/* Title and Company */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {internship.internship_title}
                </h3>
                <div className="flex items-center text-gray-600 mb-3">
                  <Building className="h-4 w-4 mr-2" />
                  <span className="text-sm">{internship.company_name}</span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">{internship.location}</span>
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

              {/* Apply Button */}
              <button
                onClick={() => handleApply(internship.id)}
                disabled={appliedInternships.has(internship.id)}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
                  appliedInternships.has(internship.id)
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                }`}
              >
                {appliedInternships.has(internship.id) ? (
                  <span>Applied ✓</span>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    <span>Apply Now</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}