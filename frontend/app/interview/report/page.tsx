'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
  Home,
  Check,
  Sparkles,
  Target,
  Cpu,
} from 'lucide-react';
import { api } from '@/services/api';
import { useNewInterview } from '@/hooks/useNewInterview';
import { getScoreColor, getRecommendationColor } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import type { InterviewReportResponse } from '@/utils/types';

function ScoreRing({ score }: { score: number }) {
  const pct = Math.min(score / 10, 1);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;

  const color =
    score >= 8
      ? 'stroke-emerald-400'
      : score >= 6
        ? 'stroke-violet-400'
        : score >= 4
          ? 'stroke-amber-400'
          : 'stroke-red-400';

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" strokeWidth="9" className="stroke-slate-800" />
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          className={color}
          initial={{ strokeDasharray: `${circumference} ${circumference}` }}
          animate={{ strokeDasharray: `${circumference * pct} ${circumference}` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-4xl font-extrabold tracking-tight', getScoreColor(score))}>
          {score}
        </span>
        <span className="text-xs text-slate-500 font-medium">/10</span>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 border-2 border-slate-700 border-t-violet-400 rounded-full"
          />
        </div>
      }
    >
      <ReportPageContent />
    </Suspense>
  );
}

function ReportPageContent() {
  const startNewInterview = useNewInterview();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  const [report, setReport] = useState<InterviewReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'shared' | 'failed'>('idle');

  useEffect(() => {
    const loadReport = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.getReport(sessionId);
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [sessionId]);

  const buildReportText = useCallback((r: InterviewReportResponse): string => {
    const lines = [
      'InterviewIQ - Interview Report',
      '==============================',
      '',
      `Role: ${r.role}`,
      `Overall Score: ${Math.round(r.average_score)}/10`,
      `Recommendation: ${r.recommendation}`,
      `API Calls Used: ${r.api_calls_used}`,
      '',
      'Key Strengths:',
      ...r.strengths.map((s) => `- ${s}`),
      '',
      'Areas for Improvement:',
      ...r.weaknesses.map((w) => `- ${w}`),
      '',
      `View online: ${window.location.href}`,
    ];
    return lines.join('\n');
  }, []);

  const handleDownloadReport = useCallback(() => {
    if (!report) return;
    const text = buildReportText(report);
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interviewiq-report-${report.session_id.slice(0, 8)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [report, buildReportText]);

  const handleShareReport = useCallback(async () => {
    if (!report) return;
    const text = buildReportText(report);
    const shareData = { title: 'InterviewIQ Report', text };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareState('shared');
      } else {
        await navigator.clipboard.writeText(text);
        setShareState('copied');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setShareState('idle');
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        setShareState('copied');
      } catch {
        setShareState('failed');
      }
    } finally {
      setTimeout(() => setShareState('idle'), 3000);
    }
  }, [report, buildReportText]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-2 border-slate-700 border-t-violet-400 rounded-full"
        />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card max-w-md w-full text-center p-8"
        >
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-400/25 w-fit mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Unable to Load Report</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link href="/" className="btn btn-primary btn-md">
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  const overallScore = Math.round(report.average_score);

  const verdict =
    overallScore >= 8
      ? 'Excellent performance!'
      : overallScore >= 6
        ? 'Good effort! Keep practicing.'
        : overallScore >= 4
          ? 'Room for improvement.'
          : 'More practice needed.';

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="mx-auto mb-6"
          >
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/25 w-fit mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Interview Complete!</h1>
          <p className="text-slate-400">Here&apos;s your performance breakdown for {report.role}</p>
        </motion.div>

        <div className="space-y-6">
          {/* Score + Recommendation */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card p-8"
          >
            <div className="grid sm:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col items-center">
                <p className="text-sm font-semibold tracking-wider text-slate-500 mb-4">OVERALL SCORE</p>
                <ScoreRing score={overallScore} />
                <p className="text-slate-400 text-sm mt-4">{verdict}</p>
              </div>

              <div className="space-y-4">
                <div className={cn('p-4 rounded-xl border', getRecommendationColor(report.recommendation))}>
                  <p className="text-xs font-semibold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> RECOMMENDATION
                  </p>
                  <p className="text-white font-medium text-sm leading-relaxed">{report.recommendation}</p>
                </div>

                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <p className="text-xs font-semibold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" /> SESSION
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">API calls used</span>
                    <span className="text-white font-semibold">{report.api_calls_used}/3</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Strengths and Weaknesses */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-violet-400" /> Performance Breakdown
            </h2>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Strengths */}
              <div className="card p-6 border-emerald-400/15">
                <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Key Strengths
                </h3>
                <ul className="space-y-3">
                  {report.strengths.length === 0 ? (
                    <li className="text-sm text-slate-500">No strengths recorded.</li>
                  ) : (
                    report.strengths.map((strength: string, idx: number) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.08 }}
                        className="flex items-start gap-3 text-slate-300"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </motion.li>
                    ))
                  )}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="card p-6 border-amber-400/15">
                <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {report.weaknesses.length === 0 ? (
                    <li className="text-sm text-slate-500">No weaknesses recorded.</li>
                  ) : (
                    report.weaknesses.map((weakness: string, idx: number) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.08 }}
                        className="flex items-start gap-3 text-slate-300"
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                        <span className="text-sm">{weakness}</span>
                      </motion.li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
          >
            <button onClick={handleDownloadReport} className="btn btn-secondary btn-md">
              <Download className="w-4 h-4" /> Download Report
            </button>
            <button onClick={handleShareReport} className="btn btn-secondary btn-md">
              {shareState === 'copied' ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              {shareState === 'copied'
                ? 'Copied to Clipboard'
                : shareState === 'failed'
                  ? 'Copy Failed'
                  : 'Share Report'}
            </button>
            <Link href="/history" className="btn btn-secondary btn-md">
              View History
            </Link>
            <button onClick={startNewInterview} className="btn btn-primary btn-md">
              <Home className="w-4 h-4" /> New Interview
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}