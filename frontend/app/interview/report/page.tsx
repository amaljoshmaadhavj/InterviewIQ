'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { api } from '@/services/api';
import { useNewInterview } from '@/hooks/useNewInterview';
import { getScoreColor } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import type { InterviewReportResponse } from '@/utils/types';

function ScoreRing({ score }: { score: number }) {
  const pct = Math.min(score / 10, 1);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  const color =
    score >= 8
      ? 'stroke-emerald-600'
      : score >= 6
        ? 'stroke-blue-600'
        : score >= 4
          ? 'stroke-amber-600'
          : 'stroke-rose-600';

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" strokeWidth="8" className="stroke-slate-100" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={color}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference * (1 - pct),
            transition: 'stroke-dashoffset 1s ease-out',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-3xl font-extrabold tracking-tight', getScoreColor(score))}>
          {score}
        </span>
        <span className="text-[11px] text-slate-400 font-semibold">OUT OF 10</span>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
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
      'InterviewIQ - Candidate Technical Evaluation',
      '==========================================',
      '',
      `Role: ${r.role}`,
      `Overall Score: ${Math.round(r.average_score)}/10`,
      `Recommendation: ${r.recommendation}`,
      `Completed Questions: 5`,
      '',
      'Key Strengths:',
      ...r.strengths.map((s) => `- ${s}`),
      '',
      'Areas for Improvement:',
      ...r.weaknesses.map((w) => `- ${w}`),
      '',
      `View session online: ${window.location.href}`,
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
    const shareData = { title: 'InterviewIQ Technical Report', text };

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
      setTimeout(() => setShareState('idle'), 2500);
    }
  }, [report, buildReportText]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Generating performance report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center p-8 bg-white border border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 mb-1">Unable to Load Report</h1>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">{error || 'Session not found'}</p>
          <Link href="/" className="btn btn-primary btn-md">
            Return to Practice
          </Link>
        </div>
      </div>
    );
  }

  const overallScore = Math.round(report.average_score);

  const verdict =
    overallScore >= 8
      ? 'Strong Technical Readiness'
      : overallScore >= 6
        ? 'Solid Foundation · Minor Gaps'
        : overallScore >= 4
          ? 'Needs Additional Preparation'
          : 'Early Practice Stage';

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 bg-slate-50/50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Document Header */}
        <div className="card p-5 sm:p-6 bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="chip bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                Completed Technical Screen
              </span>
              <span className="text-xs text-slate-500">
                Session ID: {report.session_id.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {report.role}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              5 questions evaluated across clarity, technical depth, and answer relevance
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button onClick={handleDownloadReport} className="btn btn-secondary btn-sm">
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download (.md)</span>
            </button>
            <button onClick={handleShareReport} className="btn btn-secondary btn-sm">
              {shareState === 'copied' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Score Card Hero */}
        <div className="card p-6 sm:p-8 bg-white border border-slate-200/90 shadow-sm">
          <div className="grid sm:grid-cols-12 gap-8 items-center">
            {/* Left: Score Ring */}
            <div className="sm:col-span-5 text-center sm:border-r sm:border-slate-200/80 sm:pr-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Overall Assessment
              </h3>
              <ScoreRing score={overallScore} />
              <div className="mt-4">
                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200">
                  {verdict}
                </span>
              </div>
            </div>

            {/* Right: Recommendation & Metrics */}
            <div className="sm:col-span-7 space-y-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Hiring Recommendation
                </h4>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  {report.recommendation}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <span className="text-slate-500 block mb-0.5">Questions Evaluated</span>
                  <span className="text-base font-bold text-slate-900">5 of 5</span>
                </div>
                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <span className="text-slate-500 block mb-0.5">Session Benchmark</span>
                  <span className="text-base font-bold text-slate-900">
                    {overallScore >= 7 ? 'Top Tier' : 'Mid Benchmark'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown: Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Strengths */}
          <div className="card p-5 sm:p-6 bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Demonstrated Strengths</h3>
            </div>
            <ul className="space-y-2.5">
              {report.strengths.length === 0 ? (
                <li className="text-xs text-slate-400">No specific strengths recorded.</li>
              ) : (
                report.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Growth Areas */}
          <div className="card p-5 sm:p-6 bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Targeted Areas for Growth</h3>
            </div>
            <ul className="space-y-2.5">
              {report.weaknesses.length === 0 ? (
                <li className="text-xs text-slate-400">No specific weaknesses recorded.</li>
              ) : (
                report.weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span>{weak}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <Link href="/history" className="text-xs font-semibold text-slate-600 hover:text-blue-600">
            ← View All Past Interviews
          </Link>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={startNewInterview}
              className="btn btn-primary btn-md w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practice Another Role</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}