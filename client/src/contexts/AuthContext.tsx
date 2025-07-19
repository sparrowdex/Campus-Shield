import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

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

  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/me');
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, campusId?: string) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        email,
        password,
        campusId
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const loginAnonymous = async (campusId?: string) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/anonymous', {
        campusId
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Anonymous login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updatePreferences = async (preferences: any) => {
    try {
      const response = await axios.put('http://localhost:5000/api/auth/preferences', preferences);
      // Update user preferences in state if needed
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update preferences');
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/admin-login', {
        email,
        password
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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