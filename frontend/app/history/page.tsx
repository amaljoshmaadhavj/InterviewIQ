'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Plus,
  Target,
  History as HistoryIcon,
  TrendingUp,
  BrainCircuit,
  Calendar,
} from 'lucide-react';
import { api } from '@/services/api';
import { useNewInterview } from '@/hooks/useNewInterview';
import { formatDate } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import type { InterviewHistoryItem } from '@/utils/types';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="card p-5 bg-white border border-slate-200/90 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
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
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to connect to server. Please ensure the backend is running at http://localhost:8000'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

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
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 bg-slate-50/50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="chip bg-blue-50 text-blue-700 border border-blue-200/90 font-medium mb-1.5">
              <HistoryIcon className="w-3.5 h-3.5" />
              Practice Records
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Interview History
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Review your technical rounds, performance rubrics, and feedback over time.
            </p>
          </div>

          <button onClick={startNewInterview} className="btn btn-primary btn-md self-start sm:self-auto">
            <Plus className="w-4 h-4" />
            <span>New Practice Round</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500">Loading interview history...</p>
          </div>
        ) : error ? (
          <div className="card max-w-md mx-auto text-center p-8 bg-white border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Backend Connection Notice</h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">{error}</p>
            <Link href="/" className="btn btn-primary btn-md">
              Start New Interview
            </Link>
          </div>
        ) : interviews.length === 0 ? (
          /* Empty State */
          <div className="card max-w-lg mx-auto text-center p-8 sm:p-12 bg-white border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center mx-auto mb-4">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-1">No Practice Sessions Yet</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
              Upload your resume and select an engineering track to complete your first mock interview.
              Your scores and reports will appear here.
            </p>
            <Link href="/" className="btn btn-primary btn-md">
              <Plus className="w-4 h-4" />
              <span>Start Your First Interview</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={Target}
                label="Total Sessions"
                value={String(interviews.length)}
                sub="Completed technical rounds"
              />
              <StatCard
                icon={BarChart3}
                label="Average Score"
                value={`${averageScore.toFixed(1)} / 10`}
                sub="Across all answered questions"
              />
              <StatCard
                icon={TrendingUp}
                label="Best Score"
                value={`${bestScore.toFixed(1)} / 10`}
                sub="Your highest scoring round"
              />
            </div>

            {/* List of Sessions */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                Completed Sessions
              </h2>

              <div className="space-y-2.5">
                {interviews.map((interview) => {
                  const score = interview.score;
                  const hasScore = score != null;
                  return (
                    <div
                      key={interview.session_id}
                      className="card p-4 sm:p-5 bg-white border border-slate-200 hover:border-slate-300 transition-colors duration-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900">
                            {interview.role}
                          </h3>
                          {interview.experience_level && (
                            <span className="chip bg-slate-100 text-slate-700 border border-slate-200 capitalize text-[11px]">
                              {interview.experience_level}
                            </span>
                          )}
                          {hasScore ? (
                            <span
                              className={cn(
                                'chip text-[11px] font-bold border',
                                score! >= 8
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : score! >= 6
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                              )}
                            >
                              {score}/10
                            </span>
                          ) : (
                            <span className="chip bg-slate-100 text-slate-500 border border-slate-200 text-[11px]">
                              In Progress
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(new Date(interview.created_at || new Date()))}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-center">
                        {hasScore && (
                          <div className="w-24 hidden sm:block">
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${((score || 0) / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                        <Link
                          href={`/interview/report?session=${interview.session_id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          <span>View Report</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}