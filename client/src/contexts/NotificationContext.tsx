import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

export interface Notification {
  id: string;
  type: 'chat' | 'status' | 'other';
  message: string;
  link?: string;
  read: boolean;
  timestamp: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notif: Omit<Notification, 'id' | 'read' | 'timestamp'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  clearNotifications: () => void;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/notifications`);
      if (res.data.success) {
        setNotifications(
          res.data.notifications.map((n: any) => ({
            id: n._id,
            type: n.type,
            message: n.message,
            link: n.link,
            read: n.read,
            timestamp: n.timestamp,
          }))
        );
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Add notification (persist to backend)
  const addNotification = async (notif: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/notifications`, notif);
      if (res.data.success) {
        const n = res.data.notification;
        const newNotif: Notification = {
          id: n._id,
          type: n.type,
          message: n.message,
          link: n.link,
          read: n.read,
          timestamp: n.timestamp,
        };
        setNotifications((prev) => [newNotif, ...prev]);
        toast.info(newNotif.message, { autoClose: 5000 });
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  // Mark notification as read (persist to backend)
  const markAsRead = async (id: string) => {
    try {
      const res = await axios.patch(`${process.env.REACT_APP_API_URL}/api/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, clearNotifications, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}; 