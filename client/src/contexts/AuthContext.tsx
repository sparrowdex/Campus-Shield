import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Axios interceptor to automatically attach the token to every request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Types
interface User {
  id: string;
  anonymousId: string;
  email?: string;
  role: 'user' | 'admin' | 'moderator';
  isAnonymous: boolean;
  campusId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, campusId?: string) => Promise<void>;
  loginAnonymous: (campusId?: string) => Promise<void>;
  logout: () => void;
  updatePreferences: (preferences: any) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`);
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        email,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, campusId?: string) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        email,
        password,
        campusId
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const loginAnonymous = async (campusId?: string) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/anonymous`, {
        campusId
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Anonymous login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updatePreferences = async (preferences: any) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/auth/preferences`, preferences);
      // Update user preferences in state if needed
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update preferences');
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/admin-login`, {
        email,
        password
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Admin login failed');
    }
  };

  const value: AuthContextType & { adminLogin: typeof adminLogin } = {
    user,
    loading,
    login,
    register,
    loginAnonymous,
    logout,
    updatePreferences,
    adminLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 