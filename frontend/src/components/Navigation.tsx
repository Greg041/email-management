import React from 'react';
import { Mail, Upload } from 'lucide-react';

interface NavigationProps {
  activeTab: 'templates' | 'users';
  setActiveTab: (tab: 'templates' | 'users') => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Mail className="w-8 h-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-gray-800">Email sender</span>
            </div>
            <div className="ml-10 flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'templates'
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                } transition-colors flex items-center space-x-1`}
              >
                <Upload className="w-4 h-4" />
                <span>Templates</span>
              </button>
              
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'users'
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                } transition-colors flex items-center space-x-1`}
              >
                <Mail className="w-4 h-4" />
                <span>Users</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;