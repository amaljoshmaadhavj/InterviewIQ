'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, BarChart3, ArrowRight } from 'lucide-react';
import { UploadZone } from '@/components/UploadZone';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { state } = useApp();
  const router = useRouter();

  // If user already has resume, skip to role selection
  useEffect(() => {
    if (state.resumeData) {
      router.push('/role-selection');
    }
  }, [state.resumeData, router]);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Interviewer',
      description: 'Practice with an intelligent AI that adapts to your skill level',
    },
    {
      icon: Zap,
      title: 'Real-Time Feedback',
      description: 'Get instant feedback on clarity, depth, and technical accuracy',
    },
    {
      icon: BarChart3,
      title: 'Detailed Reports',
      description: 'Track your progress with comprehensive performance analytics',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen pt-32 pb-16 px-4 flex items-center">
        <div className="max-w-4xl mx-auto w-full">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-16 h-16 text-cyan-500" />
              </motion.div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Master Technical Interviews
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Practice coding interviews with AI. Get real-time feedback, identify weaknesses, and build confidence before the real thing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-200 flex items-center justify-center gap-2 group">
                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200 border border-gray-700">
                Learn More
              </button>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-3 gap-6 mt-16 mb-16"
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-cyan-500/30 transition-all duration-200"
                >
                  <Icon className="w-10 h-10 text-cyan-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Practice?
            </h2>
            <p className="text-gray-400">
              Upload your resume to get started. We'll analyze your experience and tailor interview questions to your background.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <UploadZone />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4 text-center text-gray-400 text-sm">
        <p>&copy; 2024 InterviewIQ. All rights reserved.</p>
      </footer>
    </div>
  );
}
