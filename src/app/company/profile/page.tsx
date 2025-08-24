"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface CompanyProfile {
    _id: string;
    name: string;
    email: string;
    description: string;
    location: string;
    website: string;
    industry: string;
}

export default function CompanyProfilePage() {
    const router = useRouter();
    const { isAuthenticated, isCompany, token } = useAuth();

    const [profile, setProfile] = useState<CompanyProfile>({
        _id: '',
        name: '',
        email: '',
        description: '',
        location: '',
        website: '',
        industry: '',
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Check authentication and redirect if needed
    useEffect(() => {
        if (!loading && (!isAuthenticated || !isCompany)) {
            router.push('/auth/login');
            return;
        }
    }, [isAuthenticated, isCompany, loading, router]);

    // Fetch company profile
    useEffect(() => {
        const fetchProfile = async () => {
            if (!isAuthenticated || !isCompany || !token) return;

            setLoading(true);
            setError(null);

            try {
                const response = await axios.get<CompanyProfile>(
                    'http://localhost:5000/api/companies/profile',
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setProfile(response.data);

            } catch (err: any) {
                console.error('Error fetching company profile:', err);
                setError(err.response?.data?.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchProfile();
        }
    }, [isAuthenticated, isCompany, token]);

    // Handle input changes
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    // Handle image upload
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);

            // Create a preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated || !isCompany || !token) {
            setError('You must be logged in as a company to update your profile');
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // First, update the basic profile information
            const profileResponse = await axios.put(
                'http://localhost:5000/api/companies/profile',
                profile,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('Profile updated:', profileResponse.data);

            // If there's a new image file, upload it separately
            if (imageFile) {
                const formData = new FormData();
                formData.append('logo', imageFile);

                const logoResponse = await axios.put(
                    'http://localhost:5000/api/companies/logo',
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                console.log('Logo updated:', logoResponse.data);

                // Update the profile with the new logo URL
                const logoData = logoResponse.data as { logo?: string };
                if (logoData.logo) {
                    setProfile(prev => ({ ...prev, logo: logoData.logo }));
                }
            }

            setSuccess('Profile updated successfully');

            // Update the local storage user object with the new profile data
            const currentUser = localStorage.getItem('user');
            if (currentUser) {
                const user = JSON.parse(currentUser);
                localStorage.setItem('user', JSON.stringify({
                    ...user,
                    name: profile.name
                }));
            }

        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-10">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-white rounded-sm shadow-sm p-8">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="space-y-2">
                                <div className="h-10 bg-gray-200 rounded"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Page Header with back button */}
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => router.back()}
                        className="mr-4 text-gray-600 hover:text-black"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold">Company Profile</h1>
                </div>

                {/* Success message */}
                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-sm relative">
                        <span className="block sm:inline">{success}</span>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-sm relative">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white shadow-sm rounded-sm overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-medium text-gray-900">Company Logo</h2>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <div className="shrink-0 mb-4 sm:mb-0 sm:mr-6">
                                <div className="h-28 w-28 rounded-sm bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Company logo preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-gray-500 text-sm">No Logo</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex-grow">
                                <label className="block">
                                    <span className="text-gray-700 text-sm font-medium">Upload Company Logo</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="mt-1 block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-sm file:border-0
                                            file:text-sm file:font-medium
                                            file:bg-black file:text-white
                                            hover:file:bg-gray-800"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Recommended: Square image, at least 200x200 pixels. Max size: 5MB.
                                    </p>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form with all sections */}
                <form onSubmit={handleSubmit}>
                    {/* Basic Information Section */}
                    <div className="bg-white shadow-sm rounded-sm overflow-hidden mb-6">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Company Name*
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleChange}
                                        required
                                        className="block w-full rounded-sm border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address*
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleChange}
                                        required
                                        className="block w-full rounded-sm border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        id="website"
                                        name="website"
                                        value={profile.website}
                                        onChange={handleChange}
                                        placeholder="https://example.com"
                                        className="block w-full rounded-sm border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                        Location*
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={profile.location}
                                        onChange={handleChange}
                                        required
                                        placeholder="City, Country"
                                        className="block w-full rounded-sm border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Company Details Section */}
                    <div className="bg-white shadow-sm rounded-sm overflow-hidden mb-6">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-lg font-medium text-gray-900">Company Details</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                                    Industry*
                                </label>
                                <select
                                    id="industry"
                                    name="industry"
                                    value={profile.industry}
                                    onChange={handleChange}
                                    required
                                    className="block w-full rounded-sm border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                >
                                    <option value="">Select Industry</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Education">Education</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                    <option value="Services">Services</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Company Description Section */}
                    <div className="bg-white shadow-sm rounded-sm overflow-hidden mb-6">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-lg font-medium text-gray-900">Company Description</h2>
                        </div>
                        <div className="p-6">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                About Your Company*
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={profile.description}
                                onChange={handleChange}
                                required
                                rows={5}
                                className="block w-full rounded-sm border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                placeholder="Tell potential candidates about your company, culture, mission, and values..."
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                This description will be shown on your public profile and job listings.
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-sm shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving Changes...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}