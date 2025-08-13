"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

// Job type definition
interface Job {
  _id: string;
  title: string;
  company: {
    _id: string;
    companyName: string;
    logo?: string;
  };
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  location: string;
  salary?: string;
  type: string;
  status: string;
  skills?: string[];
  experience?: string;
  education?: string;
  contactEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, isCompany, token } = useAuth();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };
  
  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`http://localhost:5000/api/jobs/${id}`);
        setJob(response.data as Job);
        
        // Check if user has already applied
        if (isAuthenticated && !isCompany && token) {
          try {
            const userApplicationsResponse = await axios.get(
              'http://localhost:5000/api/applications/user/applications',
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Assert the type of userApplicationsResponse.data
            const data = userApplicationsResponse.data as { applications: any[] };
            // Check if this job is in the user's applications
            const hasApplied = data.applications.some(
              (application: any) => application.job._id === id
            );
            
            setApplied(hasApplied);
          } catch (err) {
            console.error('Error checking application status:', err);
          }
        }
      } catch (err: any) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchJobDetails();
    }
  }, [id, isAuthenticated, isCompany, token]);
  
  // Handle apply for job
  const handleApply = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (isCompany) {
      setApplyError('Companies cannot apply for jobs. Please sign in as a job seeker.');
      return;
    }
    
    setApplying(true);
    setApplyError(null);
    
    try {
      await axios.post(
        'http://localhost:5000/api/applications/apply',
        { jobId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setApplied(true);
    } catch (err: any) {
      console.error('Error applying for job:', err);
      setApplyError(err.response?.data?.message || 'Failed to apply for this job. Please try again.');
    } finally {
      setApplying(false);
    }
  };
  
  // Handle back button
  const handleBack = () => {
    router.back();
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-sm shadow-sm p-8 mb-8">
              <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-sm shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Job not found'}
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't find the job you're looking for.
            </p>
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center text-gray-700 hover:text-black mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Jobs
        </button>
        
        {/* Job Header */}
        <div className="bg-white rounded-sm shadow-sm p-8 mb-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex sm:items-center">
              <div className="h-16 w-16 bg-gray-100 rounded-sm flex items-center justify-center text-gray-500 text-xl font-medium mr-4">
                {job.company?.companyName?.charAt(0) || 'C'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mt-4 sm:mt-0">{job.title}</h1>
                <div className="mt-2">
                  <Link 
                    href={`/companies/${job.company?._id}`}
                    className="text-lg text-gray-700 hover:text-black"
                  >
                    {job.company?.companyName}
                  </Link>
                </div>
                <div className="mt-2 flex flex-wrap items-center text-sm text-gray-600">
                  <span className="mr-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </span>
                  <span className="mr-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {job.type}
                  </span>
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Posted on {formatDate(job.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 sm:mt-0">
              {applied ? (
                <div className="inline-flex items-center px-4 py-2 border border-transparent rounded-sm text-sm font-medium text-white bg-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Applied
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={applying || isCompany}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-sm shadow-sm text-base font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? 'Applying...' : 'Apply Now'}
                </button>
              )}
              
              {applyError && (
                <p className="mt-2 text-sm text-red-600">{applyError}</p>
              )}
            </div>
          </div>
          
          {job.salary && (
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-gray-100 rounded-sm text-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Salary: {job.salary}
            </div>
          )}
        </div>
        
        {/* Job Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-sm shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{job.description}</p>
              </div>
            </div>
            
            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="bg-white rounded-sm shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Responsibilities</h2>
                <ul className="list-disc pl-5 space-y-2">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="text-gray-700">{responsibility}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white rounded-sm shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="list-disc pl-5 space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="text-gray-700">{requirement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Job Summary Sidebar */}
          <div className="space-y-6">
            {/* Key Information */}
            <div className="bg-white rounded-sm shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Job Overview</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Experience Level</p>
                  <p className="mt-1 text-gray-900">{job.experience}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Education</p>
                  <p className="mt-1 text-gray-900">{job.education}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Job Type</p>
                  <p className="mt-1 text-gray-900">{job.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="mt-1 text-gray-900">{job.location}</p>
                </div>
                {job.contactEmail && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact Email</p>
                    <a 
                      href={`mailto:${job.contactEmail}`} 
                      className="mt-1 block text-gray-900 hover:text-black"
                    >
                      {job.contactEmail}
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-white rounded-sm shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Apply Button (Mobile Optimized) */}
            <div className="bg-white rounded-sm shadow-sm p-6 lg:hidden">
              {applied ? (
                <div className="flex items-center justify-center px-4 py-3 border border-transparent rounded-sm text-sm font-medium text-white bg-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  You've Already Applied
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={applying || isCompany}
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-sm shadow-sm text-base font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? 'Applying...' : 'Apply Now'}
                </button>
              )}
            </div>
            
            {/* Share Job */}
            <div className="bg-white rounded-sm shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Share This Job</h3>
              <div className="flex space-x-4">
                <button 
                  onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <svg className="h-5 w-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </button>
                <button 
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this job: ${job.title} at ${job.company?.companyName}`)}&url=${encodeURIComponent(window.location.href)}`)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Share on Twitter"
                >
                  <svg className="h-5 w-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Copy link"
                >
                  <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Similar Jobs (Optional) */}
        {/* You could add a section here to show similar jobs */}
      </div>
    </div>
  );
}