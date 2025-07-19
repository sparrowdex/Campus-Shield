import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  UserIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface AdminRequest {
  id: string;
  userId: string;
  reason: string;
  role: string;
  department: string;
  experience: string;
  responsibilities: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  contactInfo: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  user?: {
    email: string;
    anonymousId: string;
  };
}

const AdminRequests: React.FC = () => {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
      } else {
        setError('Failed to fetch admin requests');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/requests/${requestId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: reviewNotes })
      });

      if (response.ok) {
        await fetchRequests();
        setSelectedRequest(null);
        setReviewNotes('');
      } else {
        setError('Failed to update request');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'text-gray-600 bg-gray-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredRequests = requests.filter(request => 
    filter === 'all' ? true : request.status === filter
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-4 sm:gap-0">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="h-8 w-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Access Requests</h1>
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="input-field w-full sm:w-auto"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <ShieldCheckIcon className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Moderator Review Access</h3>
              <p className="text-sm text-blue-700 mt-1">
                Only moderators can review and approve admin access requests. 
                This ensures proper oversight and security of the admin approval process.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-danger-50 border border-danger-200 rounded-md p-4">
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No admin requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4 w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex-1 w-full">
                    <div className="flex items-center space-x-3 mb-3">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 break-words">
                          {request.user?.email || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Requested on {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Role:</span>
                        <p className="text-sm text-gray-900">{request.role}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Department:</span>
                        <p className="text-sm text-gray-900">{request.department}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Urgency:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                      {request.status === 'pending' && (
                        <ClockIcon className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row flex-wrap gap-2 mt-2 sm:mt-0 ml-0 sm:ml-4 w-full sm:w-auto">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View Details
                    </button>
                    {request.status === 'pending' && (
                      <div className="flex flex-row flex-wrap gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleReview(request.id, 'approve')}
                          className="btn-success w-full sm:w-auto flex items-center justify-center gap-2"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReview(request.id, 'reject')}
                          className="btn-danger w-full sm:w-auto flex items-center justify-center gap-2"
                        >
                          <XCircleIcon className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Applicant Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Email:</span>
                      <p className="text-sm text-gray-900">{selectedRequest.user?.email}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Role:</span>
                      <p className="text-sm text-gray-900">{selectedRequest.role}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Department:</span>
                      <p className="text-sm text-gray-900">{selectedRequest.department}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Urgency:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(selectedRequest.urgency)}`}>
                        {selectedRequest.urgency.charAt(0).toUpperCase() + selectedRequest.urgency.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Experience</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedRequest.experience}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Current Responsibilities</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedRequest.responsibilities}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Reason for Admin Access</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedRequest.reason}</p>
                </div>

                {selectedRequest.contactInfo && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Additional Contact</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedRequest.contactInfo}</p>
                  </div>
                )}

                {selectedRequest.status === 'pending' && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Review Notes</h3>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="input-field"
                      rows={3}
                      placeholder="Add notes about your decision..."
                    />
                  </div>
                )}

                {selectedRequest.status !== 'pending' && selectedRequest.reviewNotes && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Review Notes</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedRequest.reviewNotes}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                  {selectedRequest.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleReview(selectedRequest.id, 'approve')}
                        className="btn-success"
                      >
                        Approve Request
                      </button>
                      <button
                        onClick={() => handleReview(selectedRequest.id, 'reject')}
                        className="btn-danger"
                      >
                        Reject Request
                      </button>
                    </>
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

export default AdminRequests; 