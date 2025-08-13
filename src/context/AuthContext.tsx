"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

// Define the base URL for API requests
const API_BASE_URL = 'http://localhost:5000/api';

// User and Company types
interface User {
  id: string;
  firstName?: string;
  lastName: string;
  email: string;
  location?: string;
  skills?: string[];
  bio?: string;
  isCompany: false;
  companyName?: string; // Add this line
}

interface Company {
  id: string;
  companyName: string;
  email: string;
  industry?: string;
  location?: string;
  description?: string;
  website?: string;
  isCompany: true;
}

type AuthUser = User | Company;

// Auth context type
interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isCompany: boolean;
  loading: boolean;
  error: string | null;
  token: string | null;
  login: (email: string, password: string, isCompanyLogin?: boolean) => Promise<void>;
  register: (userData: any, isCompanyRegistration?: boolean) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Props type for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isCompany, setIsCompany] = useState<boolean>(false);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUserType = localStorage.getItem('userType');
      
      if (!storedToken) {
        setLoading(false);
        return;
      }
      
      setToken(storedToken);
      
      try {
        const endpoint = storedUserType === 'company' ? '/auth/me' : '/users/me';
        const response = await axios.get<AuthUser>(`${API_BASE_URL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${storedToken}`
          }
        });
        
        setUser(response.data);
        setIsAuthenticated(true);
        setIsCompany(storedUserType === 'company');
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        setToken(null);
        setError('Authentication session expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string, isCompanyLogin = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = isCompanyLogin ? '/auth/login' : '/users/login';
      const response = await axios.post<{ token: string; user: AuthUser }>(`${API_BASE_URL}${endpoint}`, {
        email,
        password
      });
      
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userType', isCompanyLogin ? 'company' : 'user');
      
      setToken(token);
      setUser(userData);
      setIsAuthenticated(true);
      setIsCompany(isCompanyLogin);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: any, isCompanyRegistration = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = isCompanyRegistration ? '/auth/register' : '/users/register';
      const response = await axios.post<{ token: string; user: AuthUser }>(`${API_BASE_URL}${endpoint}`, userData);
      
      const { token, user: newUser } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userType', isCompanyRegistration ? 'company' : 'user');
      
      setToken(token);
      setUser(newUser);
      setIsAuthenticated(true);
      setIsCompany(isCompanyRegistration);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsCompany(false);
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Context value
  const value = {
    isAuthenticated,
    user,
    isCompany,
    loading,
    error,
    token,
    login,
    register,
    logout,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;