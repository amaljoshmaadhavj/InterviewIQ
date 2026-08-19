'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BrainCircuit,
  Zap,
  BarChart3,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Timer,
  ShieldCheck,
  CheckCircle2,
  FileUp,
} from 'lucide-react';
import { UploadZone } from '@/components/UploadZone';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const features = [
  {
    icon: BrainCircuit,
    title: 'Adaptive AI Interviewer',
    description:
      'A senior technical interviewer that reads your resume and asks role-specific questions that get harder as you improve.',
    accent: 'from-blue-50 to-cyan-50 border-blue-200 text-blue-600',
    iconBg: 'from-blue-500 to-cyan-400',
  },
  {
    icon: Zap,
    title: 'Real-Time Feedback',
    description:
      'Instant scoring on clarity, depth, and relevance after every answer — so you know exactly what to fix.',
    accent: 'from-cyan-50 to-sky-50 border-cyan-200 text-cyan-600',
    iconBg: 'from-cyan-400 to-sky-400',
  },
  {
    icon: BarChart3,
    title: 'Detailed Reports',
    description:
      'Comprehensive performance breakdowns, strengths, weaknesses, and actionable recommendations after each session.',
    accent: 'from-emerald-50 to-teal-50 border-emerald-200 text-emerald-600',
    iconBg: 'from-emerald-400 to-teal-400',
  },
  {
    icon: Timer,
    title: 'Fast & Focused',
    description:
      'A complete mock interview in 5–10 minutes. No long setup, no fluff — just targeted practice.',
    accent: 'from-amber-50 to-orange-50 border-amber-200 text-amber-500',
    iconBg: 'from-amber-400 to-orange-400',
  },
];

const stats = [
  { value: '5', label: 'Adaptive questions per interview' },
  { value: '0–10', label: 'Instant score on every answer' },
  { value: '10+', label: 'Engineering roles to practice' },
  { value: '3', label: 'Fast AI calls per full session' },
];

function InterviewPreviewCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
      className="relative mx-auto max-w-md w-full"
    >
      {/* Glow */}
      <div className="absolute -inset-10 bg-gradient-to-tr from-blue-400/25 via-transparent to-cyan-300/25 rounded-[2rem] blur-3xl" />

      <div className="relative card overflow-hidden shadow-card-lg">
        {/* Card header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-blue-50/40">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800">Senior AI Interviewer</p>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online · ready to challenge you
            </p>
          </div>
          <span className="chip bg-blue-100 text-blue-700 border border-blue-200">Q 1/5</span>
        </div>

        {/* Messages */}
        <div className="p-5 space-y-4">
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 border border-slate-200/80 px-4 py-3">
              <p className="text-sm text-slate-700 leading-relaxed">
                Based on your experience with distributed systems, walk me through how you would design a
                rate-limiter for a high-traffic API.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-blue-500 to-cyan-500 px-4 py-3 shadow-float">
              <p className="text-sm text-white leading-relaxed">
                I&apos;d start with a token bucket algorithm, then consider Redis-backed counters for
                distributed consistency…
              </p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-emerald-50 border border-emerald-200 px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-700">FEEDBACK</span>
                <span className="text-sm font-extrabold text-emerald-600">8.5/10</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strong architectural thinking. Consider edge cases like clock skew and cleanup of idle tokens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const { state } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (state.resumeData) {
      router.push('/role-selection');
    }
  }, [state.resumeData, router]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* ===== Hero ===== */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Decorative floating blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl animate-blob-drift pointer-events-none" />
        <div className="absolute top-40 right-16 w-64 h-64 bg-cyan-300/20 rounded-full blur-3xl animate-blob-drift pointer-events-none" style={{ animationDelay: '6s' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-56 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <span className="chip bg-blue-100 text-blue-700 border border-blue-200 mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Interview Practice
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mb-6 text-slate-900"
            >
              Master <span className="gradient-text">technical interviews</span> with an AI that knows your resume
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg text-slate-500 mb-9 max-w-xl leading-relaxed">
              Upload your resume, pick a role, and practice with a senior interviewer who asks adaptive questions
              and scores every answer on clarity, depth, and relevance.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => scrollTo('upload-section')} className="btn btn-primary btn-lg focus-ring">
                Start Practicing <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => scrollTo('features-section')} className="btn btn-secondary btn-lg focus-ring">
                Learn More
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Free, no card required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" /> Resume-aware questions
              </span>
            </motion.div>
          </motion.div>

          <InterviewPreviewCard />
        </div>
      </section>

      {/* ===== Stats band ===== */}
      <section className="px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            className="card grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden shadow-card"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="p-6 text-center">
                <p className="text-3xl font-extrabold tracking-tight gradient-text">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features-section" className="px-4 py-20 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-slate-900">
              Everything you need to <span className="gradient-text">walk in prepared</span>
            </h2>
            <p className="text-slate-500 text-lg">
              A focused, realistic practice loop that turns interview anxiety into confidence.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: idx * 0.06 }}
                  className="card-hover group p-6"
                >
                  <div className={`p-3 rounded-2xl bg-gradient-to-br border w-fit mb-5 ${feature.accent} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Upload / CTA ===== */}
      <section id="upload-section" className="px-4 py-20 scroll-mt-20">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 border border-blue-200 mb-6">
              <FileUp className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-slate-900">
              Ready to practice?
            </h2>
            <p className="text-slate-500 text-lg">
              Upload your resume and we&apos;ll tailor interview questions to your real experience.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
          >
            <UploadZone />
          </motion.div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-slate-200/80 py-10 px-4 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <p className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-slate-600">
              Interview<span className="gradient-text">IQ</span>
            </span>
          </p>
          <p>&copy; {new Date().getFullYear()} InterviewIQ. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> Built for serious candidates
          </p>
        </div>
      </footer>
    </div>
  );
}