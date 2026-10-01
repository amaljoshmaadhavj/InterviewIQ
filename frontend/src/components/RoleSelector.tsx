'use client';

import React, { useState, useCallback } from 'react';
import {
  ArrowRight,
  Loader2,
  Palette,
  Server,
  Layers,
  BarChart3,
  Rocket,
  BrainCircuit,
  ServerCog,
  Compass,
  Check,
  Info,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';

const ROLES = [
  {
    title: 'Frontend Engineer',
    icon: Palette,
    topics: 'React, State Management, DOM, Web Vitals & CSS Architecture',
  },
  {
    title: 'Backend Engineer',
    icon: Server,
    topics: 'API Design, Database Architecture, Concurrency & Caching',
  },
  {
    title: 'Full Stack Developer',
    icon: Layers,
    topics: 'End-to-End Architecture, REST/GraphQL, Auth & Data Models',
  },
  {
    title: 'Data Scientist',
    icon: BarChart3,
    topics: 'Statistics, Modeling, Data Wrangling & Feature Engineering',
  },
  {
    title: 'DevOps Engineer',
    icon: Rocket,
    topics: 'CI/CD Pipelines, Kubernetes, Docker, Cloud & Reliability',
  },
  {
    title: 'AI/ML Engineer',
    icon: BrainCircuit,
    topics: 'Model Architectures, Training Pipelines, LLMs & ML Systems',
  },
  {
    title: 'Senior Backend Engineer',
    icon: ServerCog,
    topics: 'System Scalability, Distributed Transactions, Event-Driven Arch',
  },
  {
    title: 'Product Manager',
    icon: Compass,
    topics: 'Product Discovery, Prioritization, Metrics & User Empathy',
  },
];

interface RoleSelectorProps {
  onRoleSelected?: (role: string) => void;
}

export function RoleSelector({ onRoleSelected }: RoleSelectorProps) {
  const router = useRouter();
  const { state, setSelectedRole, setCurrentQuestion, setSessionId, setLoading, setError } =
    useApp();

  const [selectedRole, setSelected] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartInterview = useCallback(async () => {
    if (!selectedRole || !state.resumeData) {
      setError('Please select a role first');
      return;
    }

    setIsStarting(true);
    setLoading(true);

    try {
      const response = await api.startInterview({
        role: selectedRole,
        resume_data: state.resumeData,
      });

      setSessionId(response.session_id);
      setSelectedRole(selectedRole);
      setCurrentQuestion(response.first_question);

      onRoleSelected?.(selectedRole);

      setTimeout(() => {
        setLoading(false);
        router.push('/interview');
      }, 400);
    } catch (error) {
      setIsStarting(false);
      setLoading(false);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to start interview. Please ensure backend is running.';
      setError(errorMessage);
    }
  }, [
    selectedRole,
    state.resumeData,
    setSelectedRole,
    setCurrentQuestion,
    setSessionId,
    setLoading,
    setError,
    onRoleSelected,
    router,
  ]);

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="chip bg-blue-50 text-blue-700 border border-blue-200/90 font-medium">
          Step 2 of 2 · Target Calibration
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Select Your Target Role
        </h1>
        <p className="text-sm text-slate-600">
          Pick the position you are preparing for. Questions will be tailored to this track and your resume.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.title;
          return (
            <button
              key={role.title}
              type="button"
              onClick={() => setSelected(role.title)}
              aria-pressed={isSelected}
              className={cn(
                'relative text-left p-4 rounded-xl border transition-all duration-150 flex flex-col justify-between group',
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-sm'
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-600 border border-blue-200/60 group-hover:bg-blue-100/70'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center border transition-all',
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 bg-white group-hover:border-slate-400'
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{role.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{role.topics}</p>
              </div>

              {isSelected && (
                <div className="mt-3 pt-2 border-t border-blue-200/60 flex items-center gap-1 text-[11px] font-semibold text-blue-700">
                  <span>Selected for interview</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Start Action Bar */}
      <div className="card p-5 sm:p-6 bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-900">
            {selectedRole ? (
              <>Ready to start: <span className="text-blue-600">{selectedRole}</span></>
            ) : (
              'Please select a role above to proceed'
            )}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            5 questions · ~10 minutes · Real-time scoring and feedback
          </p>
        </div>

        <button
          onClick={handleStartInterview}
          disabled={!selectedRole || isStarting}
          className="btn btn-primary btn-lg w-full sm:w-auto"
        >
          {isStarting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Starting Session...</span>
            </>
          ) : (
            <>
              <span>Begin Technical Interview</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Interview format info card */}
      <div className="card p-5 bg-slate-50 border border-slate-200/80 rounded-xl">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-600" />
          Technical Screen Format
        </h4>
        <div className="grid sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
              1
            </span>
            <p>5 adaptive questions calibrated to your role and resume.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
              2
            </span>
            <p>Answer naturally. Scores are evaluated on clarity, depth, and relevance.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
              3
            </span>
            <p>Receive a full downloadable report with actionable growth areas at the end.</p>
          </div>
        </div>
      </div>
    </div>
  );
}