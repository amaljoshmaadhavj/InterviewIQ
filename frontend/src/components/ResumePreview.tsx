/**
 * Resume Preview Component
 * Shows parsed resume data (skills, domains, projects, summary) before
 * starting an interview, with an option to change the resume.
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, RefreshCw, Info } from 'lucide-react';
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
            className="chip bg-violet-500/10 text-violet-200 border border-violet-400/25"
          >
            {item}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-sm text-slate-500">{empty}</p>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-8 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-400/30 flex-shrink-0">
            <FileText className="w-5 h-5 text-violet-300" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold truncate">{fileName || 'Resume'}</p>
            <p className="text-xs text-slate-400">
              <span className="capitalize text-violet-300">{resume.experience_level}</span> level candidate
            </p>
          </div>
        </div>
        <button
          onClick={handleChangeResume}
          className="btn btn-secondary btn-sm focus-ring flex-shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Change Resume
        </button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        {resume.summary && (
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-500 mb-2">SUMMARY</p>
            <p className="text-sm text-slate-300 leading-relaxed">{resume.summary}</p>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 mb-2">SKILLS</p>
          {chips(resume.skills, 'No skills detected')}
        </div>

        {resume.domains && resume.domains.length > 0 && (
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-500 mb-2">DOMAINS</p>
            {chips(resume.domains, '')}
          </div>
        )}

        {resume.projects && resume.projects.length > 0 && (
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-500 mb-2">PROJECTS</p>
            {chips(resume.projects, 'No projects detected')}
          </div>
        )}

        {sectionsFound && sectionsFound.length > 0 && (
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-500 mb-2">SECTIONS FOUND</p>
            <div className="flex flex-wrap gap-2">
              {sectionsFound.map((section, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs bg-slate-800 border border-slate-700 text-slate-300'
                  )}
                >
                  {section}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-white/[0.02] border-t border-white/5 flex items-center gap-2 text-xs text-slate-500">
        <Info className="w-3.5 h-3.5 flex-shrink-0" />
        This is what the AI extracted. If anything looks wrong, click &quot;Change Resume&quot;.
      </div>
    </motion.div>
  );
}