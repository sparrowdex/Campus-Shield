import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  CalendarIcon,
  FunnelIcon,
  XMarkIcon,
  DocumentIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

const MyReports: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reports`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      // Ensure we always have an array, even if the API returns unexpected data
      const reportsArray = Array.isArray(data.reports) ? data.reports : 
                          Array.isArray(data) ? data : [];
      setReports(reportsArray);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError(err.message);
      setReports([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || report.status === filter;
    const matchesSearch = (report.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (report.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (categoryLabels[report.category as keyof typeof categoryLabels]?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="card">
          <LoadingSpinner text="Loading your reports..." />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
          <div className="text-sm text-gray-500">
            {reports.length} total report{reports.length !== 1 ? 's' : ''}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-danger-50 border border-danger-200 rounded-md p-4">
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
              <FunnelIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-full sm:w-48"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {reports.length === 0 ? 'No reports yet' : 'No reports match your search'}
            </h3>
            <p className="text-gray-600">
              {reports.length === 0 
                ? 'Submit your first incident report to get started.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer w-full"
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 break-words">{report.title}</h3>
                      <span className={`badge ${statusColors[report.status as keyof typeof statusColors]}`}>{report.status.replace('_', ' ').toUpperCase()}</span>
                      <span className={`badge ${priorityColors[report.priority as keyof typeof priorityColors]}`}>{report.priority.toUpperCase()}</span>
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2 break-words">
                      {report.description}
                    </p>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{report.incidentTime ? formatDate(report.incidentTime) : 'No date'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{report.location?.address || 'Location not specified'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="capitalize">
                          {report.category ? categoryLabels[report.category as keyof typeof categoryLabels] || report.category : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row flex-wrap items-center gap-2 mt-2 sm:mt-0 ml-0 sm:ml-4">
                    {report.attachments && report.attachments.length > 0 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {report.attachments.length} file{report.attachments.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {report.publicUpdates && report.publicUpdates.length > 0 && (
                      <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded">
                        {report.publicUpdates.length} update{report.publicUpdates.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                      {categoryLabels[selectedReport.category as keyof typeof categoryLabels]}
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
                         <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                           <DocumentIcon className="h-4 w-4" />
                           <span>{file.originalName || file.filename || 'Unknown file'}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                                 {selectedReport.publicUpdates && selectedReport.publicUpdates.length > 0 && (
                   <div>
                     <h4 className="font-medium text-gray-900 mb-2">Updates</h4>
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

                <div className="flex justify-end items-center pt-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <button
                      onClick={() =>
                        navigate(`/report/${selectedReport.id}/edit`, { state: { report: selectedReport } })
                      }
                      className="btn-secondary"
                    >
                      Edit Report
                    </button>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="btn-secondary"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => navigate(`/chat?reportId=${selectedReport.id}`)}
                      className="btn-primary flex items-center"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReports; 