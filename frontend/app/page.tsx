'use client';

import React, { useEffect } from 'react';
import {
  BrainCircuit,
  Zap,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileUp,
  Layers,
  Check,
} from 'lucide-react';
import { UploadZone } from '@/components/UploadZone';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

const features = [
  {
    icon: BrainCircuit,
    title: 'Resume-Aware Questions',
    description:
      'Our AI analyzes your projects, technical skills, and experience level to ask realistic questions tailored to what hiring managers look for.',
    tag: 'Personalized',
  },
  {
    icon: Zap,
    title: 'Instant Answer Scoring',
    description:
      'Get scored on clarity, technical depth, and answer relevance after every response, so you know exactly where you stand and what to improve.',
    tag: 'Real-time',
  },
  {
    icon: Layers,
    title: 'Multiple Engineering Roles',
    description:
      'Practice across Frontend, Backend, Full Stack, DevOps, Data Science, and AI/ML tracks with calibrated role difficulty.',
    tag: 'Comprehensive',
  },
  {
    icon: BarChart3,
    title: 'Comprehensive Final Report',
    description:
      'Finish your 5-question interview and receive a full performance breakdown with identified strengths, weaknesses, and next steps.',
    tag: 'Actionable',
  },
];

const stats = [
  { value: '5', label: 'Adaptive questions', sub: 'Calibrated per mock interview' },
  { value: '0–10', label: 'Instant scoring', sub: 'Evaluated on clarity & depth' },
  { value: '8+', label: 'Technical roles', sub: 'From Frontend to AI/ML tracks' },
  { value: '10 min', label: 'Fast & focused', sub: 'Practical practice loop' },
];

function RealisticInterviewPreview() {
  return (
    <div className="relative mx-auto max-w-lg w-full">
      {/* Product preview window */}
      <div className="card overflow-hidden border border-slate-200/90 shadow-card-lg bg-white">
        {/* Window Chrome / Titlebar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="ml-2 text-xs font-medium text-slate-600 hidden sm:inline">
              Backend Engineer · Technical Screen
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Round
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
              Q 1/5
            </span>
          </div>
        </div>

        {/* Mock Conversation */}
        <div className="p-4 sm:p-5 space-y-3.5 bg-slate-50/40 text-left">
          {/* Interviewer Question */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              AI
            </div>
            <div className="max-w-[90%] rounded-xl rounded-tl-sm bg-white border border-slate-200 p-3.5 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-900">Interviewer</span>
                <span className="text-[11px] text-slate-400">Just now</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Based on the distributed caching project on your resume, how did you handle cache invalidation
                across replica nodes during sudden traffic spikes?
              </p>
            </div>
          </div>

          {/* Candidate Response */}
          <div className="flex items-start justify-end gap-2.5">
            <div className="max-w-[90%] rounded-xl rounded-tr-sm bg-blue-600 text-white p-3.5 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-blue-100">Your Response</span>
                <span className="text-[11px] text-blue-200">Answered</span>
              </div>
              <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
                We implemented Redis Pub/Sub for cross-node invalidation messages paired with TTL leases.
                During write bursts, we queued invalidation updates to prevent thundering herds on PostgreSQL.
              </p>
            </div>
          </div>

          {/* Real-time Feedback Card */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-800 tracking-wide uppercase">
                  Real-Time Evaluation
                </span>
              </div>
              <div className="inline-flex items-baseline gap-1 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                <span className="text-xs text-slate-500 font-medium">Score:</span>
                <span className="text-sm font-bold text-emerald-600">8.5</span>
                <span className="text-[10px] text-slate-400 font-medium">/10</span>
              </div>
            </div>

            {/* Rubric Meters */}
            <div className="grid grid-cols-3 gap-2 mb-2 text-center text-[11px]">
              <div className="bg-white/90 rounded border border-emerald-100 p-1.5">
                <span className="text-slate-500 block">Clarity</span>
                <span className="font-semibold text-slate-800">4.5/5</span>
              </div>
              <div className="bg-white/90 rounded border border-emerald-100 p-1.5">
                <span className="text-slate-500 block">Depth</span>
                <span className="font-semibold text-slate-800">4.2/5</span>
              </div>
              <div className="bg-white/90 rounded border border-emerald-100 p-1.5">
                <span className="text-slate-500 block">Relevance</span>
                <span className="font-semibold text-slate-800">4.8/5</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug">
              <span className="font-semibold text-slate-800">Feedback:</span> Clear architectural thinking on
              pub/sub and queue buffering. Consider noting eventual consistency trade-offs.
            </p>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Target: Senior Backend Engineer</span>
          <span>Adaptive difficulty: Active</span>
        </div>
      </div>
    </div>
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
      <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div>
              <span className="chip bg-blue-50 text-blue-700 border border-blue-200/90 font-medium mb-3">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Student & Candidate Practice Platform
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              Master technical interviews with an AI that{' '}
              <span className="text-blue-600">knows your resume</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Upload your resume, select a technical role, and practice with a senior interviewer that asks
              role-specific questions and scores every answer on clarity, depth, and relevance.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              <button
                onClick={() => scrollTo('upload-section')}
                className="btn btn-primary btn-lg"
              >
                <span>Start Practice</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollTo('features-section')}
                className="btn btn-secondary btn-lg"
              >
                How It Works
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 pt-4 text-xs font-medium text-slate-500 border-t border-slate-200/80">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" /> Free for students
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-blue-600" /> Reads real resume projects
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-sky-600" /> 0–10 instant score rubric
              </span>
            </div>
          </div>

          {/* Right Hero Product Preview */}
          <div className="lg:col-span-6">
            <RealisticInterviewPreview />
          </div>
        </div>
      </section>

      {/* ===== Stats Band ===== */}
      <section className="px-4 py-8 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{stat.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Features Section ===== */}
      <section id="features-section" className="px-4 py-20 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="chip bg-slate-100 text-slate-700 border border-slate-200 font-medium">
              Structured Preparation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Everything you need to interview with confidence
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Designed specifically to help engineering students and job candidates practice realistic technical
              rounds without expensive tutoring or stressful trial-and-error.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="card p-5 sm:p-6 hover:border-slate-300 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {feature.tag}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Practice Process Steps ===== */}
      <section className="px-4 py-16 bg-slate-50/70 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-2">
              Three simple steps to practice
            </h2>
            <p className="text-sm text-slate-500">Fast, focused, and free — complete a mock round in 10 minutes</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="card p-6 bg-white">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Upload Your Resume</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide your resume in PDF format. We parse your real skills, frameworks, and projects.
              </p>
            </div>

            <div className="card p-6 bg-white">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Select Target Role</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose Frontend, Backend, Full Stack, or AI/ML to set calibrated question tracks.
              </p>
            </div>

            <div className="card p-6 bg-white">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Answer & Get Scored</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Respond to 5 adaptive questions and review immediate feedback and a full final performance report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Upload Section ===== */}
      <section id="upload-section" className="px-4 py-20 scroll-mt-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <FileUp className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Start Your Practice Session
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Upload your PDF resume to calibrate questions to your background and experience.
            </p>
          </div>

          <UploadZone />
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-slate-200 py-10 px-4 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white">
              <BrainCircuit className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800 text-sm">
              Interview<span className="text-blue-600">IQ</span>
            </span>
            <span className="text-slate-300">|</span>
            <span>Student Interview Preparation Platform</span>
          </div>
          <p>&copy; {new Date().getFullYear()} InterviewIQ. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Free & Open Practice</span>
          </div>
        </div>
      </footer>
    </div>
  );
}