/**
 * Role Selection Component
 * Allows user to select target role before interview starts
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';

const ROLES = [
  { title: 'Frontend Engineer', icon: '🎨', color: 'from-blue-500 to-cyan-500' },
  { title: 'Backend Engineer', icon: '⚙️', color: 'from-purple-500 to-pink-500' },
  { title: 'Full Stack Developer', icon: '🔗', color: 'from-cyan-500 to-blue-500' },
  { title: 'Data Scientist', icon: '📊', color: 'from-orange-500 to-red-500' },
  { title: 'DevOps Engineer', icon: '🚀', color: 'from-green-500 to-emerald-500' },
  { title: 'AI/ML Engineer', icon: '🤖', color: 'from-indigo-500 to-purple-500' },
  { title: 'Senior Backend Engineer', icon: '👨‍💼', color: 'from-yellow-500 to-orange-500' },
  { title: 'Product Manager', icon: '📈', color: 'from-pink-500 to-rose-500' },
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
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Select Your Target <span className="text-cyan-400">Role</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Choose the position you're interviewing for. We'll tailor questions to match.
          </p>
        </motion.div>

        {/* Role Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {ROLES.map((role, index) => (
            <motion.button
              key={role.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelected(role.title)}
              className="relative overflow-hidden group"
            >
              {/* Card Background */}
              <div
                className={cn(
                  'relative p-6 rounded-xl border-2 transition-all duration-300',
                  'hover:scale-105 cursor-pointer',
                  selectedRole === role.title
                    ? 'border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/20'
                    : 'border-gray-700 bg-gray-900/40 hover:border-cyan-400/50 hover:bg-gray-800/60'
                )}
              >
                {/* Gradient Overlay (on hover/select) */}
                {selectedRole === role.title && (
                  <motion.div
                    layoutId="selectedCard"
                    className={cn(
                      'absolute inset-0 rounded-xl opacity-10',
                      `bg-gradient-to-br ${role.color}`
                    )}
                  />
                )}

                <div className="relative z-10 flex items-start justify-between mb-3">
                  <span className="text-3xl">{role.icon}</span>
                  {selectedRole === role.title && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-cyan-400 border-2 border-cyan-300"
                    />
                  )}
                </div>

                <h3 className="text-left text-white font-semibold text-sm">{role.title}</h3>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Experience Level Info */}
        {state.resumeData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 p-4 bg-blue-400/5 border border-blue-400/30 rounded-lg text-center"
          >
            <p className="text-blue-400">
              Interviewing as <span className="font-semibold capitalize">{state.resumeData.experience_level}</span> Level (
              {state.resumeData.skills.length} skills detected)
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
            className={cn(
              'px-8 py-3 rounded-lg font-semibold transition-all duration-300',
              'flex items-center gap-2',
              'group relative overflow-hidden',
              selectedRole && !isStarting
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50 cursor-pointer'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            )}
          >
            <span>
              {isStarting ? 'Starting...' : 'Start Interview'}
            </span>
            {isStarting ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                <Loader className="w-4 h-4" />
              </motion.div>
            ) : (
              <motion.div
                animate={selectedRole ? { x: [0, 5, 0] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            )}
          </button>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 max-w-2xl mx-auto p-6 bg-gray-800/30 border border-gray-700 rounded-lg"
        >
          <h3 className="text-white font-semibold mb-2">💡 How it works</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>✓ We'll ask <span className="text-cyan-400">5 adaptive questions</span> based on your role and resume</li>
            <li>✓ Answer conversationally - there are no "trick" questions</li>
            <li>✓ Get <span className="text-cyan-400">detailed feedback</span> on each answer (0-10 score)</li>
            <li>✓ Interview takes ~5-10 minutes (after initial setup)</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
