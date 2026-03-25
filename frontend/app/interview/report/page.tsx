'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Download, Home } from 'lucide-react';
import { api } from '@/services/api';
import { getScoreColor, getRecommendationColor } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import type { InterviewReportResponse } from '@/utils/types';

export default function ReportPage() {
  // const router = useRouter(); // Not needed for report display
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  const [report, setReport] = useState<InterviewReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-4 border-gray-700 border-t-cyan-500 rounded-full"
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
          className="max-w-md text-center"
        >
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Unable to Load Report</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/" className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 inline-block">
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

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

  const overallScore = Math.round(report.average_score);
  const maxScore = 50; // 5 questions × 10 points max

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
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
            transition={{ type: 'spring', stiffness: 200 }}
            className="mx-auto mb-6"
          >
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">Interview Complete!</h1>
          {/* <p className="text-gray-400">Report generated</p> */}
        </motion.div>

        {/* Score Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-8 text-center"
          >
            <p className="text-gray-400 text-sm mb-2">OVERALL SCORE</p>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className={cn('text-6xl font-bold mb-2', getScoreColor(overallScore))}>
                {overallScore}/{maxScore}
              </p>
            </motion.div>
            <p className="text-gray-400">
              {overallScore >= 80 && '🎉 Excellent performance!'}
              {overallScore >= 60 && overallScore < 80 && '👍 Good effort! Keep practicing.'}
              {overallScore >= 40 && overallScore < 60 && '💪 Room for improvement.'}
              {overallScore < 40 && '📈 More practice needed.'}
            </p>
          </motion.div>

          {/* Recommendation */}
          <motion.div
            variants={itemVariants}
            className={cn(
              'p-6 rounded-lg border',
              report.recommendation.includes('Excellent')
                ? 'bg-green-400/5 border-green-400/30'
                : report.recommendation.includes('Good')
                  ? 'bg-blue-400/5 border-blue-400/30'
                  : report.recommendation.includes('Needs')
                    ? 'bg-orange-400/5 border-orange-400/30'
                    : 'bg-red-400/5 border-red-400/30'
            )}
          >
            <p className={cn('text-sm font-medium mb-2', getRecommendationColor(report.recommendation))}>
              RECOMMENDATION
            </p>
            <p className="text-white">{report.recommendation}</p>
          </motion.div>

          {/* Strengths and Weaknesses */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-2xl font-bold">Performance Breakdown</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-4">✓ Key Strengths</h3>
                <ul className="space-y-3">
                  {report.strengths.map((strength: string, idx: number) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 text-gray-300"
                    >
                      <span className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-orange-500/5 border border-orange-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-400 mb-4">⚠ Areas for Improvement</h3>
                <ul className="space-y-3">
                  {report.weaknesses.map((weakness: string, idx: number) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 text-gray-300"
                    >
                      <span className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                      <span className="text-sm">{weakness}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          >
            <button className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2 border border-gray-700">
              <Download className="w-5 h-5" />
              Download Report
            </button>
            <Link
              href="/history"
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 text-center border border-gray-700"
            >
              View History
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              New Interview
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
