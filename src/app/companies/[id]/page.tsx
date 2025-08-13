"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image';

// Company type definition
interface Company {
    _id: string;
    companyName: string;
    email?: string;
    phone?: string;
    website?: string;
    industry?: string;
    location?: string;
    description?: string;
    logo?: string;
    size?: string;
    foundedYear?: number;
    socialMedia?: {
        linkedin?: string;
        twitter?: string;
        facebook?: string;
    };
}

// Job type definition
interface Job {
    _id: string;
    title: string;
    company: {
        _id: string;
        companyName: string;
    };
    location: string;
    type: string;
    salary?: string;
    createdAt: string;
}

export default function CompanyDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [company, setCompany] = useState<Company | null>(null);
    const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Format date to readable format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Fetch company details and jobs
    useEffect(() => {
        const fetchCompanyDetails = async () => {
            setLoading(true);
            setError(null);

            try {
                // Fetch company details
                const companyResponse = await axios.get(`http://localhost:5000/api/companies/${id}`);
                setCompany(companyResponse.data as Company);

                // Fetch company's jobs
                const jobsResponse = await axios.get(`http://localhost:5000/api/companies/${id}/with-jobs`);
                const jobsData = jobsResponse.data as { jobs: Job[] };
                setCompanyJobs(jobsData.jobs || []);
            } catch (err: any) {
                console.error('Error fetching company details:', err);
                setError('Failed to load company details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCompanyDetails();
        }
    }, [id]);

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
                            <div className="flex items-center space-x-4">
                                <div className="h-24 w-24 bg-gray-200 rounded-sm"></div>
                                <div className="space-y-3 flex-1">
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            </div>
                            <div className="mt-8 space-y-3">
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

    if (error || !company) {
        return (
            <div className="min-h-screen bg-gray-50 py-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-sm shadow-sm p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {error || 'Company not found'}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            We couldn't find the company you're looking for.
                        </p>
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        >
                            Back to Companies
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
                    Back to Companies
                </button>

                {/* Company Header */}
                <div className="bg-white rounded-sm shadow-sm p-8 mb-8">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div className="sm:flex sm:items-center">
                            <div className="h-24 w-24 bg-gray-100 rounded-sm flex items-center justify-center text-gray-500 text-3xl font-medium overflow-hidden">
                                {company.logo ? (
                                    <Image
                                        src={company.logo}
                                        alt={company.companyName}
                                        width={96}
                                        height={96}
                                        className="object-cover"
                                    />
                                ) : (
                                    company.companyName.charAt(0)
                                )}
                            </div>
                            <div className="mt-4 sm:mt-0 sm:ml-6">
                                <h1 className="text-3xl font-bold text-gray-900">{company.companyName}</h1>
                                <div className="mt-2 flex flex-wrap items-center text-sm text-gray-600">
                                    {company.industry && (
                                        <span className="mr-4 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            {company.industry}
                                        </span>
                                    )}
                                    {company.location && (
                                        <span className="mr-4 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {company.location}
                                        </span>
                                    )}
                                    {company.size && (
                                        <span className="mr-4 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            {company.size} employees
                                        </span>
                                    )}
                                    {company.foundedYear && (
                                        <span className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Founded in {company.foundedYear}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 sm:mt-0 flex space-x-3">
                            {company.website && (
                                <a
                                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                    Website
                                </a>
                            )}
                            {companyJobs.length > 0 && (
                                <a
                                    href="#open-positions"
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    View Open Positions
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Social Media Links */}
                    {company.socialMedia && (
                        <div className="mt-6 flex space-x-4">
                            {company.socialMedia.linkedin && (
                                <a
                                    href={company.socialMedia.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-gray-500"
                                    aria-label="LinkedIn"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </a>
                            )}
                            {company.socialMedia.twitter && (
                                <a
                                    href={company.socialMedia.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-gray-500"
                                    aria-label="Twitter"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                    </svg>
                                </a>
                            )}
                            {company.socialMedia.facebook && (
                                <a
                                    href={company.socialMedia.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-gray-500"
                                    aria-label="Facebook"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.126-5.864 10.126-11.854z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* About Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-sm shadow-sm p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">About {company.companyName}</h2>
                            {company.description ? (
                                <div className="prose max-w-none">
                                    <p className="whitespace-pre-line">{company.description}</p>
                                </div>
                            ) : (
                                <p className="text-gray-600">No company description available.</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Contact Information */}
                        <div className="bg-white rounded-sm shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                            <ul className="space-y-3">
                                {company.email && (
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <a href={`mailto:${company.email}`} className="text-black hover:underline">
                                            {company.email}
                                        </a>
                                    </li>
                                )}
                                {company.phone && (
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <a href={`tel:${company.phone}`} className="text-black hover:underline">
                                            {company.phone}
                                        </a>
                                    </li>
                                )}
                                {company.website && (
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                        </svg>
                                        <a
                                            href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-black hover:underline"
                                        >
                                            {company.website.replace(/^https?:\/\//i, '')}
                                        </a>
                                    </li>
                                )}
                                {company.location && (
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>{company.location}</span>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Company Details */}
                        {(company.industry || company.size || company.foundedYear) && (
                            <div className="bg-white rounded-sm shadow-sm p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Company Details</h3>
                                <ul className="space-y-3">
                                    {company.industry && (
                                        <li className="flex justify-between">
                                            <span className="text-gray-600">Industry</span>
                                            <span className="text-gray-900 font-medium">{company.industry}</span>
                                        </li>
                                    )}
                                    {company.size && (
                                        <li className="flex justify-between">
                                            <span className="text-gray-600">Company Size</span>
                                            <span className="text-gray-900 font-medium">{company.size} employees</span>
                                        </li>
                                    )}
                                    {company.foundedYear && (
                                        <li className="flex justify-between">
                                            <span className="text-gray-600">Founded</span>
                                            <span className="text-gray-900 font-medium">{company.foundedYear}</span>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Open Positions Section */}
                <div id="open-positions" className="mb-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Open Positions at {company.companyName}</h2>

                    {companyJobs.length === 0 ? (
                        <div className="bg-white rounded-sm shadow-sm p-8 text-center">
                            <p className="text-gray-600">
                                There are currently no open positions at {company.companyName}.
                            </p>
                            <Link href="/jobs" className="mt-4 inline-block text-black font-medium hover:underline">
                                Browse all available jobs →
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white rounded-sm shadow-sm overflow-hidden">
                            <ul className="divide-y divide-gray-200">
                                {companyJobs.map((job) => (
                                    <li key={job._id}>
                                        <Link href={`/jobs/${job._id}`} className="block hover:bg-gray-50">
                                            <div className="px-6 py-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-medium text-black">{job.title}</h3>
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
                                                    <div>
                                                        <span className="text-sm text-gray-500">
                                                            Posted: {formatDate(job.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}