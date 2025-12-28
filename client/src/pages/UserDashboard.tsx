import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  BellAlertIcon,
  PlusCircleIcon,
  XMarkIcon, // Added missing import
  DocumentIcon // Added missing import
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  location: {
    address: string;
    building: string;
    floor: string;
  };
  incidentTime: string;
  createdAt: string;
  attachments: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
  }>;
  publicUpdates: Array<{
    message: string;
    addedAt: string;
  }>;
}

const UserDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const statusColors = {
    pending: 'bg-warning-100 text-warning-800',
    under_review: 'bg-primary-100 text-primary-800',
    investigating: 'bg-secondary-100 text-secondary-800',
    resolved: 'bg-success-100 text-success-800',
    closed: 'bg-gray-100 text-gray-800'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-warning-100 text-warning-800',
    high: 'bg-danger-100 text-danger-800',
    critical: 'bg-danger-200 text-danger-900'
  };

  const categoryLabels = {
    harassment: 'Harassment',
    assault: 'Assault',
    theft: 'Theft',
    vandalism: 'Vandalism',
    suspicious_activity: 'Suspicious Activity',
    emergency: 'Emergency',
    safety_hazard: 'Safety Hazard',
    discrimination: 'Discrimination',
    bullying: 'Bullying',
    other: 'Other'
  };

  useEffect(() => {
    fetchUserReports();
  }, []);

  const fetchUserReports = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reports`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserReports(data.reports || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch user reports.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalReports = userReports.length;
  const pendingReports = userReports.filter(report => report.status === 'pending' || report.status === 'under_review' || report.status === 'investigating').length;
  const resolvedReports = userReports.filter(report => report.status === 'resolved' || report.status === 'closed').length;


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="card">
          <LoadingSpinner text="Loading your dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <Link
            to="/report-incident"
            className="btn-primary flex items-center"
          >
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            Report New Incident
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-danger-50 border border-danger-200 rounded-md p-4">
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        {/* User Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <PencilSquareIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                <p className="text-2xl font-bold text-gray-900">{pendingReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved Reports</p>
                <p className="text-2xl font-bold text-gray-900">{resolvedReports}</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Reports Section */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">My Submitted Reports</h3>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden p-4 space-y-4">
            {userReports.length === 0 ? (
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports submitted yet</h3>
                <p className="text-gray-600">Report an incident to see it here.</p>
              </div>
            ) : (
              userReports.map((report) => (
                <div key={report.id} className="bg-gray-50 rounded-lg p-4 shadow border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{report.title}</span>
                    <span className={`badge ${statusColors[report.status as keyof typeof statusColors]}`}>{report.status.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2 truncate">{report.description}</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="badge bg-gray-100 text-gray-800">{categoryLabels[report.category as keyof typeof categoryLabels] || report.category}</span>
                    <span className={`badge ${priorityColors[report.priority as keyof typeof priorityColors]}`}>{report.priority.toUpperCase()}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{formatDate(report.createdAt)}</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-primary-600 hover:text-primary-900 text-sm" // Added text-sm
                    >
                      View Details
                    </button>
                    {report.status !== 'resolved' && report.status !== 'closed' && (
                      <button
                        onClick={() => navigate(`/chat?reportId=${report.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <ChatBubbleLeftRightIcon className="h-5 w-5 mr-1" /> Chat
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No reports submitted yet</h3>
                      <p className="text-gray-600">Report an incident to see it here.</p>
                    </td>
                  </tr>
                ) : (
                  userReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {report.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {categoryLabels[report.category as keyof typeof categoryLabels] || report.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${statusColors[report.status as keyof typeof statusColors]}`}>
                          {report.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${priorityColors[report.priority as keyof typeof priorityColors]}`}>
                          {report.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(report.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="text-primary-600 hover:text-primary-900 text-sm" // Added text-sm
                          >
                            View Details
                          </button>
                          {report.status !== 'resolved' && report.status !== 'closed' && (
                            <button
                              onClick={() => navigate(`/chat?reportId=${report.id}`)}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            >
                              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" /> Chat
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity / Notifications (Placeholder) */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
            <div className="space-y-3">
              {/* This section would fetch and display user-specific notifications */}
              <div className="flex items-center space-x-3 text-gray-600">
                <BellAlertIcon className="h-5 w-5 text-gray-500" />
                <span>No new notifications at the moment.</span>
              </div>
              {/* Example of a real notification item */}
              {/*
              <div className="flex items-start space-x-3">
                <BellAlertIcon className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-800">Your report <span className="font-medium">"Loud party at Dorm A"</span> has been marked <span className="font-medium text-primary-600">"Under Review"</span>.</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              */}
            </div>
        </div>

      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto z-60">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{selectedReport.title}</h3>
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`badge ${statusColors[selectedReport.status as keyof typeof statusColors]}`}>
                      {selectedReport.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`badge ${priorityColors[selectedReport.priority as keyof typeof priorityColors]}`}>
                      {selectedReport.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedReport.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Category</h4>
                    <p className="text-gray-600 capitalize">
                      {categoryLabels[selectedReport.category as keyof typeof categoryLabels] || selectedReport.category}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Incident Time</h4>
                    <p className="text-gray-600">{formatDate(selectedReport.incidentTime)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                  <div className="text-gray-600">
                    {selectedReport.location?.address && <p>{selectedReport.location.address}</p>}
                    {selectedReport.location?.building && <p>Building: {selectedReport.location.building}</p>}
                    {selectedReport.location?.floor && <p>Floor: {selectedReport.location.floor}</p>}
                    {!selectedReport.location?.address && !selectedReport.location?.building && !selectedReport.location?.floor && (
                      <p className="text-gray-500">Location not specified</p>
                    )}
                  </div>
                </div>

                {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Attachments</h4>
                    <div className="space-y-2">
                      {selectedReport.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <DocumentIcon className="h-4 w-4" />
                            <span>{file.originalName || file.filename || 'Unknown file'}</span>
                          </div>
                          <button
                            onClick={() => window.open(`${process.env.REACT_APP_API_URL}/uploads/${file.filename}`, '_blank')}
                            className="text-primary-600 hover:text-primary-900 p-1 rounded-full hover:bg-gray-100"
                            title="View Attachment"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReport.publicUpdates && selectedReport.publicUpdates.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Updates from Admin</h4>
                    <div className="space-y-3">
                      {selectedReport.publicUpdates.map((update, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-700 mb-1">{update.message}</p>
                          <p className="text-xs text-gray-500">{update.addedAt ? formatDate(update.addedAt) : 'No date'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Only show Close button in the modal footer */}
                <div className="flex justify-end items-center space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                  {selectedReport.status !== 'resolved' && selectedReport.status !== 'closed' && (
                    <button
                      className="btn-primary flex items-center"
                      onClick={() => {
                        setSelectedReport(null); // Close modal before navigating
                        navigate(`/chat?reportId=${selectedReport.id}`);
                      }}
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                      Chat with Admin
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
