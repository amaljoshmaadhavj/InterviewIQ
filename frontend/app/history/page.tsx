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
    <div className="card p-5 hover:border-blue-300 transition-colors">
      <div className="flex items-center gap-2 text-slate-500 text-sm mb-1.5">
        <Icon className="w-4 h-4 text-blue-500" />
        {label}
      </div>
      <p className={cn('text-3xl font-extrabold text-slate-800 tracking-tight', valueClass)}>{value}</p>
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="chip bg-blue-100 text-blue-700 border border-blue-200 mb-4">
            <HistoryIcon className="w-3.5 h-3.5" /> Your progress
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-900">Interview History</h1>
          <p className="text-slate-500">Track your progress and review past interviews</p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center pt-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-2 border-blue-200 border-t-blue-500 rounded-full"
            />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card max-w-md mx-auto text-center py-12 px-8"
          >
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 w-fit mx-auto mb-5">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <p className="text-slate-800 mb-6">{error}</p>
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
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 w-fit mx-auto mb-5">
              <HistoryIcon className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-slate-800 font-bold mb-2">No interviews yet</p>
            <p className="text-slate-500 text-sm mb-6">Start your first interview and see your results here.</p>
            <Link href="/" className="btn btn-primary btn-md">
              Start Interview
            </Link>
          </motion.div>
        ) : (
          <>
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

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
              {interviews.map((interview) => {
                const score = interview.score;
                const hasScore = score != null;
                return (
                  <motion.div
                    key={interview.session_id}
                    variants={itemVariants}
                    className="card p-6 hover:border-blue-300 hover:shadow-card transition-all duration-200 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-bold text-slate-800 truncate">{interview.role}</h3>
                          {interview.experience_level && (
                            <span className="chip bg-cyan-50 text-cyan-700 border border-cyan-200 capitalize">
                              {interview.experience_level}
                            </span>
                          )}
                          {hasScore && (
                            <span className={cn('chip border font-bold', getScoreColor(score!))}>
                              {score}/10
                            </span>
                          )}
                          {!hasScore && (
                            <span className="chip bg-slate-100 text-slate-500 border border-slate-200">
                              In Progress
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">{formatDate(new Date(interview.created_at || new Date()))}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        {hasScore && (
                          <div className="text-right">
                            <p className="text-xs text-slate-400 mb-1">Performance</p>
                            <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
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
                          className="btn btn-secondary btn-sm flex-shrink-0 group-hover:border-blue-300"
                        >
                          View Report <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

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