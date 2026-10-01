'use client';

import React from 'react';
import { FileText, RefreshCw, Layers, Briefcase, Code, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
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

  return (
    <div className="card mb-8 overflow-hidden bg-white border border-slate-200/90 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 border-b border-slate-200 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {fileName || 'Uploaded Resume'}
              </h2>
              <span className="chip bg-blue-50 text-blue-700 border border-blue-200 capitalize font-semibold">
                {resume.experience_level || 'Mid'} Level
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Resume parsed · {resume.skills?.length || 0} skills detected
            </p>
          </div>
        </div>

        <button
          onClick={handleChangeResume}
          className="btn btn-secondary btn-sm self-start sm:self-auto shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          Change Resume
        </button>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 space-y-4">
        {resume.summary && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Candidate Profile
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-lg border border-slate-200/70">
              {resume.summary}
            </p>
          </div>
        )}

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-slate-500" /> Detected Technical Skills
          </h3>
          {resume.skills && resume.skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {resume.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium"
                >
                  <Check className="w-3 h-3 text-blue-600" />
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No specific skills detected.</p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pt-1">
          {resume.domains && resume.domains.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" /> Domains & Topics
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {resume.domains.map((dom, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-sky-50 text-sky-800 border border-sky-200 text-xs font-medium"
                  >
                    {dom}
                  </span>
                ))}
              </div>
            </div>
          )}

          {resume.projects && resume.projects.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" /> Extracted Projects
              </h3>
              <ul className="space-y-1 text-xs text-slate-700">
                {resume.projects.map((proj, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    <span className="truncate font-medium">{proj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {sectionsFound && sectionsFound.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Sections parsed:</span>
            {sectionsFound.map((sec, idx) => (
              <span key={idx} className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {sec}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 sm:px-5 py-2.5 bg-blue-50/50 border-t border-slate-200 text-xs text-slate-600 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
        Questions in the technical screen will adapt directly to the skills and projects detected above.
      </div>
    </div>
  );
}