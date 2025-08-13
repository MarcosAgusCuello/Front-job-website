"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';

// Type definitions
type Experience = {
  _id?: string;
  title: string;
  company: string;
  location: string;
  from: string;
  to?: string;
  current?: boolean;
  description?: string;
};

type Education = {
  _id?: string;
  degree: string;
  fieldOfStudy: string;
  school: string;
  from: string;
  to?: string;
  current?: boolean;
  description?: string;
};

type Profile = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  location?: string;
  bio?: string;
  avatar?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  resume?: string;
};

// Modal Component for Confirmations
const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  confirmText, 
  cancelText, 
  onConfirm, 
  onCancel 
}: { 
  isOpen: boolean; 
  title: string; 
  message: string; 
  confirmText: string; 
  cancelText: string; 
  onConfirm: () => void; 
  onCancel: () => void; 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-sm shadow-lg max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 focus:outline-none"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 focus:outline-none"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Form components
const ExperienceForm = ({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (data: Experience) => void; 
  onCancel: () => void; 
}) => {
  const [formData, setFormData] = useState<Experience>({
    title: '',
    company: '',
    location: '',
    from: '',
    to: '',
    current: false,
    description: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <div className="bg-white rounded-sm shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Add Experience</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title*</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company*</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date*</label>
            <input
              type="date"
              name="from"
              value={formData.from}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              name="current"
              checked={formData.current}
              onChange={handleCheckbox}
              id="current-job"
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <label htmlFor="current-job" className="ml-2 block text-sm text-gray-700">
              Current Position
            </label>
          </div>
          
          {!formData.current && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                name="to"
                value={formData.to}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-sm hover:bg-gray-800"
          >
            Add Experience
          </button>
        </div>
      </form>
    </div>
  );
};

const EducationForm = ({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (data: Education) => void; 
  onCancel: () => void; 
}) => {
  const [formData, setFormData] = useState<Education>({
    school: '',
    degree: '',
    fieldOfStudy: '',
    from: '',
    to: '',
    current: false,
    description: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <div className="bg-white rounded-sm shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Add Education</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School*</label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Degree*</label>
            <input
              type="text"
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study*</label>
            <input
              type="text"
              name="fieldOfStudy"
              value={formData.fieldOfStudy}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date*</label>
            <input
              type="date"
              name="from"
              value={formData.from}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              name="current"
              checked={formData.current}
              onChange={handleCheckbox}
              id="current-education"
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <label htmlFor="current-education" className="ml-2 block text-sm text-gray-700">
              Currently Studying
            </label>
          </div>
          
          {!formData.current && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                name="to"
                value={formData.to}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-sm hover:bg-gray-800"
          >
            Add Education
          </button>
        </div>
      </form>
    </div>
  );
};

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, token, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !token) {
        router.push('/auth/login');
        return;
      }
      
      try {
        setLoading(true);
        const response = await axios.get<Profile>('http://localhost:5000/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProfile(response.data);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, token, router]);

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Add experience to profile
  const addExperience = async (experienceData: Experience) => {
    if (!token) return;
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/users/experience',
        experienceData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the profile state with the new experience
      setProfile(prev => {
        if (!prev) return prev;
        const data = response.data as { experience: Experience };
        return {
          ...prev,
          experience: [...(prev.experience || []), data.experience]
        };
      });
      
      setShowExperienceForm(false);
      showNotification('success', 'Experience added successfully');
    } catch (err: any) {
      console.error('Error adding experience:', err);
      showNotification('error', err.response?.data?.message || 'Failed to add experience');
    }
  };

  // Add education to profile
  const addEducation = async (educationData: Education) => {
    if (!token) return;
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/users/education',
        educationData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the profile state with the new education
      setProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          education: [...(prev.education || []), (response.data as { education: Education }).education]
        };
      });
      
      setShowEducationForm(false);
      showNotification('success', 'Education added successfully');
    } catch (err: any) {
      console.error('Error adding education:', err);
      showNotification('error', err.response?.data?.message || 'Failed to add education');
    }
  };

  // Delete user account
  const deleteAccount = async () => {
    if (!token) return;
    
    try {
      await axios.delete('http://localhost:5000/api/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Log out the user after account deletion
      logout();
      router.push('/');
    } catch (err: any) {
      console.error('Error deleting account:', err);
      showNotification('error', err.response?.data?.message || 'Failed to delete account');
      setDeleteAccountModal(false);
    }
  };

  // Show notification helper
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white shadow-sm rounded-sm p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-black text-white rounded-sm hover:bg-gray-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white shadow-sm rounded-sm p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">We couldn't find your profile information.</p>
            <Link href="/user/dashboard" className="px-4 py-2 bg-black text-white rounded-sm hover:bg-gray-800">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Notification */}
        {notification && (
          <div 
            className={`mb-6 p-4 rounded-sm ${
              notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {notification.message}
          </div>
        )}
        
        {/* Header with actions */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
          <div className="flex space-x-3">
            <Link 
              href="/user/dashboard" 
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50"
            >
              Dashboard
            </Link>
            <Link
              href="/user/profile/edit"
              className="px-4 py-2 bg-black text-white rounded-sm hover:bg-gray-800"
            >
              Edit Profile
            </Link>
          </div>
        </div>
        
        {/* Personal Information Section */}
        <div className="bg-white shadow-sm rounded-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-2xl font-medium overflow-hidden mb-4 sm:mb-0 sm:mr-6">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{profile.firstName.charAt(0)}</span>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-3">{profile.firstName} {profile.lastName}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{profile.location || 'Not specified'}</p>
                </div>
              </div>
              
              {profile.bio && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Bio</p>
                  <p className="text-gray-700 whitespace-pre-line">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Resume Section (if applicable) */}
        {profile.resume && (
          <div className="bg-white shadow-sm rounded-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Resume</h2>
            
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-sm">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="font-medium">Your Resume</p>
                  <p className="text-sm text-gray-500">Uploaded resume document</p>
                </div>
              </div>
              
              <a 
                href={profile.resume} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1 bg-black text-white text-sm rounded-sm hover:bg-gray-800"
              >
                View
              </a>
            </div>
          </div>
        )}
        
        {/* Skills Section */}
        <div className="bg-white shadow-sm rounded-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Skills</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {profile.skills && profile.skills.length > 0 ? (
              profile.skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="bg-gray-100 px-3 py-1 rounded-sm text-gray-800"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500">No skills added yet</p>
            )}
          </div>
        </div>
        
        {/* Experience Section */}
        <div className="bg-white shadow-sm rounded-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Experience</h2>
            <button 
              onClick={() => setShowExperienceForm(true)}
              className="text-black hover:text-gray-600 font-medium text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Experience
            </button>
          </div>
          
          {showExperienceForm ? (
            <ExperienceForm 
              onSubmit={addExperience} 
              onCancel={() => setShowExperienceForm(false)} 
            />
          ) : profile.experience && profile.experience.length > 0 ? (
            <div className="space-y-6">
              {profile.experience.map((exp, index) => (
                <div key={exp._id || index} className={index > 0 ? "pt-6 border-t border-gray-200" : ""}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{exp.title}</h3>
                      <p className="text-gray-600">{exp.company}</p>
                      {exp.location && <p className="text-gray-600 text-sm">{exp.location}</p>}
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(exp.from)} - {exp.current ? 'Present' : formatDate(exp.to)}
                    </p>
                  </div>
                  {exp.description && (
                    <p className="mt-2 text-gray-700 whitespace-pre-line">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No experience added yet</p>
          )}
        </div>
        
        {/* Education Section */}
        <div className="bg-white shadow-sm rounded-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Education</h2>
            <button 
              onClick={() => setShowEducationForm(true)}
              className="text-black hover:text-gray-600 font-medium text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Education
            </button>
          </div>
          
          {showEducationForm ? (
            <EducationForm 
              onSubmit={addEducation} 
              onCancel={() => setShowEducationForm(false)} 
            />
          ) : profile.education && profile.education.length > 0 ? (
            <div className="space-y-6">
              {profile.education.map((edu, index) => (
                <div key={edu._id || index} className={index > 0 ? "pt-6 border-t border-gray-200" : ""}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{edu.degree} in {edu.fieldOfStudy}</h3>
                      <p className="text-gray-600">{edu.school}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(edu.from)} - {edu.current ? 'Present' : formatDate(edu.to)}
                    </p>
                  </div>
                  {edu.description && (
                    <p className="mt-2 text-gray-700 whitespace-pre-line">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No education added yet</p>
          )}
        </div>
        
        {/* Account Actions */}
        <div className="bg-white shadow-sm rounded-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
          
          <div className="flex flex-col space-y-4">
            <Link
              href="/user/profile/edit"
              className="inline-flex items-center text-gray-700 hover:text-black"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile Information
            </Link>
            
            <Link
              href="/user/change-password"
              className="inline-flex items-center text-gray-700 hover:text-black"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Change Password
            </Link>
            
            <button
              onClick={() => setDeleteAccountModal(true)}
              className="inline-flex items-center text-red-600 hover:text-red-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Account
            </button>
          </div>
        </div>
        
        {/* Delete Account Modal */}
        <ConfirmModal
          isOpen={deleteAccountModal}
          title="Delete Account"
          message="Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data including your profile, applications, and saved jobs."
          confirmText="Delete Account"
          cancelText="Cancel"
          onConfirm={deleteAccount}
          onCancel={() => setDeleteAccountModal(false)}
        />
      </div>
    </div>
  );
}