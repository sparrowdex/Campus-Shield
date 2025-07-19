import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MapPinIcon, 
  CameraIcon, 
  DocumentIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface FormData {
  title: string;
  description: string;
  category: string;
  location: {
    coordinates: [number, number] | null;
    address: string;
    building: string;
    floor: string;
  };
  incidentTime: string;
  attachments: File[];
}

const ReportIncident: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    location: {
      coordinates: null,
      address: '',
      building: '',
      floor: ''
    },
    incidentTime: new Date().toISOString().slice(0, 16),
    attachments: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const categories = [
    { value: 'harassment', label: 'Harassment' },
    { value: 'assault', label: 'Assault' },
    { value: 'theft', label: 'Theft' },
    { value: 'vandalism', label: 'Vandalism' },
    { value: 'suspicious_activity', label: 'Suspicious Activity' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'safety_hazard', label: 'Safety Hazard' },
    { value: 'discrimination', label: 'Discrimination' },
    { value: 'bullying', label: 'Bullying' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'location') {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setError('');
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: [position.coords.longitude, position.coords.latitude]
            }
          }));
        },
        (error) => {
          setError('Unable to get your location. Please enter it manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'audio/wav', 'audio/mp3', 'application/pdf'];
      
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        setError(`File type ${file.type} is not supported.`);
        return false;
      }
      
      return true;
    });

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('incidentTime', formData.incidentTime);
      
      if (formData.location.coordinates) {
        formDataToSend.append('location[coordinates]', JSON.stringify(formData.location.coordinates));
      }
      formDataToSend.append('location[address]', formData.location.address);
      formDataToSend.append('location[building]', formData.location.building);
      formDataToSend.append('location[floor]', formData.location.floor);

      formData.attachments.forEach((file, index) => {
        formDataToSend.append(`attachments`, file);
      });

      const response = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/my-reports');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && (!formData.title || !formData.description || !formData.category)) {
      setError('Please fill in all required fields before continuing.');
      return;
    }
    setCurrentStep(prev => prev + 1);
    setError('');
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center">
          <CheckCircleIcon className="h-16 w-16 text-success-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Submitted Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Your incident report has been submitted anonymously. You will receive updates on the status of your report.
          </p>
          <div className="bg-success-50 border border-success-200 rounded-lg p-4">
            <p className="text-sm text-success-700">
              <strong>Report ID:</strong> {Date.now().toString().slice(-8)}
            </p>
            <p className="text-sm text-success-700 mt-2">
              You can track your report in the "My Reports" section.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-6 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Report an Incident</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500 whitespace-nowrap">
            <span>Step {currentStep} of 3</span>
            <div className="flex space-x-1">
              {[1, 2, 3].map(step => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full ${
                    step <= currentStep ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="form-label">
                  Incident Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Brief description of the incident"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="form-label">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="form-label">
                  Detailed Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="input-field"
                  placeholder="Please provide a detailed description of what happened, including any relevant details..."
                  required
                />
              </div>

              <div>
                <label htmlFor="incidentTime" className="form-label">
                  When did this happen? *
                </label>
                <input
                  type="datetime-local"
                  id="incidentTime"
                  name="incidentTime"
                  value={formData.incidentTime}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <MapPinIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <h3 className="font-medium text-primary-900">Location Information</h3>
                </div>
                <p className="text-sm text-primary-700">
                  Providing accurate location helps authorities respond quickly and identify patterns.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="address" className="form-label">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Street address or general area"
                  />
                </div>

                <div>
                  <label htmlFor="building" className="form-label">
                    Building
                  </label>
                  <input
                    type="text"
                    id="building"
                    name="location.building"
                    value={formData.location.building}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Building name or number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="floor" className="form-label">
                  Floor/Room
                </label>
                <input
                  type="text"
                  id="floor"
                  name="location.floor"
                  value={formData.location.floor}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Floor number or room number"
                />
              </div>

              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={handleLocationClick}
                  className="btn-secondary"
                >
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  Use My Current Location
                </button>
                {formData.location.coordinates && (
                  <span className="text-sm text-success-600">
                    ✓ Location captured
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Attachments */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CameraIcon className="h-5 w-5 text-secondary-600 mr-2" />
                  <h3 className="font-medium text-secondary-900">Attachments (Optional)</h3>
                </div>
                <p className="text-sm text-secondary-700">
                  You can upload photos, videos, or documents related to the incident. Maximum 5 files, 10MB each.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary w-full"
                >
                  <DocumentIcon className="h-4 w-4 mr-2" />
                  Choose Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Selected Files:</h4>
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <DocumentIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Privacy Reminder</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Your report is completely anonymous</li>
                  <li>• Files are securely stored and encrypted</li>
                  <li>• Only authorized personnel can access your report</li>
                  <li>• You can delete your report at any time</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="btn-secondary"
              >
                Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIncident; 