import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheckIcon, 
  EyeIcon, 
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: EyeIcon,
      title: 'Anonymous Reporting',
      description: 'Submit safety incidents anonymously to protect your privacy while helping keep campus safe.'
    },
    {
      icon: MapPinIcon,
      title: 'Real-time Heatmap',
      description: 'View live incident patterns across campus to stay informed about safety in your area.'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Secure Communication',
      description: 'Chat anonymously with campus authorities for follow-up questions and support.'
    },
    {
      icon: ClockIcon,
      title: '24/7 Availability',
      description: 'Report incidents anytime, anywhere. Our system is always available when you need it.'
    },
    {
      icon: UserGroupIcon,
      title: 'Community Support',
      description: 'Join anonymous support groups with others who have experienced similar situations.'
    },
    {
      icon: ChartBarIcon,
      title: 'Smart Analytics',
      description: 'AI-powered categorization and prioritization ensures urgent reports get immediate attention.'
    }
  ];

  const stats = [
    { label: 'Anonymous Reports', value: '100%' },
    { label: 'Response Time', value: '< 24h' },
    { label: 'Campus Coverage', value: '100%' },
    { label: 'Privacy Protected', value: 'Always' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <ShieldCheckIcon className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {user?.role === 'admin' && 'Welcome, Admin! '}
              {user?.role === 'moderator' && 'Welcome, Moderator! '}
              Campus Safety,{' '}
              <span className="text-primary-200">Privacy First</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Report campus safety incidents anonymously. Stay informed with real-time alerts. 
              Help create a safer campus community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user?.role === 'user' && (
                <>
                  <Link to="/report" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                    Report Incident
                  </Link>
                  <Link to="/my-reports" className="btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600">
                    View My Reports
                  </Link>
                </>
              )}
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                    Admin Dashboard
                  </Link>
                  <Link to="/chat" className="btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600">
                    Chat
                  </Link>
                </>
              )}
              {user?.role === 'moderator' && (
                <>
                  <Link to="/admin/requests" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                    Admin Requests
                  </Link>
                </>
              )}
              {!user && (
                <>
                  <Link to="/register" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                    Get Started
                  </Link>
                  <Link to="/login" className="btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose CampusShield?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our privacy-first approach ensures you can report safety concerns without fear, 
              while powerful features help keep everyone informed and protected.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center mb-4">
                  <feature.icon className="h-8 w-8 text-primary-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, secure, and anonymous reporting in just a few steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Incident</h3>
              <p className="text-gray-600">
                Submit a detailed report with location, description, and optional media attachments.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Processing</h3>
              <p className="text-gray-600">
                Our AI categorizes and prioritizes your report for appropriate response.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Stay Updated</h3>
              <p className="text-gray-600">
                Receive updates on your report and chat with authorities if needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make Campus Safer?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already using CampusShield to report 
            safety concerns and stay informed.
          </p>
          {user ? (
            <>
              {user?.role === 'user' && (
                <Link to="/report" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                  Report an Incident
                </Link>
              )}
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                    Admin Dashboard
                  </Link>
                  <Link to="/chat" className="btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600">
                    Chat
                  </Link>
                </>
              )}
              {user?.role === 'moderator' && (
                <>
                  <Link to="/admin/requests" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                    Admin Requests
                  </Link>
                </>
              )}
              {!user && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                    Get Started Now
                  </Link>
                  <Link to="/login" className="btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600">
                    Login
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                Get Started Now
              </Link>
              <Link to="/login" className="btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600">
                Login
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Emergency Notice */}
      <div className="bg-danger-50 border-l-4 border-danger-400 p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-danger-400" />
          <div className="ml-3">
            <p className="text-sm text-danger-700">
              <strong>Emergency?</strong> If you're in immediate danger, call campus security or 911 immediately. 
              CampusShield is for non-emergency safety reporting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 