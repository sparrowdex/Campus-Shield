import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationBar: React.FC = () => {
  const { notifications, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const unread = notifications.filter(n => !n.read);

  if (unread.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-primary-600 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-2 flex flex-col gap-1">
        {unread.map(n => (
          <div key={n.id} className="flex items-center justify-between py-1">
            <span className="text-sm cursor-pointer" onClick={async () => {
              await markAsRead(n.id);
              if (n.link) navigate(n.link);
            }}>
              {n.message}
            </span>
            <button
              className="ml-4 text-xs underline hover:text-primary-200"
              onClick={async () => await markAsRead(n.id)}
            >
              Mark as read
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationBar; 