"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

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
  createdAt: string;
  updatedAt: string;
}

// Job filters interface
interface JobFilters {
  title?: string;
  location?: string;
  type?: string;
  skills?: string[];
}

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Freelance', label: 'Freelance' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Remote', label: 'Remote' }
];

export default function JobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for jobs and pagination
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State for filters
  const [filters, setFilters] = useState<JobFilters>({
    title: searchParams.get('title') || '',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || '',
    skills: searchParams.get('skills') ? searchParams.get('skills')!.split(',') : []
  });

  // State for search input
  const [searchInput, setSearchInput] = useState(filters.title || '');
  const [locationInput, setLocationInput] = useState(filters.location || '');

  const limit = 10; // Number of jobs per page

  // Fetch jobs with current filters and pagination
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());

      if (filters.title) params.append('title', filters.title);
      if (filters.location) params.append('location', filters.location);
      if (filters.type) params.append('type', filters.type);
      if (filters.skills && filters.skills.length > 0) {
        params.append('skills', filters.skills.join(','));
      }

      const response = await axios.get<{ jobs: Job[]; total: number }>(`http://localhost:5000/api/jobs?${params.toString()}`);

      setJobs(response.data.jobs);
      setTotalPages(Math.ceil(response.data.total / limit));
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again later.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Update URL with current filters
  const updateUrlParams = () => {
    const params = new URLSearchParams();

    if (filters.title) params.append('title', filters.title);
    if (filters.location) params.append('location', filters.location);
    if (filters.type) params.append('type', filters.type);
    if (filters.skills && filters.skills.length > 0) {
      params.append('skills', filters.skills.join(','));
    }

    // Update URL without triggering navigation
    const newUrl = `/jobs?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    setFilters(prev => ({
      ...prev,
      title: searchInput,
      location: locationInput
    }));

    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFilters(prev => ({
      ...prev,
      [name]: value
    }));

    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top when changing page
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available';

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Not available';
      }

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Not available';
    }
  };

  // Calculate time since job was posted 
  const getTimeSincePosted = (dateString: string) => {
    
    if (!dateString) return 'Date not available';

    try {
      const now = new Date();
      const postedDate = new Date(dateString);

      // Check if date is valid
      if (isNaN(postedDate.getTime())) {
        return 'Recently posted';
      }

      const diffTime = Math.abs(now.getTime() - postedDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return 'Posted today';
      } else if (diffDays === 1) {
        return 'Posted yesterday';
      } else if (diffDays < 7) {
        return `Posted ${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `Posted ${weeks} week${weeks > 1 ? 's' : ''} ago`;
      } else {
        return `Posted on ${formatDate(dateString)}`;
      }
    } catch (error) {
      console.error('Error calculating time since posting:', error);
      return 'Recently posted';
    }
  };

  // Fetch jobs when filters or pagination changes
  useEffect(() => {
    fetchJobs();
    updateUrlParams();
  }, [filters, currentPage]);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Next Opportunity</h1>
          <p className="mt-2 text-gray-600">Browse through our curated list of available positions</p>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white rounded-sm shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Job Title Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title or Keyword
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search jobs..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm shadow-sm focus:outline-none focus:ring-black focus:border-black"
                />
              </div>

              {/* Location Search */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="City, state, or remote..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm shadow-sm focus:outline-none focus:ring-black focus:border-black"
                />
              </div>

              {/* Job Type Filter */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm shadow-sm focus:outline-none focus:ring-black focus:border-black"
                >
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-black text-white rounded-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
              >
                Search Jobs
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">

            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-700">Sort by:</span>
              <select
                className="border border-gray-300 rounded-sm px-3 py-1 text-sm focus:outline-none focus:ring-black focus:border-black"
              >
                <option value="newest">Newest</option>
                <option value="relevant">Most Relevant</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-sm shadow-sm p-8 flex justify-center">
              <div className="animate-pulse flex flex-col space-y-4 w-full">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-sm shadow-sm p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filter criteria to find more opportunities.
              </p>
              <button
                onClick={() => {
                  setFilters({ title: '', location: '', type: '', skills: [] });
                  setSearchInput('');
                  setLocationInput('');
                }}
                className="text-black hover:text-gray-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => (
                <div key={job._id} className="bg-white rounded-sm shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <Link href={`/jobs/${job._id}`}>
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-4">
                          <div className="h-12 w-12 bg-gray-100 rounded-sm flex items-center justify-center text-gray-500 font-medium">
                            {job.company?.companyName?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 hover:text-black">{job.title}</h3>
                            <p className="text-gray-700">{job.company?.companyName}</p>
                            <div className="mt-1 flex flex-wrap items-center text-sm text-gray-600">
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
                              {job.salary && (
                                <span className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {job.salary}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {getTimeSincePosted(job.createdAt || '')}
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-gray-600 line-clamp-2">
                          {job.description.length > 150
                            ? `${job.description.substring(0, 150)}...`
                            : job.description}
                        </p>
                      </div>

                      {job.skills && job.skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.skills.slice(0, 4).map((skill, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 4 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{job.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-10">
            <nav className="flex items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-sm mr-2 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                // Only show a few pages around the current page
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-8 h-8 mx-1 flex items-center justify-center rounded-sm ${currentPage === pageNumber
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <span key={pageNumber} className="mx-1">...</span>;
                }
                return null;
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-sm ml-2 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}