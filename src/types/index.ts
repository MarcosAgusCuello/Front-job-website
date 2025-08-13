// src/types/index.ts

// Basic User Interface
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

// Experience Interface (for user profile)
export interface Experience {
  _id?: string;
  title: string;
  company: string;
  location: string;
  from: string;
  to?: string;
  current: boolean;
  description: string;
}

// Education Interface (for user profile)
export interface Education {
  _id?: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  from: string;
  to?: string;
  current: boolean;
  description: string;
}

// Company Interface
export interface Company {
  _id: string;
  companyName: string;
  email: string;
  industry?: string;
  location?: string;
  website?: string;
  description?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

// Job Interface
export interface Job {
  _id: string;
  title: string;
  company: string | Company;
  location: string;
  description: string;
  requirements: string[];
  responsibilities?: string[];
  type: string; // "Full-time", "Part-time", "Contract", etc.
  salary?: string;
  applicationLink?: string;
  skills: string[];
  experience: string; // "Entry-level", "Mid-level", "Senior", etc.
  education: string; // "High School", "Bachelor's", "Master's", etc.
  deadline?: string;
  status: string; // "active", "closed", "draft"
  postedAt: string;
  updatedAt: string;
  applicationsCount?: number;
}

// Application Interface
export interface Application {
  _id: string;
  job: string | Job;
  user: string | User;
  coverLetter: string;
  resume: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
}

// Application Status Type
export type ApplicationStatus = 'pending' | 'reviewed' | 'interviewing' | 'rejected' | 'accepted';

// API Response Interfaces
export interface PaginatedResponse<T> {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  items: T[];
}

export interface JobsResponse extends PaginatedResponse<Job> {
  jobs: Job[];
  totalJobs: number;
}

export interface ApplicationsResponse extends PaginatedResponse<Application> {
  applications: Application[];
  totalApplications: number;
}

// Auth Response Interfaces
export interface AuthResponse {
  token: string;
  user?: User;
  company?: Company;
}

export interface ErrorResponse {
  message: string;
  error?: string;
}

// Form Data Interfaces
export interface UserRegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  location?: string;
  bio?: string;
  skills?: string[];
}

export interface CompanyRegisterData {
  companyName: string;
  email: string;
  password: string;
  industry?: string;
  location?: string;
  website?: string;
  description?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface JobFormData {
  title: string;
  location: string;
  description: string;
  requirements: string[];
  type: string;
  salary?: string;
  applicationLink?: string;
  skills: string[];
  experience: string;
  education: string;
  deadline?: string;
  status?: string;
}

export interface ApplicationFormData {
  jobId: string;
  coverLetter: string;
  resume: string;
}

// Filter & Search Interfaces
export interface JobFilters {
  title?: string;
  location?: string;
  type?: string;
  skills?: string[];
  company?: string;
  page?: number;
  limit?: number;
}

export interface JobSearchParams {
  q: string;
  page?: number;
  limit?: number;
}

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship' | 'Remote';