/**
 * Hook for starting a fresh interview
 * Resets all app state and navigates back to the landing page
 */

'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export function useNewInterview() {
  const router = useRouter();
  const { resetInterview } = useApp();

  return useCallback(() => {
    resetInterview();
    router.push('/');
  }, [resetInterview, router]);
}
