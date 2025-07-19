import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ShieldCheckIcon, 
  Bars3Icon, 
  XMarkIcon,
  UserIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '../../contexts/NotificationContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = notifications.filter(n => !n.read);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Home', href: '/', current: true },
    ...(user && user.role === 'user' ? [
      { name: 'Report Incident', href: '/report', current: false },
      { name: 'My Reports', href: '/my-reports', current: false },
      { name: 'Chat', href: '/chat', current: false },
    ] : []),
    ...(user?.role === 'admin' ? [
      { name: 'Admin Dashboard', href: '/admin', current: false },
      { name: 'Chat', href: '/chat', current: false },
    ] : []),
    ...(user?.role === 'moderator' ? [
      { name: 'Admin Requests', href: '/admin/requests', current: false },
    ] : []),
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">CampusShield</span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - Auth buttons or user menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    className="relative focus:outline-none"
                    onClick={() => setNotifOpen(true)}
                  >
                    <BellIcon className="h-6 w-6 text-gray-600 hover:text-primary-600" />
                    {unread.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow">
                        {unread.length}
                      </span>
                    )}
                  </button>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <UserIcon className="h-4 w-4" />
                  <span>
                    {user.isAnonymous ? 'Anonymous User' : user.email}
                  </span>
                  {user.role === 'admin' && (
                    <span className="badge badge-info">Admin</span>
                  )}
                </div>
                {user.role !== 'admin' && (
                  <Link to="/request-admin" className="text-sm text-primary-600 hover:text-primary-500">
                    Request Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="btn-secondary"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
                <Link to="/admin-login" className="text-sm text-gray-500 hover:text-gray-700">
                  Admin
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          {/* Notification Bell in mobile menu */}
          {user && (
            <div className="flex items-center px-4 pt-2 pb-1 border-t border-gray-200">
              <button
                className="relative focus:outline-none mr-4"
                onClick={() => { setNotifOpen(true); setIsMenuOpen(false); }}
                aria-label="Open notifications"
              >
                <BellIcon className="h-6 w-6 text-gray-600 hover:text-primary-600" />
                {unread.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow">
                    {unread.length}
                  </span>
                )}
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <UserIcon className="h-4 w-4" />
                <span>
                  {user.isAnonymous ? 'Anonymous User' : user.email}
                </span>
                {user.role === 'admin' && (
                  <span className="badge badge-info">Admin</span>
                )}
              </div>
            </div>
          )}
          {user ? (
            <div className="pt-2 pb-3">
              {user.role !== 'admin' && (
                <Link to="/request-admin" className="block px-4 py-2 text-base text-primary-600 hover:text-primary-500" onClick={() => setIsMenuOpen(false)}>
                  Request Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="space-y-1">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
                <Link
                  to="/admin-login"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Access
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slide-in Notification Panel */}
      {notifOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:justify-end">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 transition-opacity duration-300"
            onClick={() => setNotifOpen(false)}
          />
          {/* Panel */}
          <div className="relative w-full max-w-md md:max-w-md h-full bg-white shadow-xl border-l border-gray-200 flex flex-col animate-slide-in-right md:rounded-none md:h-full md:w-full sm:max-w-full sm:w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <span className="text-lg font-semibold text-gray-800">Notifications</span>
              <button onClick={() => setNotifOpen(false)} className="p-2 rounded hover:bg-gray-100 md:p-1">
                <XMarkIcon className="h-7 w-7 text-gray-500 md:h-6 md:w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {unread.length === 0 ? (
                <div className="text-gray-500 text-sm text-center mt-12">No unread notifications</div>
              ) : (
                unread.map(n => (
                  <div
                    key={n.id}
                    className="flex items-start justify-between bg-gray-50 rounded-lg p-4 shadow-sm hover:bg-primary-50 transition cursor-pointer group"
                  >
                    <div className="flex-1 pr-2 text-sm text-gray-800" onClick={async () => {
                      await markAsRead(n.id);
                      setNotifOpen(false);
                      if (n.link) navigate(n.link);
                    }}>
                      {n.message}
                    </div>
                    <button
                      className="ml-2 text-xs px-3 py-2 rounded bg-primary-100 text-primary-700 hover:bg-primary-200 font-medium transition group-hover:bg-primary-200 md:px-2 md:py-1"
                      onClick={async () => await markAsRead(n.id)}
                    >
                      Mark as read
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 