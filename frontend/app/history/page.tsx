'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AlertCircle, ArrowRight, BarChart3, Plus, Target, History as HistoryIcon, TrendingUp } from 'lucide-react';
import { api } from '@/services/api';
import { useNewInterview } from '@/hooks/useNewInterview';
import { formatDate, getScoreColor, getScoreBarColor } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import type { InterviewHistoryItem } from '@/utils/types';

function StatCard({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="card p-5 hover:border-violet-400/30 transition-colors">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-1.5">
        <Icon className="w-4 h-4 text-violet-400" />
        {label}
      </div>
      <p className={cn('text-3xl font-bold text-white tracking-tight', valueClass)}>{value}</p>
    </div>
  );
}

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
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
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
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="chip bg-violet-500/10 text-violet-300 border border-violet-400/25 mb-4">
            <HistoryIcon className="w-3.5 h-3.5" /> Your progress
          </span>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Interview History</h1>
          <p className="text-slate-400">Track your progress and review past interviews</p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center pt-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-2 border-slate-700 border-t-violet-400 rounded-full"
            />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card max-w-md mx-auto text-center py-12 px-8"
          >
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-400/25 w-fit mx-auto mb-5">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-white mb-6">{error}</p>
            <Link href="/" className="btn btn-primary btn-md">
              Start Interview
            </Link>
          </motion.div>
        ) : interviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card max-w-md mx-auto text-center py-14 px-8"
          >
            <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-400/25 w-fit mx-auto mb-5">
              <HistoryIcon className="w-8 h-8 text-violet-300" />
            </div>
            <p className="text-white font-semibold mb-2">No interviews yet</p>
            <p className="text-slate-400 text-sm mb-6">Start your first interview and see your results here.</p>
            <Link href="/" className="btn btn-primary btn-md">
              Start Interview
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Stats Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
            >
              <StatCard icon={Target} label="Total Interviews" value={String(interviews.length)} />
              <StatCard
                icon={BarChart3}
                label="Average Score"
                value={averageScore.toFixed(1)}
                valueClass={getScoreColor(averageScore)}
              />
              <StatCard
                icon={TrendingUp}
                label="Best Score"
                value={bestScore.toFixed(1)}
                valueClass={getScoreColor(bestScore)}
              />
            </motion.div>

            {/* List */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
              {interviews.map((interview) => {
                const score = interview.score;
                const hasScore = score != null;
                return (
                  <motion.div
                    key={interview.session_id}
                    variants={itemVariants}
                    className="card p-6 hover:border-violet-400/35 transition-all duration-200 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-white truncate">{interview.role}</h3>
                          {interview.experience_level && (
                            <span className="chip bg-sky-500/10 text-sky-300 border border-sky-400/25 capitalize">
                              {interview.experience_level}
                            </span>
                          )}
                          {hasScore && (
                            <span className={cn('chip border font-semibold', getScoreColor(score!))}>
                              {score}/10
                            </span>
                          )}
                          {!hasScore && (
                            <span className="chip bg-slate-700/40 text-slate-400 border border-slate-600/50">
                              In Progress
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{formatDate(new Date(interview.created_at || new Date()))}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        {hasScore && (
                          <div className="text-right">
                            <p className="text-xs text-slate-500 mb-1">Performance</p>
                            <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={cn('h-full bg-gradient-to-r rounded-full transition-all duration-500', getScoreBarColor(score!))}
                                style={{ width: `${((score || 0) / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                        <Link
                          href={`/interview/report?session=${interview.session_id}`}
                          aria-label={`View report for ${interview.role}`}
                          className="btn btn-secondary btn-sm flex-shrink-0 group-hover:border-violet-400/40"
                        >
                          View Report <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Footer Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mt-12"
            >
              <button onClick={startNewInterview} className="btn btn-primary btn-lg">
                <Plus className="w-4 h-4" /> Start New Interview
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}