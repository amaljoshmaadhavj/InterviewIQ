'use client';

import React, { useEffect } from 'react';
import { RoleSelector } from '@/components/RoleSelector';
import { ResumePreview } from '@/components/ResumePreview';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function RoleSelectionPage() {
  const { state } = useApp();
  const router = useRouter();

  // Redirect to home if no resume data
  useEffect(() => {
    if (!state.resumeData) {
      router.push('/');
    }
  }, [state.resumeData, router]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <ResumePreview fileName={state.fileName} sectionsFound={state.sectionsFound} />
      </div>
      <RoleSelector />
    </div>
  );
}
