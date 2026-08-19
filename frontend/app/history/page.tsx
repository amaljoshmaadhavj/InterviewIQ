'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AlertCircle, ArrowRight, BarChart3, Plus, Target } from 'lucide-react';
import { api } from '@/services/api';
import { useNewInterview } from '@/hooks/useNewInterview';
import { formatDate, getScoreColor } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import type { InterviewHistoryItem } from '@/utils/types';

export default function HistoryPage() {
  const startNewInterview = useNewInterview();
  const [interviews, setInterviews] = useState<InterviewHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await api.getInterviewHistory();
        setInterviews(data.interviews || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  const scoredInterviews = interviews.filter((i) => i.score != null);
  const averageScore =
    scoredInterviews.length > 0
      ? scoredInterviews.reduce((sum, i) => sum + (i.score || 0), 0) / scoredInterviews.length
      : 0;
  const bestScore =
    scoredInterviews.length > 0
      ? Math.max(...scoredInterviews.map((i) => i.score || 0))
      : 0;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Interview History</h1>
          <p className="text-gray-400">Track your progress and review past interviews</p>
        </motion.div>

        {/* Stats Summary */}
        {!isLoading && !error && interviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10"
          >
            <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-5">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Target className="w-4 h-4 text-cyan-400" />
                Total Interviews
              </div>
              <p className="text-3xl font-bold text-white">{interviews.length}</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-5">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Average Score
              </div>
              <p className={cn('text-3xl font-bold', getScoreColor(averageScore))}>
                {averageScore.toFixed(1)}/10
              </p>
            </div>
            <div className="col-span-2 md:col-span-1 bg-gray-900/60 border border-gray-800 rounded-lg p-5">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Plus className="w-4 h-4 text-cyan-400" />
                Best Score
              </div>
              <p className={cn('text-3xl font-bold', getScoreColor(bestScore))}>{bestScore}/10</p>
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 border-4 border-gray-700 border-t-cyan-500 rounded-full mx-auto mt-12"
          />
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-white mb-6">{error}</p>
            <Link href="/" className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 inline-block">
              Start Interview
            </Link>
          </motion.div>
        ) : interviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <p className="text-gray-400 mb-6">No interviews yet. Start your first interview!</p>
            <Link href="/" className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 inline-block">
              Start Interview
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {interviews.map((interview) => (
              <motion.div
                key={interview.session_id}
                variants={itemVariants}
                className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-cyan-500/30 transition-all duration-200 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-white">{interview.role}</h3>
                      {interview.experience_level && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-400/10 border border-blue-400/30 text-blue-300 capitalize">
                          {interview.experience_level}
                        </span>
                      )}
                      <span className={cn('px-3 py-1 rounded text-xs font-medium', getScoreColor(interview.score || 0))}>
                        {interview.score != null ? `${interview.score}/10` : 'In Progress'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{formatDate(new Date(interview.created_at || new Date()))}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Performance</p>
                      <div className="w-24 bg-gray-800 rounded-full h-2 mt-1">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((interview.score || 0) / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    <Link
                      href={`/interview/report?session=${interview.session_id}`}
                      className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-all group-hover:translate-x-1"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Footer Action */}
        {interviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-12"
          >
            <button
              onClick={startNewInterview}
              className="px-8 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all duration-200 font-semibold"
            >
              Start New Interview
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
