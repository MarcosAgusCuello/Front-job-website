"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

// Define interfaces for type safety
interface Job {
    _id: string;
    title: string;
    company: {
        _id: string;
        companyName: string;
        logo?: string;
    };
    location: string;
    type: string;
    salary?: string;
}

interface Application {
    _id: string;
    job: Job;
    status: string;
    appliedAt: string;
    updatedAt: string;
    notes?: string;
}

const UserDashboard: React.FC = () => {
    const router = useRouter();
    const { isAuthenticated, isCompany, user, token, logout } = useAuth();

    const [applications, setApplications] = useState<Application[]>([]);
    const [savedJobs, setSavedJobs] = useState<Job[]>([]);
    const [isWithdrawing, setIsWithdrawing] = useState<string | null>(null);
    const [withdrawError, setWithdrawError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalApplications: 0,
        activeApplications: 0,
        interviewInvites: 0
    });

    // Redirect if not authenticated or is a company account
    useEffect(() => {
        if (!isLoading && (!isAuthenticated || isCompany)) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, isCompany, isLoading, router]);

    // Fetch user data
    useEffect(() => {
        if (isAuthenticated && !isCompany && token) {
            const fetchUserDashboardData = async () => {
                setIsLoading(true);
                setError(null);

                try {
                    // Fetch user's applications
                    const applicationsResponse = await axios.get('http://localhost:5000/api/applications/user/applications', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    const data = applicationsResponse.data as { applications: Application[] };
                    const userApplications = data.applications || [];
                    setApplications(userApplications);

                    // Calculate application stats
                    const activeApps = userApplications.filter((app: Application) =>
                        app.status !== 'rejected' && app.status !== 'accepted'
                    ).length;

                    const interviewInvites = userApplications.filter((app: Application) =>
                        app.status === 'interviewing'
                    ).length;

                    setStats({
                        totalApplications: userApplications.length,
                        activeApplications: activeApps,
                        interviewInvites: interviewInvites
                    });

                } catch (err: any) {
                    console.error("Error fetching user dashboard data:", err);
                    setError(err.response?.data?.message || "Failed to load dashboard data");
                } finally {
                    setIsLoading(false);
                }
            };

            fetchUserDashboardData();
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

    const handleWithdrawApplication = async (applicationId: string) => {
        if (!token) return;

        setIsWithdrawing(applicationId);
        setWithdrawError(null);

        try {
            const response = await axios.delete(`http://localhost:5000/api/applications/withdraw/${applicationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log("Withdrawal response:", response.data); // Add logging

            // Update the applications list by removing the withdrawn application
            setApplications(applications.filter(app => app._id !== applicationId));

            // Update stats
            setStats(prev => ({
                ...prev,
                totalApplications: prev.totalApplications - 1,
                activeApplications: prev.activeApplications - (
                    applications.find(app => app._id === applicationId)?.status !== 'rejected' &&
                        applications.find(app => app._id === applicationId)?.status !== 'accepted' ? 1 : 0
                ),
                interviewInvites: prev.interviewInvites - (
                    applications.find(app => app._id === applicationId)?.status === 'interviewing' ? 1 : 0
                )
            }));
        } catch (err: any) {
            console.error("Error withdrawing application:", err);
            console.error("Response details:", err.response?.data); // Add detailed error logging
            setWithdrawError(
                err.response?.data?.message || "Failed to withdraw application. Please try again."
            );
            // Don't throw the error - handle it here
        } finally {
            setIsWithdrawing(null);
        }
    };

    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const [applicationToWithdraw, setApplicationToWithdraw] = useState<string | null>(null);

    // Add these functions to handle the confirmation flow
    const initiateWithdraw = (applicationId: string) => {
        setApplicationToWithdraw(applicationId);
        setShowConfirmModal(true);
    };

    const confirmWithdraw = async () => {
        if (applicationToWithdraw) {
            try {
                await handleWithdrawApplication(applicationToWithdraw);
            } catch (err) {
                console.error("Error in withdrawal process:", err);
                // Still close the modal even if there's an error
            } finally {
                setShowConfirmModal(false);
                setApplicationToWithdraw(null);
            }
        } else {
            setShowConfirmModal(false);
            setApplicationToWithdraw(null);
        }
    };

    const cancelWithdraw = () => {
        setShowConfirmModal(false);
        setApplicationToWithdraw(null);
    };

    // Calculate days since application
    const getDaysSinceApplied = (dateString: string): string => {
        const appliedDate = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - appliedDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    };

    // Get status badge color
    const getStatusBadgeClass = (status: string): string => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'reviewed':
                return 'bg-blue-100 text-blue-800';
            case 'interviewing':
                return 'bg-purple-100 text-purple-800';
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
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
                            {user && 'firstName' in user
                                ? `${user.firstName}'s Dashboard`
                                : "Your Dashboard"}
                        </h1>
                        <button
                            onClick={logout}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-sm text-sm font-medium"
                        >
                            Log Out
                        </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                        Track your job applications and saved opportunities
                    </p>
                </div>

                {error && (
                    <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm">
                        {error}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white overflow-hidden shadow-sm rounded-sm">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-black rounded-md p-3">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Applications
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {stats.totalApplications}
                                        </div>
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm rounded-sm">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-black rounded-md p-3">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Active Applications
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {stats.activeApplications}
                                        </div>
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm rounded-sm">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-black rounded-md p-3">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Interview Invites
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {stats.interviewInvites}
                                        </div>
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Section */}
                <div className="mb-8 flex space-x-2">
                    <Link
                        href="/jobs"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-sm shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                        <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Find New Jobs
                    </Link>

                    <Link
                        href="/user/profile"
                        className=" inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                        <svg className="mr-2 -ml-1 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Update Profile
                    </Link>

                    <Link
                        href="/user/messages"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-sm"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                            />
                        </svg>
                        Messages
                    </Link>
                </div>

                {/* Applications Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Applications</h2>

                    {applications.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow-sm rounded-sm p-6 text-center">
                            <p className="text-gray-500 mb-4">You haven't applied to any jobs yet.</p>
                            <Link
                                href="/jobs"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-sm text-black bg-gray-100 hover:bg-gray-200"
                            >
                                Start exploring jobs
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white shadow-sm overflow-hidden rounded-sm">
                            <ul className="divide-y divide-gray-200">
                                {applications.map((application) => (
                                    <li key={application._id}>
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-sm font-medium text-black truncate">
                                                        <Link href={`/jobs/${application.job._id}`} className="hover:underline">
                                                            {application.job.title}
                                                        </Link>
                                                    </h3>
                                                    <p className="mt-1 text-sm text-gray-600 truncate">
                                                        {application.job.company?.companyName || 'Company'}
                                                    </p>
                                                </div>
                                                <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                                                    <p className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(application.status)}`}>
                                                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                                    </p>

                                                    {/* Add withdraw button */}
                                                    <button
                                                        onClick={() => initiateWithdraw(application._id)}
                                                        disabled={isWithdrawing === application._id || application.status === 'accepted'}
                                                        className={`inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded-sm 
              ${(isWithdrawing === application._id || application.status === 'accepted')
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : 'text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black'}`}
                                                    >
                                                        {isWithdrawing === application._id ? (
                                                            <span className="flex items-center">
                                                                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Withdrawing...
                                                            </span>
                                                        ) : (
                                                            'Withdraw'
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Keep the existing application details */}
                                            <div className="mt-2 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-500">
                                                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {application.job.location}
                                                    </p>
                                                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        {application.job.type}
                                                    </p>
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p>
                                                        Applied {getDaysSinceApplied(application.appliedAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Last status update if available */}
                                            {application.updatedAt && application.status !== 'pending' && (
                                                <div className="mt-2 text-sm text-gray-500 italic">
                                                    Status updated: {formatDate(application.updatedAt)}
                                                </div>
                                            )}

                                            {/* Add error message if withdrawal failed */}
                                            {withdrawError && isWithdrawing === application._id && (
                                                <div className="mt-2 text-sm text-red-600">
                                                    {withdrawError}
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Saved Jobs Section - if your API supports this feature */}
                {savedJobs.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved Jobs</h2>
                        <div className="bg-white shadow-sm overflow-hidden rounded-sm">
                            <ul className="divide-y divide-gray-200">
                                {savedJobs.map((job) => (
                                    <li key={job._id}>
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-sm font-medium text-black truncate">
                                                        <Link href={`/jobs/${job._id}`} className="hover:underline">
                                                            {job.title}
                                                        </Link>
                                                    </h3>
                                                    <p className="mt-1 text-sm text-gray-600 truncate">
                                                        {job.company?.companyName || 'Company'}
                                                    </p>
                                                </div>
                                                <div className="ml-2 flex-shrink-0">
                                                    <Link
                                                        href={`/jobs/${job._id}`}
                                                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-5 font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
                                                    >
                                                        View
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
                                                {job.salary && (
                                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <p>{job.salary}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Recommended Jobs Section - Optional */}
                {/* You could add a section here for job recommendations based on user profile/applications */}


            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen">
                        {/* Background overlay */}
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

                        {/* This centered span helps with vertical alignment */}
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        {/* Modal panel - smaller size */}
                        <div className="relative inline-block align-middle bg-white rounded-md text-left overflow-hidden shadow-xl transform transition-all max-w-sm w-full mx-4">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            Withdraw Application
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to withdraw this application? This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-sm border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={confirmWithdraw}
                                >
                                    Withdraw
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-sm border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={cancelWithdraw}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;