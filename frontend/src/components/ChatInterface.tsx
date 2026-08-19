'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertCircle, Loader2, SkipForward, RotateCcw, BrainCircuit, MessageSquare, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';
import { getScoreColor } from '@/utils/helpers';
import type { ChatMessage } from '@/utils/types';

const SKIP_MARKER = '__SKIP_QUESTION__';
const MAX_QUESTIONS = 5;

function ScoreBadge({ score }: { score: number }) {
  return (
    <div
      className={cn(
        'relative w-14 h-14 rounded-full flex items-center justify-center shrink-0',
        'border-2'
      )}
      style={{
        borderColor: score >= 8 ? 'rgba(52,211,153,0.6)' : score >= 6 ? 'rgba(139,92,246,0.6)' : score >= 4 ? 'rgba(251,191,36,0.6)' : 'rgba(248,113,113,0.6)',
      }}
    >
      <span className={cn('text-lg font-bold', getScoreColor(score))}>{score}</span>
      <span className="absolute -bottom-4 text-[10px] text-slate-500 font-medium">/10</span>
    </div>
  );
}

export function ChatInterface() {
  const router = useRouter();
  const { state, addChatMessage, setCurrentQuestion, setLoading, setError, resetInterview } = useApp();
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [failedAnswer, setFailedAnswer] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatHistory]);

  const submitAnswerCore = useCallback(
    async (answer: string, isSkip = false) => {
      if (!state.sessionId) return;

      // Add user message to chat (or a skip marker)
      const userMessage: ChatMessage = {
        id: isSkip ? `skip-${Date.now()}` : `user-${Date.now()}`,
        type: 'answer',
        sender: 'candidate',
        content: isSkip ? 'Skipped this question' : answer,
        timestamp: new Date(),
      };
      addChatMessage(userMessage);

      setIsSubmitting(true);
      setLoading(true);
      setFailedAnswer(null);

      try {
        const response = await api.submitAnswer({
          session_id: state.sessionId,
          answer,
        });

        // Add evaluation message
        const evaluationMessage: ChatMessage = {
          id: `eval-${Date.now()}`,
          type: 'evaluation',
          sender: 'interviewer',
          content: response.evaluation.feedback,
          evaluation: response.evaluation,
          timestamp: new Date(),
        };
        addChatMessage(evaluationMessage);

        setQuestionNumber(response.question_number);

        if (response.is_complete) {
          setIsInterviewComplete(true);
        } else if (response.next_question) {
          // Add next question
          const nextQuestionMessage: ChatMessage = {
            id: `q-${Date.now()}`,
            type: 'question',
            sender: 'interviewer',
            content: response.next_question,
            timestamp: new Date(),
          };
          addChatMessage(nextQuestionMessage);
          setCurrentQuestion(response.next_question);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to submit answer';
        setError(errorMessage);
        setFailedAnswer(answer);

        // Add error message
        const errorChatMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          type: 'question',
          sender: 'interviewer',
          content: `Error: ${errorMessage}`,
          timestamp: new Date(),
        };
        addChatMessage(errorChatMessage);
      } finally {
        setIsSubmitting(false);
        setLoading(false);
      }
    },
    [state.sessionId, addChatMessage, setCurrentQuestion, setLoading, setError]
  );

  const handleSubmitAnswer = useCallback(async () => {
    if (!input.trim() || !state.sessionId) return;
    const userAnswer = input.trim();
    setInput('');
    await submitAnswerCore(userAnswer, false);
  }, [input, state.sessionId, submitAnswerCore]);

  const handleSkipQuestion = useCallback(() => {
    if (isSubmitting || isInterviewComplete || !state.sessionId) return;
    submitAnswerCore(SKIP_MARKER, true);
  }, [isSubmitting, isInterviewComplete, state.sessionId, submitAnswerCore]);

  const handleRetryAnswer = useCallback(() => {
    if (!failedAnswer || isSubmitting) return;
    submitAnswerCore(failedAnswer, false);
  }, [failedAnswer, isSubmitting, submitAnswerCore]);

  const handleNewInterview = useCallback(() => {
    resetInterview();
    router.push('/');
  }, [resetInterview, router]);

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSubmitting) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  if (!state.sessionId) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card max-w-md w-full p-8 text-center"
        >
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-400/25 w-fit mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-white font-semibold mb-6">No active interview session</p>
          <Link href="/" className="btn btn-primary btn-md">
            Start Interview
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-20 pb-4">
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 overflow-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 pb-4 border-b border-white/5"
        >
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 shrink-0">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white truncate">{state.selectedRole}</h1>
                <p className="text-slate-400 text-sm flex items-center gap-1.5">
                  Question {Math.min(questionNumber, MAX_QUESTIONS)} of {MAX_QUESTIONS}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${(Math.min(questionNumber, MAX_QUESTIONS) / MAX_QUESTIONS) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-violet-400 to-cyan-400 rounded-full"
                />
              </div>
              {isInterviewComplete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-400/30 rounded-full flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 text-sm font-semibold">Complete</span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-5 mb-6 pr-1">
          {state.chatHistory.length === 0 ? (
            // First Question
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start gap-3 max-w-[85%]">
                <div className="p-2 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 shrink-0 mt-1">
                  <BrainCircuit className="w-4 h-4 text-white" />
                </div>
                <div className="card px-5 py-4 rounded-2xl rounded-tl-sm">
                  <p className="text-sm text-slate-200 leading-relaxed">{state.currentQuestion}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            state.chatHistory.map((message, idx) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={cn('flex', message.sender === 'candidate' ? 'justify-end' : 'justify-start')}
              >
                {message.sender === 'candidate' ? (
                  // User Message
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-violet-500/20 to-indigo-500/25 border border-violet-400/20 px-5 py-3.5">
                    <p className="text-sm text-slate-100 leading-relaxed">{message.content}</p>
                  </div>
                ) : message.type === 'evaluation' ? (
                  // Evaluation Message (Feedback)
                  <div className="max-w-full w-full space-y-2">
                    <div className="card p-5 border-emerald-400/15">
                      <div className="flex items-start gap-4 mb-4">
                        <ScoreBadge score={message.evaluation?.score || 0} />
                        <div className="flex-1 pt-0.5">
                          <p className="text-xs font-semibold tracking-wider text-slate-500 mb-1.5">FEEDBACK</p>
                          <p className="text-sm text-slate-200 leading-relaxed">{message.evaluation?.feedback}</p>
                        </div>
                      </div>

                      {message.evaluation && (
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          {[
                            { label: 'Clarity', value: message.evaluation.clarity, max: 5 },
                            { label: 'Depth', value: message.evaluation.depth, max: 5 },
                            { label: 'Relevance', value: message.evaluation.relevance, max: 5 },
                          ].map((item) => (
                            <div key={item.label} className="bg-white/[0.03] border border-white/5 rounded-lg p-3 text-center">
                              <p className="text-xs text-slate-500 mb-1.5">{item.label}</p>
                              <p className="text-base font-bold text-slate-100">
                                {item.value}
                                <span className="text-xs text-slate-500 font-medium">/{item.max}</span>
                              </p>
                              <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-violet-400 to-cyan-400 rounded-full"
                                  style={{ width: `${((item.value || 0) / item.max) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-4">
                        {message.evaluation?.strengths && message.evaluation.strengths.length > 0 && (
                          <div className="bg-emerald-500/5 border border-emerald-400/20 rounded-lg p-3.5">
                            <p className="text-emerald-300 text-xs font-semibold mb-2 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                            </p>
                            <ul className="text-slate-300 text-xs space-y-1.5">
                              {message.evaluation.strengths.map((s, i) => (
                                <li key={i} className="flex gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {message.evaluation?.weaknesses && message.evaluation.weaknesses.length > 0 && (
                          <div className="bg-amber-500/5 border border-amber-400/20 rounded-lg p-3.5">
                            <p className="text-amber-300 text-xs font-semibold mb-2 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5" /> Areas to Improve
                            </p>
                            <ul className="text-slate-300 text-xs space-y-1.5">
                              {message.evaluation.weaknesses.map((w, i) => (
                                <li key={i} className="flex gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                                  {w}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : message.content.startsWith('Error:') ? (
                  // Error Message
                  <div className="flex items-start gap-3 max-w-[85%]">
                    <div className="p-2 rounded-full bg-red-500/15 border border-red-400/25 shrink-0 mt-1">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="card px-5 py-4 rounded-2xl rounded-tl-sm border-red-400/20 bg-red-500/5">
                      <p className="text-sm text-red-300 leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  // Question Message
                  <div className="flex items-start gap-3 max-w-[85%]">
                    <div className="p-2 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 shrink-0 mt-1">
                      <BrainCircuit className="w-4 h-4 text-white" />
                    </div>
                    <div className="card px-5 py-4 rounded-2xl rounded-tl-sm">
                      <p className="text-sm text-slate-200 leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!isInterviewComplete ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {failedAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 p-3 bg-amber-500/10 border border-amber-400/30 rounded-xl"
              >
                <p className="text-amber-200 text-sm">Your last answer failed to send.</p>
                <button
                  onClick={handleRetryAnswer}
                  disabled={isSubmitting}
                  className="btn btn-md bg-amber-500 text-slate-950 hover:bg-amber-400 flex-shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry
                </button>
              </motion.div>
            )}

            <div className="card flex items-end gap-2 p-2.5">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSubmitting}
                placeholder="Type your response… (Shift+Enter for new line)"
                className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 disabled:opacity-50"
                rows={3}
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={!input.trim() || isSubmitting}
                aria-label="Send answer"
                className={cn(
                  'btn p-3.5 rounded-lg shrink-0',
                  input.trim() && !isSubmitting
                    ? 'btn-primary'
                    : 'bg-slate-800 text-slate-500'
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Skip Question */}
            <div className="flex items-center justify-between px-1">
              <button
                onClick={handleSkipQuestion}
                disabled={isSubmitting}
                className={cn(
                  'btn btn-sm',
                  isSubmitting ? 'text-slate-600' : 'text-slate-400 hover:text-white'
                )}
              >
                <SkipForward className="w-4 h-4" />
                Skip Question
              </button>
              <p className="text-xs text-slate-500">Skipping scores low for that question</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              href={`/interview/report?session=${state.sessionId}`}
              className="btn btn-primary btn-lg"
            >
              <MessageSquare className="w-4 h-4" /> View Report
            </Link>
            <button onClick={handleNewInterview} className="btn btn-secondary btn-lg">
              Start New Interview
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}