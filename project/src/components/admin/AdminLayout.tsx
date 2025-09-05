import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, Plus, Users, LogOut, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
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
              <span className="text-sm text-gray-500 bg-blue-100 px-2 py-1 rounded-full">Admin</span>
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
            to="/admin/internships"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              isActive('/admin/internships')
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>All Internships</span>
          </Link>
          <Link
            to="/admin/create"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              isActive('/admin/create')
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Create Internship</span>
          </Link>
        </nav>

        {/* Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}