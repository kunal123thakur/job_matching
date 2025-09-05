import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, User, Heart, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SeekerLayoutProps {
  children: ReactNode;
}

export default function SeekerLayout({ children }: SeekerLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">InternMatch</span>
              </div>
              <span className="text-sm text-gray-500 bg-purple-100 px-2 py-1 rounded-full">Seeker</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="flex space-x-8 mb-8">
          <Link
            to="/seeker/profile"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              isActive('/seeker/profile')
                ? 'bg-purple-100 text-purple-700 font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <User className="h-4 w-4" />
            <span>My Profile</span>
          </Link>
          <Link
            to="/seeker/recommendations"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              isActive('/seeker/recommendations')
                ? 'bg-purple-100 text-purple-700 font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>Recommendations</span>
          </Link>
          <Link
            to="/seeker/applications"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              isActive('/seeker/applications')
                ? 'bg-purple-100 text-purple-700 font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>My Applications</span>
          </Link>
        </nav>

        {/* Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}