'use client';

import React, { useEffect } from 'react';
import { RoleSelector } from '@/components/RoleSelector';
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
    <div className="min-h-screen pt-20 pb-16">
      <RoleSelector />
    </div>
  );
}
