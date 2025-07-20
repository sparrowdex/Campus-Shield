import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RequestAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    reason: '',
    role: '',
    department: '',
    experience: '',
    responsibilities: '',
    urgency: '',
    contactInfo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/request-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/my-reports');
        }, 3000);
      } else {
        setError(data.message || 'Failed to submit request');
      }
    } catch (err: any) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <CheckCircleIcon className="h-16 w-16 text-success-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Request Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Your admin request has been submitted successfully. You will be notified once it's reviewed.
          </p>
          <div className="bg-success-50 border border-success-200 rounded-lg p-4">
            <p className="text-sm text-success-700">
              <strong>Request ID:</strong> {Date.now().toString().slice(-8)}
            </p>
            <p className="text-sm text-success-700 mt-2">
              Status: Pending Review
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Redirecting to My Reports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="h-8 w-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Request Admin Access</h1>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-danger-50 border border-danger-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-danger-400" />
              <p className="ml-3 text-sm text-danger-700">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <ShieldCheckIcon className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Admin access is granted only to authorized campus personnel</li>
                  <li>Your request will be reviewed by existing administrators only</li>
                  <li>Only pre-approved admins can approve new admin requests</li>
                  <li>You will be notified of the decision via email</li>
                  <li>Please provide a detailed reason for your request</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="form-label">
                  Your Role/Position *
                </label>
                <input
                  id="role"
                  name="role"
                  type="text"
                  required
                  value={formData.role}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Security Officer, IT Manager, Dean"
                />
              </div>
              <div>
                <label htmlFor="department" className="form-label">
                  Department/Unit *
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  required
                  value={formData.department}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Campus Security, IT Services, Student Affairs"
                />
              </div>
            </div>
          </div>

          {/* Experience & Qualifications */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Experience & Qualifications</h3>
            <div>
              <label htmlFor="experience" className="form-label">
                Relevant Experience *
              </label>
              <textarea
                id="experience"
                name="experience"
                rows={3}
                required
                value={formData.experience}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Describe your experience with campus safety, incident management, or administrative systems..."
              />
            </div>
          </div>

          {/* Responsibilities */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Responsibilities & Duties</h3>
            <div>
              <label htmlFor="responsibilities" className="form-label">
                Current Responsibilities *
              </label>
              <textarea
                id="responsibilities"
                name="responsibilities"
                rows={3}
                required
                value={formData.responsibilities}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Describe your current responsibilities that would benefit from admin access..."
              />
            </div>
          </div>

          {/* Urgency & Timeline */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Urgency & Timeline</h3>
            <div>
              <label htmlFor="urgency" className="form-label">
                Urgency Level *
              </label>
              <select
                id="urgency"
                name="urgency"
                required
                value={formData.urgency}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Select urgency level</option>
                <option value="low">Low - General administrative needs</option>
                <option value="medium">Medium - Regular operational requirements</option>
                <option value="high">High - Immediate safety/security needs</option>
                <option value="critical">Critical - Emergency response requirements</option>
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Contact Information</h3>
            <div>
              <label htmlFor="contactInfo" className="form-label">
                Additional Contact Details
              </label>
              <textarea
                id="contactInfo"
                name="contactInfo"
                rows={2}
                value={formData.contactInfo}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Phone number, office location, or any additional contact information..."
              />
            </div>
          </div>

          {/* Primary Reason */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Reason for Admin Access</h3>
            <div>
              <label htmlFor="reason" className="form-label">
                Detailed Explanation *
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={4}
                required
                minLength={10}
                maxLength={500}
                value={formData.reason}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Please provide a comprehensive explanation of why you need admin access, how you plan to use it, and the benefits to campus safety..."
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.reason.length}/500 characters (minimum 10 characters)
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">What Admin Access Includes:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• View and manage all incident reports</li>
              <li>• Update report statuses and priorities</li>
              <li>• Access to analytics and statistics</li>
              <li>• Ability to respond to reports</li>
              <li>• Review and approve admin requests</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/my-reports')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.reason.length < 10 || !formData.role || !formData.department || !formData.experience || !formData.responsibilities || !formData.urgency}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestAdmin; 