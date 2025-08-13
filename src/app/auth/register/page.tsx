'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

export default function RegisterPage() {
  const [isCompanyRegistration, setIsCompanyRegistration] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    industry: '',
    location: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login, clearError } = useAuth();

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Toggle between user and company registration
  const toggleRegistrationType = () => {
    setIsCompanyRegistration(!isCompanyRegistration);
    clearError();
  };

  // Validate form before submission
  const validateForm = () => {
    // Clear previous errors
    setError('');

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Check password length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    // Company specific validation
    if (isCompanyRegistration && !formData.companyName) {
      setError('Company name is required');
      return false;
    }

    // User specific validation
    if (!isCompanyRegistration && (!formData.firstName || !formData.lastName)) {
      setError('First name and last name are required');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isCompanyRegistration) {
        // Register as a company
        const companyData = {
          companyName: formData.companyName,
          email: formData.email,
          password: formData.password,
          industry: formData.industry || undefined,
          location: formData.location || undefined
        };

        // Use the correct endpoint for company registration
        await axios.post('http://localhost:5000/api/auth/register', companyData);

        // Auto-login after registration
        await login(formData.email, formData.password, true);
      } else {
        // Register as a user
        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          location: formData.location || undefined
        };

        // Use the correct endpoint for user registration
        await axios.post('http://localhost:5000/api/users/register', userData);

        // Auto-login after registration
        await login(formData.email, formData.password, false);
      }

      // Redirect to dashboard if successful
      router.push('/dashboard');
    } catch (err: any) {
      // Handle API errors
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message ||
        'Registration failed. Please check your information and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 flex flex-col justify-center bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join JobBoard to find opportunities or great talent
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-sm sm:px-10">
          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm" role="alert">
              <p>{error}</p>
            </div>
          )}

          {/* Account Type Toggle */}
          <div className="mb-6">
            <div className="flex border border-gray-200 rounded-sm overflow-hidden">
              <button
                type="button"
                className={`w-1/2 py-3 px-4 text-sm font-medium transition-colors ${!isCompanyRegistration
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                onClick={() => setIsCompanyRegistration(false)}
              >
                Job Seeker
              </button>
              <button
                type="button"
                className={`w-1/2 py-3 px-4 text-sm font-medium transition-colors ${isCompanyRegistration
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                onClick={() => setIsCompanyRegistration(true)}
              >
                Company
              </button>
            </div>
          </div>

          {/* Registration Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Job Seeker Fields */}
            {!isCompanyRegistration && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Company Fields */}
            {isCompanyRegistration && (
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <div className="mt-1">
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    autoComplete="organization"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                  />
                </div>
              </div>
            )}

            {/* Common Fields */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
              </div>
            </div>

            {/* Optional Industry field for companies */}
            {isCompanyRegistration && (
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                  Industry
                </label>
                <div className="mt-1">
                  <input
                    id="industry"
                    name="industry"
                    type="text"
                    value={formData.industry}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                  />
                </div>
              </div>
            )}

            {/* Optional Location field */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <div className="mt-1">
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
              </div>
            </div>

            {/* Password fields */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link href="/terms" className="font-medium text-gray-700 hover:text-black">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-medium text-gray-700 hover:text-black">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          {/* Already have an account */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-gray-700 hover:text-black">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}