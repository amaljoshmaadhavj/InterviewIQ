'use client';

import React from 'react';
import { AppProvider } from '@/context/AppContext';
import { Navigation } from '@/components/Navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <Navigation />
      {children}
    </AppProvider>
  );
}
