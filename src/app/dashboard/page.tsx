// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

interface Job {
  _id: string;
  title: string;
  location: string;
  type: string;
  status: string;
  createdAt: string;
  applicationsCount: number;
}

interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
  };
  user: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  status: string;
  appliedAt: string;
}

const CompanyDashboard: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isCompany, user, token, logout } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [jobStats, setJobStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0
  });

  // Redirect if not authenticated or not a company
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isCompany)) {
      router.push('/login');
    }
  }, [isAuthenticated, isCompany, isLoading, router]);

  // Fetch company data
  useEffect(() => {
    if (isAuthenticated && isCompany && token) {
      const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);

        try {
          // Fetch company's jobs
          const jobsResponse = await axios.get('http://localhost:5000/api/jobs/company/myjobs', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          // Assert the type of jobsResponse.data
          const jobsData = jobsResponse.data as { jobs: Job[] };

          setJobs(jobsData.jobs);

          // Calculate job stats
          const activeJobs = jobsData.jobs.filter((job: Job) =>
            job.status === 'active' || job.status === 'open'
          ).length;

          setJobStats({
            totalJobs: jobsData.jobs.length,
            activeJobs,
            totalApplications: jobsData.jobs.reduce(
              (total: number, job: Job) => total + (job.applicationsCount || 0), 0
            )
          });

          // Fetch recent applications (across all jobs)
          if (jobsData.jobs.length > 0) {
            // For simplicity, get applications for the first few jobs
            const jobIds = jobsData.jobs.slice(0, 3).map((job: Job) => job._id);

            const recentAppsPromises = jobIds.map((jobId: string) =>
              axios.get(`http://localhost:5000/api/applications/job/${jobId}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { limit: 5 }
              })
            );

            const responses = await Promise.all(recentAppsPromises);

            // Combine and sort applications by date
            const allApplications = responses.flatMap(response => {
              const data = response.data as { applications?: Application[] };
              return data.applications || [];
            }).sort((a: Application, b: Application) =>
              new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
            ).slice(0, 5); // Keep only the 5 most recent

            setRecentApplications(allApplications);
          }
        } catch (err: any) {
          console.error("Error fetching dashboard data:", err);
          setError(err.response?.data?.message || "Failed to load dashboard data");
        } finally {
          setIsLoading(false);
        }
      };

      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, isCompany, token]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.companyName ? user.companyName : "Company"} Dashboard
            </h1>
            <button
              onClick={logout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              Log Out
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Manage your job postings and applications
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Jobs
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {jobStats.totalJobs}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Jobs
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {jobStats.activeJobs}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Applications
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {jobStats.totalApplications}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="mb-8 flex space-x-4">
          <Link
            href="/jobs/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Post a New Job
          </Link>
          <Link
            href="/company/messages"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Messages
          </Link>
        </div>

        {/* Recent Jobs Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Job Postings</h2>

          {jobs.length === 0 ? (
            <div className="bg-white overflow-hidden shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">You haven't posted any jobs yet.</p>
              <Link
                href="/jobs/create"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                Create your first job
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {jobs.slice(0, 5).map((job) => (
                  <li key={job._id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            <Link href={`/jobs/${job._id}`}>{job.title}</Link>
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${job.status === 'active' || job.status === 'open'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'}`}
                            >
                              {job.status}
                            </p>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <Link
                            href={`/company/applications/job/${job._id}`}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <span>
                              {job.applicationsCount || 0} Applications
                            </span>
                          </Link>
                          <Link
                            href={`/jobs/edit/${job._id}`}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span>Edit</span>
                          </Link>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {job.type}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p>
                            Posted on <time dateTime={job.createdAt}>{formatDate(job.createdAt)}</time>
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {jobs.length > 5 && (
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <Link
                    href="/jobs/manage"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    View all jobs <span aria-hidden="true">→</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Applications Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Applications</h2>

          {recentApplications.length === 0 ? (
            <div className="bg-white overflow-hidden shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">No applications have been received yet.</p>
              {jobs.length === 0 ? (
                <Link
                  href="/jobs/create"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  Create a job to receive applications
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {recentApplications.map((application) => (
                  <li key={application._id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {application.user.firstName} {application.user.lastName}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${application.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : application.status === 'interviewing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : application.status === 'accepted'
                                    ? 'bg-green-100 text-green-800'
                                    : application.status === 'rejected'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'}`}
                            >
                              {application.status}
                            </p>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          <Link
                            href={`/company/applications/${application._id}`}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Applied to: {application.job.title}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p>
                            <time dateTime={application.appliedAt}>{formatDate(application.appliedAt)}</time>
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {jobs.length > 0 && (
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <Link
                    href="/company/applications"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    View all applications <span aria-hidden="true">→</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages Card */}
        <div className="bg-white rounded-md shadow-sm p-6 mt-12">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Messages</h3>
            <span className="bg-black text-white text-xs py-1 px-2 rounded-full">New</span>
          </div>
          <p className="text-gray-600 mb-4">
            Communicate with job applicants directly through our messaging system.
          </p>
          <Link
            href="/company/messages"
            className="inline-flex items-center text-black font-medium hover:underline"
          >
            View all messages
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;