import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-xl font-medium tracking-tight">
              Uni<span className="font-bold">Jobs</span>
            </Link>
            <p className="mt-4 text-gray-600 max-w-md">
              UniJobs connects talented graduates and students with over the world's companies.
            </p>
            <p className="text-gray-600 max-w-md">
              Be ready to take the next step in your career or find the perfect candidate for your team.
            </p>
            <p className="mt-6 text-gray-500 text-sm">
              © {currentYear} JobBoard. All rights reserved.
            </p>
          </div>

          {/* For Users */}
          <div>
            <h3 className="font-medium text-black mb-4">For Users</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/jobs" className="text-gray-600 hover:text-black transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/create-profile" className="text-gray-600 hover:text-black transition-colors">
                  Create Profile
                </Link>
              </li>
              <li>
                <Link href="/career-resources" className="text-gray-600 hover:text-black transition-colors">
                  Career Resources
                </Link>
              </li>
              <li>
                <Link href="/saved-jobs" className="text-gray-600 hover:text-black transition-colors">
                  Saved Jobs
                </Link>
              </li>
            </ul>
          </div>

          {/* For Companies */}
          <div>
            <h3 className="font-medium text-black mb-4">For Companies</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/post-job" className="text-gray-600 hover:text-black transition-colors">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/companies" className="text-gray-600 hover:text-black transition-colors">
                  Company Directory
                </Link>
              </li>
              <li>
                <Link href="/recruiting-solutions" className="text-gray-600 hover:text-black transition-colors">
                  Recruiting Solutions
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-black transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="space-x-4 mb-4 md:mb-0">
            <Link href="/about" className="text-gray-600 hover:text-black transition-colors">
              About
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-black transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-black transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-black transition-colors">
              Contact
            </Link>
          </div>

          <div className="flex space-x-4">
            <a href="https://github.com/MarcosAgusCuello" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-gray-500 hover:text-black transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017C2 16.5 4.865 20.257 8.84 21.636C9.34 21.729 9.525 21.422 9.525 21.156C9.525 20.917 9.516 20.248 9.512 19.426C6.726 20.051 6.139 18.139 6.139 18.139C5.685 17.003 5.029 16.697 5.029 16.697C4.139 16.066 5.099 16.079 5.099 16.079C6.092 16.15 6.628 17.123 6.628 17.123C7.52 18.682 8.97 18.186 9.545 17.931C9.635 17.252 9.895 16.757 10.184 16.501C7.954 16.242 5.62 15.391 5.62 11.537C5.62 10.443 6.011 9.54 6.649 8.829C6.548 8.576 6.202 7.532 6.747 6.155C6.747 6.155 7.586 5.886 9.5 7.181C10.3 6.963 11.15 6.852 12 6.849C12.85 6.852 13.7 6.962 14.5 7.18C16.413 5.885 17.25 6.154 17.25 6.154C17.796 7.531 17.45 8.576 17.35 8.828C17.989 9.54 18.377 10.443 18.377 11.537C18.377 15.4 16.039 16.239 13.8 16.492C14.164 16.811 14.5 17.44 14.5 18.401C14.5 19.784 14.488 20.829 14.488 21.155C14.488 21.423 14.669 21.732 15.179 21.631C19.158 20.252 22 16.495 22 12.017C22 6.484 17.522 2 12 2Z" />
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/marcosagustincuello/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-500 hover:text-black transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}