import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const ModeratorDashboard: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded shadow">
      <div className="flex items-center space-x-2 mb-4">
        <ShieldCheckIcon className="h-8 w-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Moderator Dashboard</h1>
      </div>
      <p className="mb-6 text-gray-700">
        Welcome, Moderator! Here you can review and manage admin access requests.
      </p>
      <Link
        to="/admin/requests"
        className="btn-primary inline-flex items-center"
      >
        Go to Admin Requests
      </Link>
    </div>
  );
};

export default ModeratorDashboard; 