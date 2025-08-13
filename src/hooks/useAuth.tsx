import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Define types for auth data
interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  isCompany: false;
}

interface Company {
  id: string;
  companyName: string;
  email: string;
  isCompany: true;
}

type AuthUser = User | Company;

interface AuthResponse {
  token: string;
  user?: User;
  company?: Company;
  message?: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isCompany: boolean;
  error: string | null;
  login: (email: string, password: string, isCompany?: boolean) => Promise<boolean>;
  register: (userData: any, isCompany?: boolean) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCompany, setIsCompany] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is already logged in (on mount)
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Determine which endpoint to use based on user type
        const endpoint = userType === 'company' ? '/auth/me' : '/users/me';
        
        const response = await axios.get<AuthResponse>(`${API_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (userType === 'company' && response.data.company) {
          setUser({ ...response.data.company, isCompany: true });
          setIsCompany(true);
        } else if (response.data.user) {
          setUser({ ...response.data.user, isCompany: false });
          setIsCompany(false);
        } else {
          setUser(null);
          setIsCompany(false);
        }
        setIsAuthenticated(true);
      } catch (err) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        console.error('Auth token validation failed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string, isCompanyLogin = false): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const endpoint = isCompanyLogin ? '/auth/login' : '/users/login';
      
      const response = await axios.post<AuthResponse>(`${API_URL}${endpoint}`, {
        email,
        password
      });
      
      // Extract data from response
      const { token, user: userData, company: companyData } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('userType', isCompanyLogin ? 'company' : 'user');
      
      // Update state
      if (isCompanyLogin && companyData) {
        setUser({...companyData, isCompany: true});
        setIsCompany(true);
      } else if (userData) {
        setUser({...userData, isCompany: false});
        setIsCompany(false);
      }
      
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  // Register function
  const register = async (userData: any, isCompanyRegistration = false): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const endpoint = isCompanyRegistration ? '/auth/register' : '/users/register';
      
      const response = await axios.post<AuthResponse>(`${API_URL}${endpoint}`, userData);
      
      // Extract data from response
      const { token, user: userData2, company: companyData } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('userType', isCompanyRegistration ? 'company' : 'user');
      
      // Update state
      if (isCompanyRegistration && companyData) {
        setUser({...companyData, isCompany: true});
        setIsCompany(true);
      } else if (userData2) {
        setUser({...userData2, isCompany: false});
        setIsCompany(false);
      }
      
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    setUser(null);
    setIsAuthenticated(false);
    setIsCompany(false);
    router.push('/login');
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    isCompany,
    error,
    login,
    register,
    logout,
    clearError
  };
};

export default useAuth;