/**
 * Global App Context for InterviewIQ
 * Manages session_id, resume_data, and interview state
 */

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  InterviewState,
  AppContextType,
  ResumeData,
  ChatMessage,
} from '@/utils/types';

const defaultState: InterviewState = {
  sessionId: null,
  resumeData: null,
  selectedRole: null,
  currentQuestion: null,
  chatHistory: [],
  isLoading: false,
  error: null,
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<InterviewState>(defaultState);

  const setSessionId = useCallback((id: string) => {
    setState((prev) => ({ ...prev, sessionId: id }));
  }, []);

  const setResumeData = useCallback((data: ResumeData) => {
    setState((prev) => ({ ...prev, resumeData: data }));
  }, []);

  const setSelectedRole = useCallback((role: string) => {
    setState((prev) => ({ ...prev, selectedRole: role }));
  }, []);

  const setCurrentQuestion = useCallback((question: string) => {
    setState((prev) => ({ ...prev, currentQuestion: question }));
  }, []);

  const addChatMessage = useCallback((message: ChatMessage) => {
    setState((prev) => ({
      ...prev,
      chatHistory: [...prev.chatHistory, message],
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const resetInterview = useCallback(() => {
    setState(defaultState);
  }, []);

  const value: AppContextType = {
    state,
    setSessionId,
    setResumeData,
    setSelectedRole,
    setCurrentQuestion,
    addChatMessage,
    setLoading,
    setError,
    resetInterview,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
