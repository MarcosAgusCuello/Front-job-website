import axios from 'axios';

// Base URL for API requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests when available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const auth = {
  // Company registration
  registerCompany: async (companyData: any) => {
    const response = await api.post('/auth/register', companyData);
    const data = response.data as { token?: string };
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', 'company');
    }
    return data;
  },

  // Company login
  loginCompany: async (credentials: any) => {
    const response = await api.post<{ token?: string }>('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userType', 'company');
    }
    return response.data;
  },

  // Check if user is authenticated
  checkAuth: async () => {
    try {
      const userType = localStorage.getItem('userType');
      if (userType === 'company') {
        const response = await api.get('/auth/me');
        return { isAuthenticated: true, user: response.data, userType };
      } else if (userType === 'user') {
        const response = await api.get('/users/me');
        return { isAuthenticated: true, user: response.data, userType };
      }
      return { isAuthenticated: false };
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      return { isAuthenticated: false };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
  }
};

// User API
export const users = {
  // User registration
  register: async (userData: any) => {
    const response = await api.post('/users/register', userData);
    const data = response.data as { token?: string };
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', 'user');
    }
    return data;
  },

  // User login
  login: async (credentials: any) => {
    const response = await api.post('/users/login', credentials);
    const data = response.data as { token?: string };
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', 'user');
    }
    return data;
  },

  // Update user profile
  updateProfile: async (userData: any) => {
    return api.put('/users/profile', userData);
  },

  // Add experience to profile
  addExperience: async (experienceData: any) => {
    return api.post('/users/experience', experienceData);
  },

  // Add education to profile
  addEducation: async (educationData: any) => {
    return api.post('/users/education', educationData);
  },

  // Delete user account
  deleteAccount: async () => {
    const response = await api.delete('/users');
    if (response.status === 200) {
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
    }
    return response.data;
  }
};

// Jobs API
export const jobs = {
  // Get all jobs with optional filters
  getJobs: async (params = {}) => {
    return api.get('/jobs', { params });
  },

  // Get job details by ID
  getJobById: async (jobId: any) => {
    return api.get(`/jobs/${jobId}`);
  },

  // Create a new job (company only)
  createJob: async (jobData: any) => {
    return api.post('/jobs', jobData);
  },

  // Update job (company only)
  updateJob: async (jobId: any, jobData: any) => {
    return api.put(`/jobs/${jobId}`, jobData);
  },

  // Delete job (company only)
  deleteJob: async (jobId: any) => {
    return api.delete(`/jobs/${jobId}`);
  },

  // Get company's posted jobs (company only)
  getCompanyJobs: async (params = {}) => {
    return api.get('/jobs/company', { params });
  },

  // Search jobs
  searchJobs: async (searchParams: any) => {
    return api.get('/jobs/search', { params: searchParams });
  }
};

// Applications API
export const applications = {
  // Apply for a job (user only)
  applyForJob: async (applicationData: any) => {
    return api.post('/applications/apply', applicationData);
  },

  // Get user's applications (user only)
  getUserApplications: async (params = {}) => {
    return api.get('/applications/user/applications', { params });
  },

  // Withdraw application (user only)
  withdrawApplication: async (applicationId: any) => {
    return api.delete(`/applications/withdraw/${applicationId}`);
  },

  // Get applications for a job (company only)
  getJobApplications: async (jobId: any, params = {}) => {
    return api.get(`/applications/job/${jobId}`, { params });
  },

  // Update application status (company only)
  updateApplicationStatus: async (applicationId: any, status: any) => {
    return api.put(`/applications/${applicationId}/status`, { status });
  }
};

export default {
  auth,
  users,
  jobs,
  applications
};