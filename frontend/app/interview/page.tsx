'use client';

import React, { useEffect } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function InterviewPage() {
  const { state } = useApp();
  const router = useRouter();

  // Redirect if no session
  useEffect(() => {
    if (!state.sessionId) {
      router.push('/');
    }
  }, [state.sessionId, router]);

  return <ChatInterface />;
}
