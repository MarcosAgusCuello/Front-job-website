"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

// Define job type based on your backend model
interface Job {
    _id: string;
    title: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    location: string;
    salary: string;
    type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
    skills: string[];
    experienceLevel: 'Entry-level' | 'Mid-level' | 'Senior' | 'Executive';
    educationLevel: string;
    applicationDeadline: string;
    status: 'Open' | 'Closed' | 'Draft';
    company: string;
}

export default function EditJobPage() {
    const params = useParams();
    const jobId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
    const router = useRouter();
    const { isAuthenticated, isCompany, token } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<Job>>({
        title: '',
        description: '',
        requirements: [''],
        responsibilities: [''],
        location: '',
        salary: '',
        type: 'Full-time',
        skills: [''],
        experienceLevel: 'Mid-level',
        educationLevel: '',
        applicationDeadline: '',
        status: 'Open'
    });

    // Check authentication
    useEffect(() => {
        if (!loading && (!isAuthenticated || !isCompany)) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, isCompany, loading, router]);

    // Fetch job data
    useEffect(() => {
        const fetchJobDetails = async () => {
            if (!jobId || !token) return;

            setLoading(true);
            setError(null);

            try {
                const response = await axios.get<Job>(
                    `http://localhost:5000/api/jobs/${jobId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                // Format the date to YYYY-MM-DD for the input field
                const job: Job = response.data;
                if (job.applicationDeadline) {
                    job.applicationDeadline = new Date(job.applicationDeadline)
                        .toISOString().split('T')[0];
                }

                setFormData(job);
            } catch (err: any) {
                console.error('Error fetching job details:', err);
                setError(err.response?.data?.message || 'Failed to load job details');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && isCompany && token) {
            fetchJobDetails();
        }
    }, [jobId, token, isAuthenticated, isCompany]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Special handling for salary to maintain backward compatibility
        if (name === 'salary') {
            setFormData(prev => ({ ...prev, salary: value }));
        } else if (name.includes('.')) {
            // This code can be removed if you no longer need to handle nested properties
            // But keeping it might be useful for backward compatibility
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent as keyof typeof prev] as any,
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handle array inputs (requirements, responsibilities, skills)
    const handleArrayChange = (index: number, value: string, field: 'requirements' | 'responsibilities' | 'skills') => {
        setFormData(prev => {
            const newArray = [...(prev[field] || [])];
            newArray[index] = value;
            return { ...prev, [field]: newArray };
        });
    };

    // Add new item to array
    const handleAddItem = (field: 'requirements' | 'responsibilities' | 'skills') => {
        setFormData(prev => {
            const newArray = [...(prev[field] || []), ''];
            return { ...prev, [field]: newArray };
        });
    };

    // Remove item from array
    const handleRemoveItem = (index: number, field: 'requirements' | 'responsibilities' | 'skills') => {
        setFormData(prev => {
            const newArray = [...(prev[field] || [])];
            if (newArray.length > 1) {
                newArray.splice(index, 1);
            }
            return { ...prev, [field]: newArray };
        });
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!formData.title || !formData.description || !formData.location) {
            setSubmitError('Please fill in all required fields');
            return;
        }

        // Filter out empty array items
        const cleanedData = {
            ...formData,
            requirements: formData.requirements?.filter(item => item.trim() !== ''),
            responsibilities: formData.responsibilities?.filter(item => item.trim() !== ''),
            skills: formData.skills?.filter(item => item.trim() !== '')
        };

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            await axios.put(
                `http://localhost:5000/api/jobs/${jobId}`,
                cleanedData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Redirect to job details page on success
            router.push(`/company/jobs/${jobId}`);
        } catch (err: any) {
            console.error('Error updating job:', err);
            setSubmitError(err.response?.data?.message || 'Failed to update job');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-sm shadow-sm">
                    <div className="animate-pulse space-y-4">
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-40 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-sm shadow-sm text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="mb-4">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-black text-white rounded-sm hover:bg-gray-800"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-center">
                    <button
                        onClick={() => router.back()}
                        className="mr-4 text-gray-600 hover:text-black flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back
                    </button>
                    <h1 className="text-2xl font-bold">Edit Job Posting</h1>
                </div>

                {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm mb-6">
                        {submitError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-sm p-6 mb-6">
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="title">
                            Job Title *
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="description">
                            Job Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="location">
                                Location *
                            </label>
                            <input
                                id="location"
                                name="location"
                                type="text"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-black"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="type">
                                Job Type
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-black"
                            >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                                <option value="Remote">Remote</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="salary">
                                Salary
                            </label>
                            <input
                                id="salary"
                                name="salary"
                                type="text"
                                value={formData.salary || ''}
                                onChange={handleChange}
                                placeholder="e.g., $50,000 - $70,000 per year"
                                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Include the salary range and currency (e.g., "$50,000 - $70,000 USD per year" or "Competitive")
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="experienceLevel">
                                Experience Level
                            </label>
                            <select
                                id="experienceLevel"
                                name="experienceLevel"
                                value={formData.experienceLevel}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-black"
                            >
                                <option value="Entry-level">Entry-level</option>
                                <option value="Mid-level">Mid-level</option>
                                <option value="Senior">Senior</option>
                                <option value="Executive">Executive</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="educationLevel">
                                Education Level
                            </label>
                            <input
                                id="educationLevel"
                                name="educationLevel"
                                type="text"
                                value={formData.educationLevel}
                                onChange={handleChange}
                                placeholder="e.g., Bachelor's Degree, High School Diploma"
                                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="applicationDeadline">
                            Application Deadline
                        </label>
                        <input
                            id="applicationDeadline"
                            name="applicationDeadline"
                            type="date"
                            value={formData.applicationDeadline}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                            Requirements
                        </label>
                        {formData.requirements?.map((req, index) => (
                            <div key={`req-${index}`} className="flex mb-2">
                                <input
                                    type="text"
                                    value={req}
                                    onChange={(e) => handleArrayChange(index, e.target.value, 'requirements')}
                                    className="flex-grow px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="Add a requirement"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index, 'requirements')}
                                    className="ml-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-sm hover:bg-gray-300"
                                    disabled={formData.requirements?.length === 1}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => handleAddItem('requirements')}
                            className="mt-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200"
                        >
                            + Add Requirement
                        </button>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                            Responsibilities
                        </label>
                        {formData.responsibilities?.map((resp, index) => (
                            <div key={`resp-${index}`} className="flex mb-2">
                                <input
                                    type="text"
                                    value={resp}
                                    onChange={(e) => handleArrayChange(index, e.target.value, 'responsibilities')}
                                    className="flex-grow px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="Add a responsibility"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index, 'responsibilities')}
                                    className="ml-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-sm hover:bg-gray-300"
                                    disabled={formData.responsibilities?.length === 1}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => handleAddItem('responsibilities')}
                            className="mt-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200"
                        >
                            + Add Responsibility
                        </button>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                            Skills
                        </label>
                        {formData.skills?.map((skill, index) => (
                            <div key={`skill-${index}`} className="flex mb-2">
                                <input
                                    type="text"
                                    value={skill}
                                    onChange={(e) => handleArrayChange(index, e.target.value, 'skills')}
                                    className="flex-grow px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="Add a skill"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index, 'skills')}
                                    className="ml-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-sm hover:bg-gray-300"
                                    disabled={formData.skills?.length === 1}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => handleAddItem('skills')}
                            className="mt-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200"
                        >
                            + Add Skill
                        </button>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="status">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                            <option value="Draft">Draft</option>
                        </select>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="mr-4 px-6 py-2 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-black text-white rounded-sm hover:bg-gray-800 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Updating...' : 'Update Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}