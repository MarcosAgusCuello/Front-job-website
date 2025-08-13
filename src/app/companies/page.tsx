"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';

// Company type definition
interface Company {
  _id: string;
  companyName: string;
  industry?: string;
  location?: string;
  website?: string;
  description?: string;
  logo?: string;
  size?: string;
  foundedYear?: number;
  jobCount?: number;
}

// Company filters interface
interface CompanyFilters {
  name?: string;
  industry?: string;
  location?: string;
}

const industryOptions = [
  { value: '', label: 'All Industries' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Education', label: 'Education' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Media', label: 'Media & Entertainment' },
  { value: 'Hospitality', label: 'Hospitality & Tourism' },
  { value: 'Construction', label: 'Construction' },
  { value: 'Transportation', label: 'Transportation' }
];

export default function CompaniesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for companies and pagination
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // State for filters
  const [filters, setFilters] = useState<CompanyFilters>({
    name: searchParams.get('name') || '',
    industry: searchParams.get('industry') || '',
    location: searchParams.get('location') || ''
  });
  
  // State for search input
  const [searchInput, setSearchInput] = useState(filters.name || '');
  const [locationInput, setLocationInput] = useState(filters.location || '');
  
  const limit = 12; // Number of companies per page
  
  // Fetch companies with current filters and pagination
  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query params
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());
      
      if (filters.name) params.append('name', filters.name);
      if (filters.location) params.append('location', filters.location);
      if (filters.industry) params.append('industry', filters.industry);
      
      const response = await axios.get(`http://localhost:5000/api/companies?${params.toString()}`);
      
      const data = response.data as { companies: Company[]; total: number };
      setCompanies(data.companies);
      setTotalCompanies(data.total);
      setTotalPages(Math.ceil(data.total / limit));
    } catch (err: any) {
      console.error('Error fetching companies:', err);
      setError('Failed to load companies. Please try again later.');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Update URL with current filters
  const updateUrlParams = () => {
    const params = new URLSearchParams();
    
    if (filters.name) params.append('name', filters.name);
    if (filters.location) params.append('location', filters.location);
    if (filters.industry) params.append('industry', filters.industry);
    
    // Update URL without triggering navigation
    const newUrl = `/companies?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  };
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    setFilters(prev => ({
      ...prev,
      name: searchInput,
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
  
  // Fetch companies when filters or pagination changes
  useEffect(() => {
    fetchCompanies();
    updateUrlParams();
  }, [filters, currentPage]);
  
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="mt-2 text-gray-600">Discover companies that are hiring and learn more about them</p>
        </div>
        
        {/* Search and Filters Section */}
        <div className="bg-white rounded-sm shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Company Name Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search companies..."
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
                  placeholder="City, state, or country..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm shadow-sm focus:outline-none focus:ring-black focus:border-black"
                />
              </div>
              
              {/* Industry Filter */}
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={filters.industry}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm shadow-sm focus:outline-none focus:ring-black focus:border-black"
                >
                  {industryOptions.map(option => (
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
                Search Companies
              </button>
            </div>
          </form>
        </div>
        
        {/* Results Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-700">
              {loading ? 'Searching...' : `Showing ${companies.length} of ${totalCompanies} companies`}
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm mb-6">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-sm shadow-sm p-6 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-gray-200 rounded-sm"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : companies.length === 0 ? (
            <div className="bg-white rounded-sm shadow-sm p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filter criteria to find more companies.
              </p>
              <button
                onClick={() => {
                  setFilters({ name: '', location: '', industry: '' });
                  setSearchInput('');
                  setLocationInput('');
                }}
                className="text-black hover:text-gray-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <Link 
                  href={`/companies/${company._id}`} 
                  key={company._id}
                  className="bg-white rounded-sm shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start">
                      <div className="h-16 w-16 bg-gray-100 rounded-sm flex items-center justify-center text-gray-500 font-medium overflow-hidden">
                        {company.logo ? (
                          <Image
                            src={company.logo}
                            alt={company.companyName}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        ) : (
                          company.companyName.charAt(0)
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-bold text-gray-900">{company.companyName}</h3>
                        <p className="text-sm text-gray-600">
                          {company.industry || 'Various Industries'}
                        </p>
                        {company.location && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="inline-flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {company.location}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {company.description && (
                      <p className="mt-4 text-gray-600 line-clamp-3">
                        {company.description}
                      </p>
                    )}
                    
                    <div className="mt-4 flex justify-between items-center">
                      {company.jobCount !== undefined && (
                        <span className="text-sm text-gray-600">
                          {company.jobCount} {company.jobCount === 1 ? 'job' : 'jobs'} available
                        </span>
                      )}
                      <span className="text-sm text-black font-medium">View profile →</span>
                    </div>
                  </div>
                </Link>
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
                      className={`w-8 h-8 mx-1 flex items-center justify-center rounded-sm ${
                        currentPage === pageNumber
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