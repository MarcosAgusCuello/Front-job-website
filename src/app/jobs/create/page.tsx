"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

const JobTypes = [
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Freelance', label: 'Freelance' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Remote', label: 'Remote' }
];

// Function to fetch company jobs
const getCompanyJobs = async (token: string) => {
  try {
    const response = await axios.get('http://localhost:5000/api/jobs/company/myjobs', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    throw error;
  }
};

export default function CreateJobPage() {
  const router = useRouter();
  const { isAuthenticated, isCompany, token, user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    location: '',
    salary: '',
    type: '',
    contactEmail: '',
    // Adding the missing required fields
    skills: [''],
    experience: '',
    education: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Define a type for a job object, or use 'any' if you don't have a type yet
  type Job = {
    [key: string]: any;
  };

  // Redirect if not authenticated or not a company
  if (!isAuthenticated || !isCompany) {
    router.push('/auth/login');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle array field changes (requirements, responsibilities, skills)
  const handleArrayChange = (index: number, value: string, field: 'requirements' | 'responsibilities' | 'skills') => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  // Add a new item to an array field
  const handleAddItem = (field: 'requirements' | 'responsibilities' | 'skills') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  // Remove an item from an array field
  const handleRemoveItem = (index: number, field: 'requirements' | 'responsibilities' | 'skills') => {
    if (formData[field].length <= 1) return; // Keep at least one item

    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Clean up the arrays - filter out empty items
    const cleanRequirements = formData.requirements.filter(item => item.trim() !== '');
    const cleanResponsibilities = formData.responsibilities.filter(item => item.trim() !== '');
    const cleanSkills = formData.skills.filter(item => item.trim() !== '');

    // Make sure we have required fields
    if (!formData.title || !formData.description || !formData.location || !formData.type ||
      !formData.experience || !formData.education || cleanSkills.length === 0) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    // Create the job data object
    const jobData = {
      title: formData.title,
      description: formData.description,
      requirements: cleanRequirements,
      responsibilities: cleanResponsibilities,
      location: formData.location,
      salary: formData.salary || undefined,
      type: formData.type,
      contactEmail: formData.contactEmail || undefined,
      // Include the missing required fields
      skills: cleanSkills,
      experience: formData.experience,
      education: formData.education,
      status: 'active' // Default to active
    };

    try {
      console.log('User object:', user); // Log the user object to debug
      console.log('Submitting job data:', jobData);

      // Send POST request to create the job
      const response = await axios.post('http://localhost:5000/api/jobs', jobData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Job created successfully:', response.data);

      // Navigate to the jobs management page on success
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Failed to create job:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to create job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create a detailed job listing to attract the right candidates
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white shadow rounded-sm p-6 mb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="e.g., Senior Software Engineer"
              />
            </div>

            {/* Job Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Job Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              >
                {JobTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="e.g., New York, NY or Remote"
              />
            </div>

            {/* Experience - New Required Field */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                Experience Required <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="experience"
                name="experience"
                required
                value={formData.experience}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="e.g., 3+ years of experience in software development"
              />
            </div>

            {/* Education - New Required Field */}
            <div>
              <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                Education Required <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="education"
                name="education"
                required
                value={formData.education}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="e.g., Bachelor's degree in Computer Science or related field"
              />
            </div>

            {/* Salary */}
            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                Salary Range
              </label>
              <input
                type="text"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="e.g., $80,000 - $100,000 per year"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                required
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="Provide a detailed description of the job..."
              />
            </div>

            {/* Skills - New Required Field */}
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Skills Required <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleAddItem('skills')}
                  className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  + Add Skill
                </button>
              </div>
              <div className="mt-2 space-y-3">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'skills')}
                      className="block w-full border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                      placeholder={`Skill ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index, 'skills')}
                      className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Requirements <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleAddItem('requirements')}
                  className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  + Add
                </button>
              </div>
              <div className="mt-2 space-y-3">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'requirements')}
                      className="block w-full border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                      placeholder={`Requirement ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index, 'requirements')}
                      className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Responsibilities */}
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Responsibilities
                </label>
                <button
                  type="button"
                  onClick={() => handleAddItem('responsibilities')}
                  className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  + Add
                </button>
              </div>
              <div className="mt-2 space-y-3">
                {formData.responsibilities.map((resp, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={resp}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'responsibilities')}
                      className="block w-full border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                      placeholder={`Responsibility ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index, 'responsibilities')}
                      className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Email */}
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                Contact Email
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="Email for applications (optional)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave blank to use your company email
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-5">
              <button
                type="button"
                onClick={() => router.back()}
                className="mr-3 py-2 px-4 border border-gray-300 rounded-sm shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}