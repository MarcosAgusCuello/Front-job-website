"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

// Application status options
const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending Review' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'interviewing', label: 'Interviewing' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'accepted', label: 'Accepted' }
];

// Define interfaces
interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    location?: string;
    education?: {
        school: string;
        degree: string;
        fieldOfStudy: string;
        from: string;
        to?: string;
        current: boolean;
        description?: string;
    }[];
    experience?: {
        title: string;
        company: string;
        location: string;
        from: string;
        to?: string;
        current: boolean;
        description?: string;
    }[];
    skills?: string[];
    resume?: string;
    coverLetter?: string;
}

interface Job {
    _id: string;
    title: string;
    company: {
        _id: string;
        companyName: string;
    };
    location: string;
    type: string;
}

interface Application {
    _id: string;
    user: User;
    job: Job;
    status: string;
    coverLetter?: string;
    resume?: string;
    appliedAt: string;
    updatedAt: string;
    notes?: string;
}

export default function ApplicationReviewPage() {
    const { id } = useParams();
    const router = useRouter();
    const { isAuthenticated, isCompany, token } = useAuth();

    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [notes, setNotes] = useState('');
    const [saveNoteStatus, setSaveNoteStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    // Check authentication and redirect if needed
    useEffect(() => {
        if (!loading && (!isAuthenticated || !isCompany)) {
            router.push('/auth/login');
            return;
        }
    }, [isAuthenticated, isCompany, loading, router]);

    // Format date to readable format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Fetch application details
    useEffect(() => {
        const fetchApplicationDetails = async () => {
            if (!isAuthenticated || !isCompany || !token) {
                console.log("Skipping fetch - Auth prerequisites not met:", {
                    isAuthenticated,
                    isCompany,
                    hasToken: !!token
                });
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const applicationId = id;

                const response = await axios.get(
                    `http://localhost:5000/api/applications/${applicationId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );

                setApplication(response.data as Application);
                setNotes((response.data as Application).notes || '');
            } catch (err: any) {
                console.error('Error fetching application details:', err);
                console.error('Error response:', err.response?.data);
                setError(err.response?.data?.message || 'Failed to load application details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchApplicationDetails();
        }
    }, [id, isAuthenticated, isCompany, token]);

    // Handle status update
    const handleStatusUpdate = async (newStatus: string) => {
        if (!application || !token) return;

        setUpdatingStatus(true);

        try {
            const applicationId = application._id;
            const response = await axios.put(
                `http://localhost:5000/api/applications/${applicationId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setApplication(prev => prev ? { ...prev, status: newStatus } : null);
        } catch (err: any) {
            console.error('Error updating application status:', err);
            alert('Failed to update status. Please try again.');
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Handle notes update
    const handleSaveNotes = async () => {
        if (!application || !token) return;

        setSaveNoteStatus('saving');

        try {
            const applicationId = application._id;
            await axios.put(
                `http://localhost:5000/api/applications/${applicationId}/notes`,
                { notes },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSaveNoteStatus('saved');
            setTimeout(() => setSaveNoteStatus('idle'), 3000);
        } catch (err: any) {
            console.error('Error saving notes:', err);
            setSaveNoteStatus('error');
        }
    };

    // Handle back button
    const handleBack = () => {
        router.back();
    };

    const handleResumeDownload = async () => {
        if (!application || !token) return;

        setUpdatingStatus(true);

        try {
            // Use the specific CV download endpoint
            const response = await axios.get(
                `http://localhost:5000/api/applications/${application._id}/cv`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    responseType: 'blob'
                }
            );

            // Create a blob URL from the response data
            const blob = new Blob([response.data as ArrayBuffer], {
                type: 'application/pdf'
            });
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link element to trigger the download
            const link = document.createElement('a');
            link.href = url;
            link.download = `${application.user.firstName}_${application.user.lastName}_resume.pdf`;
            document.body.appendChild(link);
            link.click();

            // Clean up
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (err: any) {
            console.error('Error downloading resume:', err);
            alert('Could not download the resume. Please try again.');
        } finally {
            setUpdatingStatus(false);
        }
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

    if (error || !application) {
        return (
            <div className="min-h-screen bg-gray-50 py-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-sm shadow-sm p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {error || 'Application not found'}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            We couldn't find the application you're looking for.
                        </p>
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        >
                            Back to Applications
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
                    Back to Applications
                </button>

                {/* Application Header */}
                <div className="bg-white rounded-sm shadow-sm p-8 mb-8">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Application for {application.job.title}
                            </h1>
                            <p className="mt-2 text-gray-600">
                                From {application.user.firstName} {application.user.lastName}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Applied on {formatDate(application.appliedAt)}
                            </p>
                        </div>

                        <div className="mt-4 sm:mt-0">
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-500">Application Status:</span>
                                <div className="relative inline-block w-48">
                                    <select
                                        value={application.status}
                                        onChange={(e) => handleStatusUpdate(e.target.value)}
                                        disabled={updatingStatus}
                                        className={`block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded-sm shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm
                      ${application.status === 'accepted' ? 'text-green-600' :
                                                application.status === 'rejected' ? 'text-red-600' :
                                                    application.status === 'interviewing' ? 'text-blue-600' :
                                                        application.status === 'reviewed' ? 'text-purple-600' :
                                                            'text-yellow-600'
                                            }
                    `}
                                    >
                                        {STATUS_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Applicant Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Applicant Profile */}
                        <div className="bg-white rounded-sm shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Applicant Information</h2>
                            </div>
                            <div className="px-8 py-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {application.user.firstName} {application.user.lastName}
                                        </h3>
                                        <p className="text-gray-600">
                                            <a href={`mailto:${application.user.email}`} className="hover:text-black">
                                                {application.user.email}
                                            </a>
                                        </p>
                                        {application.user.location && (
                                            <div className="flex items-center mt-1 text-sm text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {application.user.location}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 sm:mt-0">
                                        <button
                                            onClick={handleResumeDownload}
                                            disabled={updatingStatus}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            {updatingStatus ? 'Downloading...' : 'Download Resume'}
                                        </button>
                                    </div>
                                </div>

                                {/* Skills Section - Always displayed */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Skills</h4>
                                    {application.user.skills && Array.isArray(application.user.skills) && application.user.skills.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {application.user.skills.map((skill, index) => (
                                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm italic">No skills listed</p>
                                    )}
                                </div>

                                {/* Experience Section - Always displayed */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-500 mb-3">Experience</h4>
                                    {application.user.experience && Array.isArray(application.user.experience) && application.user.experience.length > 0 ? (
                                        <div className="space-y-4">
                                            {application.user.experience.map((exp, index) => (
                                                <div key={index} className="border-l-2 border-gray-200 pl-4">
                                                    <h5 className="font-medium text-gray-900">{exp.title}</h5>
                                                    <p className="text-gray-700">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(exp.from).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} -
                                                        {exp.current ? ' Present' : (exp.to ? ` ${new Date(exp.to).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}` : '')}
                                                    </p>
                                                    {exp.description && (
                                                        <p className="mt-2 text-sm text-gray-600">{exp.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm italic">No work experience listed</p>
                                    )}
                                </div>

                                {/* Education Section - Always displayed */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-3">Education</h4>
                                    {application.user.education && Array.isArray(application.user.education) && application.user.education.length > 0 ? (
                                        <div className="space-y-4">
                                            {application.user.education.map((edu, index) => (
                                                <div key={index} className="border-l-2 border-gray-200 pl-4">
                                                    <h5 className="font-medium text-gray-900">{edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}</h5>
                                                    <p className="text-gray-700">{edu.school}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(edu.from).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} -
                                                        {edu.current ? ' Present' : (edu.to ? ` ${new Date(edu.to).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}` : '')}
                                                    </p>
                                                    {edu.description && (
                                                        <p className="mt-2 text-sm text-gray-600">{edu.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm italic">No education history listed</p>
                                    )}
                                </div>

                                {/* Add a summary card at the bottom with better null checks */}
                                {((application.user.skills && application.user.skills.length > 0) ||
                                    (application.user.experience && application.user.experience.length > 0) ||
                                    (application.user.education && application.user.education.length > 0)) && (
                                        <div className="mt-8 pt-6 border-t border-gray-200">
                                            <div className="bg-gray-50 p-4 rounded-sm">
                                                <h4 className="font-medium text-gray-900 mb-2">Candidate Summary</h4>
                                                <p className="text-sm text-gray-600">
                                                    {application.user.firstName} {application.user.lastName} is a candidate with
                                                    {(application.user.experience && application.user.experience.length)
                                                        ? ` ${application.user.experience.length} ${application.user.experience.length === 1 ? 'position' : 'positions'} of work experience`
                                                        : ' no listed work experience'}
                                                    {(application.user.education && application.user.education.length)
                                                        ? ` and ${application.user.education.length} ${application.user.education.length === 1 ? 'educational qualification' : 'educational qualifications'}`
                                                        : ' and no listed education'}.
                                                    {(application.user.skills && application.user.skills.length)
                                                        ? ` They have ${application.user.skills.length} skills including ${application.user.skills.slice(0, 3).join(', ')}${application.user.skills.length > 3 ? ', and more.' : '.'} `
                                                        : ''}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* Cover Letter */}
                        {application.coverLetter && (
                            <div className="bg-white rounded-sm shadow-sm overflow-hidden">
                                <div className="px-8 py-6 border-b border-gray-200">
                                    <h2 className="text-xl font-bold text-gray-900">Cover Letter</h2>
                                </div>
                                <div className="px-8 py-6">
                                    <p className="text-gray-700 whitespace-pre-line">{application.coverLetter}</p>
                                </div>
                            </div>
                        )}

                        {/* Notes Section */}
                        <div className="bg-white rounded-sm shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Private Notes</h2>
                            </div>
                            <div className="px-8 py-6">
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add private notes about this candidate..."
                                    rows={5}
                                    className="w-full p-3 border border-gray-300 rounded-sm shadow-inner focus:outline-none focus:ring-black focus:border-black"
                                ></textarea>
                                <div className="mt-3 flex justify-between items-center">
                                    <div>
                                        {saveNoteStatus === 'saved' && (
                                            <span className="text-green-600 text-sm">Notes saved!</span>
                                        )}
                                        {saveNoteStatus === 'error' && (
                                            <span className="text-red-600 text-sm">Failed to save notes. Please try again.</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleSaveNotes}
                                        disabled={saveNoteStatus === 'saving'}
                                        className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                                    >
                                        {saveNoteStatus === 'saving' ? 'Saving...' : 'Save Notes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Job Info & Actions */}
                    <div className="space-y-6">
                        {/* Job Summary */}
                        <div className="bg-white rounded-sm shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Job Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Position</p>
                                    <p className="mt-1 text-gray-900">{application.job.title}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Company</p>
                                    <p className="mt-1 text-gray-900">{application.job.company.companyName}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Location</p>
                                    <p className="mt-1 text-gray-900">{application.job.location}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Job Type</p>
                                    <p className="mt-1 text-gray-900">{application.job.type}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Application Date</p>
                                    <p className="mt-1 text-gray-900">{formatDate(application.appliedAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                                    <p className="mt-1 text-gray-900">{formatDate(application.updatedAt)}</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <Link
                                    href={`/jobs/${application.job._id}`}
                                    className="text-black hover:text-gray-800 font-medium"
                                >
                                    View Full Job Posting →
                                </Link>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-sm shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <a
                                    href={`mailto:${application.user.email}`}
                                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Email Candidate
                                </a>

                                <button
                                    onClick={() => handleStatusUpdate('interviewing')}
                                    disabled={application.status === 'interviewing' || updatingStatus}
                                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Schedule Interview
                                </button>

                                <button
                                    onClick={() => handleStatusUpdate('accepted')}
                                    disabled={application.status === 'accepted' || updatingStatus}
                                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Accept Candidate
                                </button>

                                <button
                                    onClick={() => handleStatusUpdate('rejected')}
                                    disabled={application.status === 'rejected' || updatingStatus}
                                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Reject Candidate
                                </button>
                            </div>
                        </div>

                        {/* Application Timeline */}
                        <div className="bg-white rounded-sm shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Application Timeline</h3>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 h-4 w-4 rounded-full bg-green-500 mt-1"></div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">Application Received</p>
                                        <p className="text-xs text-gray-500">{formatDate(application.appliedAt)}</p>
                                    </div>
                                </div>

                                {application.status !== 'pending' && (
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-500 mt-1"></div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">Application Reviewed</p>
                                            <p className="text-xs text-gray-500">{formatDate(application.updatedAt)}</p>
                                        </div>
                                    </div>
                                )}

                                {(application.status === 'interviewing' || application.status === 'accepted' || application.status === 'rejected') && (
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 h-4 w-4 rounded-full bg-purple-500 mt-1"></div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">
                                                {application.status === 'interviewing' ? 'Interview Stage' :
                                                    application.status === 'accepted' ? 'Accepted' : 'Rejected'}
                                            </p>
                                            <p className="text-xs text-gray-500">{formatDate(application.updatedAt)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}