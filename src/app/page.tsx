'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type Job = {
  id: string | number;
  title: string;
  company: string | { companyName?: string };
  location: string;
  logo?: string;
};

export default function Home() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        // Use dynamic import for server functions in client components
        const { fetchFeaturedJobs } = await import('@/services/jobService');
        const response = await fetchFeaturedJobs();
        const jobs = Array.isArray(response) ? response :
          (response?.data || response?.jobs || []);
        setFeaturedJobs(jobs);
      } catch (error) {
        console.error("Error fetching featured jobs:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchJobs();
  }, []);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const // Add type assertion
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardHover = {
    rest: { scale: 1, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" },
    hover: {
      scale: 1.02,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Hero Section with Animated Background and Elements */}
      <section className="relative py-20 bg-gradient-to-br from-white to-gray-50 border-b border-gray-100 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-black opacity-5"
            animate={{
              x: [0, 10, 0],
              y: [0, 15, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -left-20 bottom-10 w-60 h-60 rounded-full bg-black opacity-5"
            animate={{
              x: [0, -15, 0],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <motion.div
              className="md:w-1/2 mb-12 md:mb-0"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <motion.h1
                className="text-5xl font-bold mb-1 leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-700"
                variants={fadeIn}
              >
                Find Your <span className="font-extrabold">First Experience</span>
              </motion.h1>
              <motion.h1
                className='text-3xl font-bold mb-6 leading-tight tracking-tight'
                variants={fadeIn}
              >
                Created By Students, For Students.
              </motion.h1>
              <motion.p
                className="text-xl text-gray-600 mb-8 max-w-lg"
                variants={fadeIn}
              >
                UniJobs connects recent graduates and students with companies looking for fresh talent.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={fadeIn}>
                  <Link href="/jobs" className="inline-block bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-md transition-all duration-300 text-center shadow-md hover:shadow-lg transform hover:-translate-y-1">
                    Explore Opportunities
                  </Link>
                </motion.div>
                <motion.div variants={fadeIn}>
                  <Link href="/auth/register" className="inline-block border border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-md transition-all duration-300 text-center transform hover:-translate-y-1">
                    I'm a Company
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="relative h-80 w-full rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/technology_career.webp"
                  alt="Technology Career"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section with Card Animations */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-1 text-center">INSPIRED BY STUDENTS FOR STUDENTS</h2>
            <h3 className="text-3xl font-bold mb-6 text-center">WHO SEARCH FOR OPPORTUNITIES</h3>
            <p className="text-gray-600 text-center max-w-3xl mx-auto">
              UniJobs is designed specifically to address the challenges students face when entering the job market.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.div
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300"
              variants={fadeIn}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mb-6 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Easy Search</h3>
              <p className="text-gray-600">Find opportunities that suites for you, without complications and focused on transparency.</p>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300"
              variants={fadeIn}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mb-6 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Time-Saving</h3>
              <p className="text-gray-600">Don't wait for a response, transparency is key for applicants. We've integrated a status system and a private chat between applicants and companies. </p>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300"
              variants={fadeIn}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mb-6 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Quality Candidates & Companies</h3>
              <p className="text-gray-600">Our goal is to provide a tool for those who are looking for their next opportunity. Our values are dedication to the community, transparency, and honesty.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About the Creator Section with Parallax Effect */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-6 text-center">INSPIRATION TO CREATE UNIJOBS</h2>
            <p className="text-gray-600 text-center max-w-3xl mx-auto">
              Inspiration comes from the difficulty in finding opportunities,
              the lack of transparency on other websites, the coldness of AI in rejecting students with great potential.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className="grid md:grid-cols-2 gap-0">
              <motion.div
                className="p-10"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold mb-4">A Student's Journey</h3>
                <p className="text-gray-600 mb-6">
                  As a student, I experienced firsthand the frustration of searching for my first professional opportunity.
                  Job listings would demand years of experience, interview processes lacked transparency, and rejection emails
                  came without feedback or explanation.
                </p>

                <p className="text-gray-600 mb-6">
                  I realized that the traditional job market wasn't designed with students in mind. Most platforms
                  are built for experienced professionals, leaving those at the beginning of their career journey
                  feeling lost and undervalued.
                </p>

                <p className="text-gray-600 mb-6">
                  UniJobs was born from this struggle. I wanted to create a platform that truly understands what
                  students need: transparency in the application process, opportunities that value potential over
                  experience, and a human approach to hiring that sees beyond just the resume.
                </p>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-2xl font-bold mb-4">Who Am I?</h3>
                  <p className="text-gray-600 mb-6">
                    I'm a student who lives in Argentina, Province of Buenos Aires, Bahia Blanca.
                    I am pursuing the goal of becoming a Software Engineer who strugles to find opportunities as a student,
                    and that's why I created UniJobs.
                  </p>

                  <p className="text-gray-600">
                    This project born from the desire to help students like myself,
                    Instead of creating a product i wanted to create a open source project that anyone can contribute
                    and help to improve the experience of students looking for their first job.
                  </p>
                </motion.div>

                <motion.div
                  className="mt-8"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h4 className="font-semibold text-lg mb-3">Our Core Values</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-black mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700"><span className="font-medium">Transparency:</span> No more black-box recruiting processes</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-black mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700"><span className="font-medium">Community:</span> Supporting students at every step</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-black mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700"><span className="font-medium">Human Connection:</span> Real people, not algorithms</span>
                    </li>
                  </ul>
                </motion.div>
              </motion.div>

              <motion.div
                className="relative overflow-hidden"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="absolute inset-0 bg-black opacity-10"
                  whileInView={{
                    opacity: [0.1, 0.15, 0.1],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                ></motion.div>
                <motion.div
                  className="h-full min-h-[800px]"
                  whileInView={{
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Image
                    src="/images/argentina_map.png"
                    alt="Argentina Map"
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="mt-16 bg-gradient-to-r from-gray-900 to-black rounded-xl p-10 text-center shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <h3 className="text-xl font-bold mb-4 text-white">Join Us in Changing How Students Find Opportunities</h3>
            <p className="text-gray-300 max-w-2xl mx-auto mb-6">
              Whether you're a student looking for your first break or a company wanting to discover fresh talent,
              UniJobs is building a community where potential is valued and connections are meaningful.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link href="/auth/register" className="inline-block bg-white text-black hover:bg-gray-100 px-6 py-3 rounded-md transition-colors shadow-md">
                Get Started Today
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Jobs Section with Card Animations */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            className="flex justify-between items-end mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-3xl font-bold">Featured Opportunities</h2>
            <Link href="/jobs" className="text-gray-700 hover:text-black font-medium transition-colors">
              View all jobs →
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full"
              ></motion.div>
            </div>
          ) : featuredJobs.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {featuredJobs.map((job: Job) => (
                <motion.div
                  key={job.id}
                  className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                  variants={fadeIn}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                        {job.logo ? (
                          <Image src={job.logo} alt={`${job.company} logo`} width={32} height={32} />
                        ) : (
                          <span className="text-gray-400 text-sm font-medium">{typeof job.company === 'string' ? job.company.charAt(0) : job.company?.companyName?.charAt(0) || 'C'}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-black transition-colors">{job.title}</h3>
                        <p className="text-gray-600 text-sm">
                          {typeof job.company === 'string'
                            ? job.company
                            : job.company?.companyName || 'Company'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </div>
                    <div className="flex justify-between items-center">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-sm font-medium text-black hover:text-gray-700 transition-colors flex items-center"
                      >
                        View details
                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="bg-white p-12 text-center rounded-xl shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="text-gray-600 mb-6 text-lg">We're curating the best opportunities for you.</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link href="/jobs" className="inline-block bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-md transition-colors shadow-md">
                  Browse All Jobs
                </Link>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section with Animation */}
      <motion.section
        className="py-24 bg-gradient-to-r from-gray-900 to-black text-white relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Animated background elements */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-5 rounded-full"
          animate={{
            x: [0, -30, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        />

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h2
            className="text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to Make a Difference?
          </motion.h2>
          <motion.p
            className="text-gray-300 max-w-2xl mx-auto mb-10 text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Whether you're seeking new career opportunities or looking to build your team, UniJobs is here to help.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link href="/auth/register" className="inline-block bg-white text-black hover:bg-gray-100 px-8 py-4 rounded-md transition-colors shadow-lg font-medium">
                Create Account
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link href="/about" className="inline-block border border-white/30 hover:bg-white/10 px-8 py-4 rounded-md transition-colors font-medium">
                Learn More
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}