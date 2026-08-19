'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Palette, Server, Layers, BarChart3, Rocket, BrainCircuit, ServerCog, Compass, Check, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';

const ROLES = [
  { title: 'Frontend Engineer', icon: Palette, gradient: 'from-blue-500 to-cyan-500' },
  { title: 'Backend Engineer', icon: Server, gradient: 'from-sky-500 to-blue-500' },
  { title: 'Full Stack Developer', icon: Layers, gradient: 'from-cyan-500 to-teal-500' },
  { title: 'Data Scientist', icon: BarChart3, gradient: 'from-violet-500 to-blue-500' },
  { title: 'DevOps Engineer', icon: Rocket, gradient: 'from-teal-400 to-cyan-500' },
  { title: 'AI/ML Engineer', icon: BrainCircuit, gradient: 'from-blue-500 to-indigo-500' },
  { title: 'Senior Backend Engineer', icon: ServerCog, gradient: 'from-sky-500 to-cyan-400' },
  { title: 'Product Manager', icon: Compass, gradient: 'from-indigo-400 to-blue-500' },
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
          <span className="chip bg-blue-100 text-blue-700 border border-blue-200 mb-5">
            <BrainCircuit className="w-3.5 h-3.5" /> Step 2 of 2
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
            Select your target <span className="gradient-text">role</span>
          </h1>
          <p className="text-slate-500 text-lg">
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
                  'focus-ring relative overflow-hidden rounded-2xl border-2 transition-all duration-300 text-left group',
                  isSelected
                    ? 'border-blue-400 bg-blue-50 shadow-card'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-soft hover:-translate-y-0.5'
                )}
              >
                <div
                  className={cn(
                    'absolute inset-0 rounded-2xl bg-gradient-to-br transition-opacity duration-300 pointer-events-none',
                    role.gradient,
                    isSelected ? 'opacity-10' : 'opacity-0 group-hover:opacity-[0.06]'
                  )}
                />

                <div className="relative z-10 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        'p-2.5 rounded-xl bg-gradient-to-br border transition-transform duration-300 group-hover:scale-105',
                        role.gradient,
                        'border-white/50 shadow-float'
                      )}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="p-1.5 rounded-full bg-blue-500 text-white shadow-float"
                      >
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </motion.div>
                    )}
                  </div>
                  <h3 className="text-slate-800 font-bold text-sm leading-snug">{role.title}</h3>
                  {isSelected && <p className="text-xs text-blue-600 mt-1 font-semibold">Selected</p>}
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
            className="mb-8 p-4 bg-cyan-50 border border-cyan-200 rounded-2xl flex items-center gap-3"
          >
            <Info className="w-4 h-4 text-cyan-600 flex-shrink-0" />
            <p className="text-cyan-700 text-sm">
              Interviewing as{' '}
              <span className="font-bold capitalize text-cyan-800">{state.resumeData.experience_level}</span>{' '}
              level ·{' '}
              <span className="font-bold text-cyan-800">{state.resumeData.skills.length}</span> skills
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
          <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" /> How it works
          </h3>
          <ul className="text-slate-600 text-sm space-y-2.5">
            <li className="flex gap-2.5">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              We&apos;ll ask <span className="text-blue-600 font-semibold">5 adaptive questions</span> based on your role and resume
            </li>
            <li className="flex gap-2.5">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              Answer conversationally — there are no &quot;trick&quot; questions
            </li>
            <li className="flex gap-2.5">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              Get <span className="text-blue-600 font-semibold">detailed feedback</span> on each answer (0–10 score)
            </li>
            <li className="flex gap-2.5">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              Interview takes ~5–10 minutes after the initial setup
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}