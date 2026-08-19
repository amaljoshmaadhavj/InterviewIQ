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
            className="chip bg-blue-50 text-blue-700 border border-blue-200"
          >
            {item}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-sm text-slate-400">{empty}</p>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-8 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-100 bg-blue-50/30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-float flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-800 font-bold truncate">{fileName || 'Resume'}</p>
            <p className="text-xs text-slate-500">
              <span className="capitalize text-blue-600 font-semibold">{resume.experience_level}</span> level candidate
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
            <p className="text-xs font-bold tracking-wider text-slate-400 mb-2">SUMMARY</p>
            <p className="text-sm text-slate-600 leading-relaxed">{resume.summary}</p>
          </div>
        )}

        <div>
          <p className="text-xs font-bold tracking-wider text-slate-400 mb-2">SKILLS</p>
          {chips(resume.skills, 'No skills detected')}
        </div>

        {resume.domains && resume.domains.length > 0 && (
          <div>
            <p className="text-xs font-bold tracking-wider text-slate-400 mb-2">DOMAINS</p>
            {chips(resume.domains, '')}
          </div>
        )}

        {resume.projects && resume.projects.length > 0 && (
          <div>
            <p className="text-xs font-bold tracking-wider text-slate-400 mb-2">PROJECTS</p>
            {chips(resume.projects, 'No projects detected')}
          </div>
        )}

        {sectionsFound && sectionsFound.length > 0 && (
          <div>
            <p className="text-xs font-bold tracking-wider text-slate-400 mb-2">SECTIONS FOUND</p>
            <div className="flex flex-wrap gap-2">
              {sectionsFound.map((section, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs bg-slate-100 border border-slate-200 text-slate-600'
                  )}
                >
                  {section}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-blue-50/40 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
        <Info className="w-3.5 h-3.5 flex-shrink-0" />
        This is what the AI extracted. If anything looks wrong, click &quot;Change Resume&quot;.
      </div>
    </motion.div>
  );
}