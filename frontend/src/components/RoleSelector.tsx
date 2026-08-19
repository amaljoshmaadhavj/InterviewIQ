'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Palette, Server, Layers, BarChart3, Rocket, BrainCircuit, ServerCog, Compass, Check, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';

const ROLES = [
  { title: 'Frontend Engineer', icon: Palette, gradient: 'from-violet-500 to-indigo-500' },
  { title: 'Backend Engineer', icon: Server, gradient: 'from-sky-500 to-cyan-500' },
  { title: 'Full Stack Developer', icon: Layers, gradient: 'from-indigo-500 to-violet-500' },
  { title: 'Data Scientist', icon: BarChart3, gradient: 'from-orange-500 to-amber-500' },
  { title: 'DevOps Engineer', icon: Rocket, gradient: 'from-emerald-500 to-teal-500' },
  { title: 'AI/ML Engineer', icon: BrainCircuit, gradient: 'from-fuchsia-500 to-purple-500' },
  { title: 'Senior Backend Engineer', icon: ServerCog, gradient: 'from-amber-500 to-orange-500' },
  { title: 'Product Manager', icon: Compass, gradient: 'from-rose-500 to-pink-500' },
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

      // Store session data
      setSessionId(response.session_id);
      setSelectedRole(selectedRole);
      setCurrentQuestion(response.first_question);

      onRoleSelected?.(selectedRole);

      // Redirect to interview
      setTimeout(() => {
        setLoading(false);
        router.push('/interview');
      }, 500);
    } catch (error) {
      setIsStarting(false);
      setLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start interview';
      setError(errorMessage);
    }
  }, [selectedRole, state.resumeData, setSelectedRole, setCurrentQuestion, setSessionId, setLoading, setError, onRoleSelected, router]);

  return (
    <div className="pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <span className="chip bg-violet-500/10 text-violet-300 border border-violet-400/25 mb-5">
            <BrainCircuit className="w-3.5 h-3.5" /> Step 2 of 2
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
            Select your target <span className="gradient-text">role</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Choose the position you&apos;re interviewing for — we&apos;ll tailor questions to match.
          </p>
        </motion.div>

        {/* Role Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {ROLES.map((role, index) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.title;
            return (
              <motion.button
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.45 }}
                onClick={() => setSelected(role.title)}
                aria-pressed={isSelected}
                className={cn(
                  'focus-ring relative overflow-hidden rounded-xl border-2 transition-all duration-300 text-left group',
                  isSelected
                    ? 'border-violet-400 bg-violet-500/10 shadow-lg shadow-violet-500/15'
                    : 'border-slate-700/70 bg-slate-900/50 hover:border-violet-400/40 hover:bg-slate-900/80 hover:-translate-y-0.5'
                )}
              >
                {/* Gradient wash */}
                <div
                  className={cn(
                    'absolute inset-0 rounded-xl bg-gradient-to-br transition-opacity duration-300 pointer-events-none',
                    role.gradient,
                    isSelected ? 'opacity-10' : 'opacity-0 group-hover:opacity-[0.05]'
                  )}
                />

                <div className="relative z-10 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        'p-2.5 rounded-xl bg-gradient-to-br border transition-transform duration-300 group-hover:scale-105',
                        role.gradient,
                        'border-white/10'
                      )}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="p-1.5 rounded-full bg-violet-400 text-slate-950"
                      >
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </motion.div>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-sm leading-snug">{role.title}</h3>
                  {isSelected && <p className="text-xs text-violet-300 mt-1 font-medium">Selected</p>}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Resume context bar */}
        {state.resumeData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 p-4 bg-sky-500/5 border border-sky-400/20 rounded-xl flex items-center gap-3"
          >
            <Info className="w-4 h-4 text-sky-300 flex-shrink-0" />
            <p className="text-sky-200 text-sm">
              Interviewing as{' '}
              <span className="font-semibold capitalize text-sky-100">{state.resumeData.experience_level}</span>{' '}
              level ·{' '}
              <span className="font-semibold text-sky-100">{state.resumeData.skills.length}</span> skills
              detected
            </p>
          </motion.div>
        )}

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <button
            onClick={handleStartInterview}
            disabled={!selectedRole || isStarting}
            className="btn btn-primary btn-lg focus-ring"
          >
            <span>{isStarting ? 'Starting…' : 'Start Interview'}</span>
            {isStarting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 max-w-2xl mx-auto p-6 card"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-violet-400" /> How it works
          </h3>
          <ul className="text-slate-400 text-sm space-y-2.5">
            <li className="flex gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              We&apos;ll ask <span className="text-violet-300">5 adaptive questions</span> based on your role and resume
            </li>
            <li className="flex gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              Answer conversationally — there are no &quot;trick&quot; questions
            </li>
            <li className="flex gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              Get <span className="text-violet-300">detailed feedback</span> on each answer (0–10 score)
            </li>
            <li className="flex gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              Interview takes ~5–10 minutes after the initial setup
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}