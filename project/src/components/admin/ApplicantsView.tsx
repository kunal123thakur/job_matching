import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, DollarSign, MapPin, Star } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Applicant {
  id: number;
  name: string;
  email: string;
  father_income: number;
  preferred_location: string;
  resume_url: string;
  income_certificate_url: string;
  skills: string[];
  match_score: number;
  rank: number;
}

export default function ApplicantsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [internshipTitle, setInternshipTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch applicants from API
    // For now, show mock data
    setTimeout(() => {
      setInternshipTitle('Software Development Intern');
      setApplicants([
        {
          id: 1,
          name: 'Rahul Sharma',
          email: 'rahul.sharma@email.com',
          father_income: 250000,
          preferred_location: 'Mumbai',
          resume_url: '#',
          income_certificate_url: '#',
          skills: ['React', 'JavaScript', 'Python', 'Node.js'],
          match_score: 92,
          rank: 1,
        },
        {
          id: 2,
          name: 'Priya Patel',
          email: 'priya.patel@email.com',
          father_income: 180000,
          preferred_location: 'Mumbai',
          resume_url: '#',
          income_certificate_url: '#',
          skills: ['Java', 'Spring Boot', 'MySQL', 'React'],
          match_score: 88,
          rank: 2,
        },
        {
          id: 3,
          name: 'Amit Kumar',
          email: 'amit.kumar@email.com',
          father_income: 150000,
          preferred_location: 'Mumbai',
          resume_url: '#',
          income_certificate_url: '#',
          skills: ['Python', 'Django', 'PostgreSQL', 'HTML/CSS'],
          match_score: 85,
          rank: 3,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rank <= 3) return 'bg-gray-100 text-gray-800 border-gray-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
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

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Applicants for {internshipTitle}</h1>
        <p className="text-gray-600 mt-2">
          Ranked by AI matching algorithm and income criteria • {applicants.length} applicants
        </p>
      </div>

      {/* Applicants List */}
      <div className="space-y-6">
        {applicants.map((applicant) => (
          <div
            key={applicant.id}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Rank and Name */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRankBadgeColor(applicant.rank)}`}>
                    Rank #{applicant.rank}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{applicant.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-600">{applicant.match_score}% match</span>
                  </div>
                </div>

                {/* Contact Info */}
                <p className="text-gray-600 mb-4">{applicant.email}</p>

                {/* Details Grid */}
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <div>
                      <span className="text-xs text-gray-500 block">Family Income</span>
                      <span className="text-sm font-medium">₹{applicant.father_income.toLocaleString()}/year</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <div>
                      <span className="text-xs text-gray-500 block">Preferred Location</span>
                      <span className="text-sm font-medium">{applicant.preferred_location}</span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-6">
                  <span className="text-xs text-gray-500 block mb-2">Key Skills</span>
                  <div className="flex flex-wrap gap-2">
                    {applicant.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              <a
                href={applicant.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
              >
                <FileText className="h-4 w-4" />
                <span>View Resume</span>
              </a>
              <a
                href={applicant.income_certificate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-gray-400 transition-all text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                <span>Income Certificate</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}