import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChartBarIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  FunnelIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  XMarkIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import IncidentHeatMap from '../components/IncidentHeatMap';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStats {
  totalUsers: number;
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  resolutionRate: string;
  recentReports: number;
  activeChats: number;
}

// Update the Report interface
type AssignedToType = string | { _id: string; email?: string };
const isAssignedToObject = (assignedTo: AssignedToType): assignedTo is { _id: string; email?: string } =>
  !!assignedTo && typeof assignedTo === 'object' && '_id' in assignedTo;
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
    coordinates?: [number, number];
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
  assignedTo?: AssignedToType;
}

interface HeatmapPoint {
  coordinates: [number, number];
  category: string;
  priority: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();
  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
  const [activeChats, setActiveChats] = useState<number>(0);
  const { user } = useAuth();

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
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activeChatsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch(`${process.env.REACT_APP_API_URL}/api/admin/active-chats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
      if (activeChatsRes.ok) {
        const activeChatsData = await activeChatsRes.json();
        setActiveChats(activeChatsData.activeChats || 0);
      }

      // Fetch all reports
      const reportsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/reports`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData.reports || []);
      }

      // Fetch heatmap data
      const heatmapResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/reports/heatmap/data`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (heatmapResponse.ok) {
        const heatmapData = await heatmapResponse.json();
        setHeatmapData(heatmapData.heatmapData || []);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update the report in the local state
        setReports(prev => prev.map(report => 
          report.id === reportId 
            ? { ...report, status: newStatus }
            : report
        ));
        
        // Refresh stats
        fetchDashboardData();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesStatus = filter === 'all' || report.status === filter;
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
    return matchesStatus && matchesPriority && matchesCategory;
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

  const getCategoryStats = () => {
    const categoryCounts: { [key: string]: number } = {};
    reports.forEach(report => {
      const category = categoryLabels[report.category as keyof typeof categoryLabels] || report.category;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    return categoryCounts;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="card">
          <LoadingSpinner text="Loading admin dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            {user?.role === 'moderator' && (
              <Link
                to="/admin/requests"
                className="btn-primary"
              >
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                Admin Requests
              </Link>
            )}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <ShieldCheckIcon className="h-5 w-5" />
              <span>Administrator Access</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-danger-50 border border-danger-200 rounded-md p-4">
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <UsersIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-danger-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-danger-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingReports}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-success-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.resolutionRate}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Category</h3>
            <div className="space-y-3">
              {Object.entries(getCategoryStats()).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{category}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${(count / reports.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <ChartBarIcon className="h-5 w-5 text-primary-500" />
                <span>{stats?.recentReports || 0} new reports today</span>
                <span className="text-gray-400">|</span>
                <span>{activeChats} active conversation{activeChats !== 1 ? 's' : ''}</span>
                <span className="text-gray-400">|</span>
                <span>Ongoing support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Management */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Reports Management</h3>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full md:w-auto">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="input-field text-sm w-full md:w-auto"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="input-field text-sm w-full md:w-auto"
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="input-field text-sm w-full md:w-auto"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden p-4 space-y-4">
            {filteredReports.length === 0 ? (
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                <p className="text-gray-600">Try adjusting your filters or check back later.</p>
              </div>
            ) : (
              filteredReports.map((report) => (
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
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <select
                      value={report.status}
                      onChange={(e) => updateReportStatus(report.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                    </select>
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
                {filteredReports.map((report) => (
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
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <select
                          value={report.status}
                          onChange={(e) => updateReportStatus(report.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="under_review">Under Review</option>
                          <option value="investigating">Investigating</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Heatmap Section */}
        <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Incident Heatmap</h3>
          <IncidentHeatMap />
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

                {/* Assignment logic */}
                {selectedReport.assignedTo &&
                  (isAssignedToObject(selectedReport.assignedTo)
                    ? selectedReport.assignedTo._id !== currentUserId
                    : selectedReport.assignedTo !== currentUserId
                  ) && (
                    <div className="bg-warning-50 border border-warning-200 rounded p-3 text-warning-800 mb-4">
                      Already taken by an admin.
                    </div>
                  )
                }
                {selectedReport.assignedTo &&
                  (isAssignedToObject(selectedReport.assignedTo)
                    ? selectedReport.assignedTo._id === currentUserId
                    : selectedReport.assignedTo === currentUserId
                  ) && (
                    <div className="bg-success-50 border border-success-200 rounded p-3 text-success-800 mb-4">
                      You have taken this case.
                    </div>
                  )
                }
                {(
                  !selectedReport.assignedTo && (
                    <button
                      className="btn-primary mb-4"
                      onClick={async () => {
                        try {
                          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/reports/${selectedReport.id}/assign`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                          });
                          const data = await response.json();
                          if (response.ok) {
                            fetchDashboardData();
                          } else {
                            alert(data.message || 'Failed to assign report');
                          }
                        } catch (err) {
                          alert('Failed to assign report');
                        }
                      }}
                    >
                      Take Up Report
                    </button>
                  )
                )}
                {/* Only show action buttons if not assigned or assigned to this admin */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                  {(
                    !selectedReport.assignedTo ||
                    (isAssignedToObject(selectedReport.assignedTo)
                      ? selectedReport.assignedTo._id === currentUserId
                      : selectedReport.assignedTo === currentUserId
                    )
                  ) && (
                    <button
                      onClick={() => {
                        setSelectedReport(null);
                        navigate(`/chat?reportId=${selectedReport.id}`);
                      }}
                      className="btn-primary"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                      Respond to Report
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

export default AdminDashboard; 