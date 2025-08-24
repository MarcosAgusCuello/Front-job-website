'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, isCompany, user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    router.push('/auth/login');
  };

  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    closeMenu();
    router.push(path);
  };

  const isActive = (path: string) => {
    return pathname === path ? 'text-black font-medium' : 'text-gray-600 hover:text-black transition-colors';
  };

  // Determine the correct dashboard URL based on user type
  const dashboardUrl = isCompany ? '/dashboard' : '/user/dashboard';

  // Determine the correct profile URL based on user type
  const profileUrl = isCompany ? '/company/profile' : '/user/profile';

  // Get user display name based on account type
  const getUserDisplayName = (): string => {
    if (!user) return '';

    if (isCompany && 'name' in user && typeof user.name === 'string') {
      return user.name;
    } else if (isCompany && 'companyName' in user && typeof user.companyName === 'string') {
      return user.companyName;
    } else if (!isCompany && 'firstName' in user && typeof user.firstName === 'string') {
      return `${user.firstName} ${user.lastName || ''}`.trim();
    }

    return '';
  };

  // Get first letter of name for avatar fallback
  const getAvatarInitial = () => {
    const displayName = getUserDisplayName();
    return displayName ? displayName.charAt(0).toUpperCase() : '?';
  };

  const displayName = getUserDisplayName();

  // Debug information
  console.log('Auth state:', {
    isAuthenticated,
    isCompany,
    dashboardUrl,
    profileUrl,
    pathname
  });

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-xl font-medium tracking-tight" onClick={closeMenu}>
            Uni<span className="font-bold">Jobs</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link href="/jobs" className={`${isActive('/jobs')}`}>
              Find Jobs
            </Link>
            <Link href="/companies" className={`${isActive('/companies')}`}>
              Companies
            </Link>

            {isAuthenticated ? (
              <>
                <button
                  onClick={handleNavigation(dashboardUrl)}
                  className={`${isActive(dashboardUrl)}`}
                >
                  Dashboard
                </button>

                {/* User profile section */}
                <div className="flex items-center ml-4">
                  <button onClick={handleNavigation(profileUrl)} className="flex items-center hover:opacity-80">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium overflow-hidden mr-2">
                      {user && 'avatar' in user && (user as any).avatar ? (
                        <Image
                          src={(user as any).avatar}
                          alt={typeof displayName === 'string' && displayName.length > 0 ? displayName : 'User Avatar'}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{getAvatarInitial()}</span>
                      )}
                    </div>
                    {typeof displayName === 'string' && displayName.length > 0 && (
                      <span className="text-sm font-medium mr-4 max-w-[120px] truncate">
                        {displayName}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded-sm transition-colors text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-black font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded-sm transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 space-y-3 pb-4 border-t border-gray-100 pt-3">
            <Link
              href="/jobs"
              className={`block py-2 ${isActive('/jobs')}`}
              onClick={closeMenu}
            >
              Find Jobs
            </Link>
            <Link
              href="/companies"
              className={`block py-2 ${isActive('/companies')}`}
              onClick={closeMenu}
            >
              Companies
            </Link>

            {isAuthenticated ? (
              <>
                {/* Mobile user profile */}
                <button onClick={handleNavigation(profileUrl)} className="block w-full text-left">
                  <div className="flex items-center py-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium overflow-hidden mr-2">
                      {user && 'avatar' in user && (user as any).avatar ? (
                        <Image
                          src={(user as any).avatar}
                          alt={displayName || 'User Avatar'}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{getAvatarInitial()}</span>
                      )}
                    </div>
                    {typeof displayName === 'string' && displayName.length > 0 && (
                      <span className="text-sm font-medium truncate">
                        {displayName}
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={handleNavigation(dashboardUrl)}
                  className={`block w-full text-left py-2 ${isActive(dashboardUrl)}`}
                >
                  Dashboard
                </button>

                <button
                  onClick={handleNavigation(profileUrl)}
                  className={`block w-full text-left py-2 ${isActive(profileUrl)}`}
                >
                  {isCompany ? 'Company Profile' : 'My Profile'}
                </button>

                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-gray-700 hover:text-black"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block py-2 text-gray-700 hover:text-black"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block py-2 mt-2 bg-black hover:bg-gray-800 text-white rounded-sm px-3"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}