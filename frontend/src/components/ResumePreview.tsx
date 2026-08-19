/**
 * Resume Preview Component
 * Shows parsed resume data (skills, domains, projects, summary) before
 * starting an interview, with an option to change the resume.
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, RefreshCw, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';
import type { ResumeData } from '@/utils/types';

interface ResumePreviewProps {
  sectionsFound?: string[];
  fileName?: string;
}

export function ResumePreview({ sectionsFound, fileName }: ResumePreviewProps) {
  const router = useRouter();
  const { state, resetInterview } = useApp();
  const resume = state.resumeData as ResumeData | null;

  if (!resume) return null;

  const handleChangeResume = () => {
    resetInterview();
    router.push('/');
  };

  const chips = (items: string[] | undefined, empty: string) =>
    items && items.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <span
            key={idx}
            className="px-3 py-1 rounded-full text-xs bg-cyan-400/10 border border-cyan-400/30 text-cyan-300"
          >
            {item}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-500">{empty}</p>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 bg-gray-900/60 border border-gray-700 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-700 bg-gray-800/40">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-cyan-400/10 border border-cyan-400/30 flex-shrink-0">
            <FileText className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold truncate">{fileName || 'Resume'}</p>
            <p className="text-xs text-gray-400">
              <span className="capitalize">{resume.experience_level}</span> level candidate
            </p>
          </div>
        </div>
        <button
          onClick={handleChangeResume}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-300 hover:text-white bg-gray-700/50 hover:bg-gray-600/50 transition-all flex-shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          Change Resume
        </button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        {resume.summary && (
          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">SUMMARY</p>
            <p className="text-sm text-gray-300 leading-relaxed">{resume.summary}</p>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-gray-400 mb-2">SKILLS</p>
          {chips(resume.skills, 'No skills detected')}
        </div>

        {resume.domains && resume.domains.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">DOMAINS</p>
            {chips(resume.domains, '')}
          </div>
        )}

        {resume.projects && resume.projects.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">PROJECTS</p>
            {chips(resume.projects, 'No projects detected')}
          </div>
        )}

        {sectionsFound && sectionsFound.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">SECTIONS FOUND</p>
            <div className="flex flex-wrap gap-2">
              {sectionsFound.map((section, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs bg-gray-700/50 border border-gray-600 text-gray-300'
                  )}
                >
                  {section}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-gray-800/30 border-t border-gray-700 flex items-center gap-2 text-xs text-gray-500">
        <X className="w-3.5 h-3.5" />
        This is what the AI extracted. If anything looks wrong, click "Change Resume".
      </div>
    </motion.div>
  );
}
