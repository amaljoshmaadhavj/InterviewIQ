'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  AlertCircle,
  Loader2,
  SkipForward,
  RotateCcw,
  BrainCircuit,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';
import type { ChatMessage } from '@/utils/types';

const SKIP_MARKER = '__SKIP_QUESTION__';
const MAX_QUESTIONS = 5;

function ScoreBadge({ score }: { score: number }) {
  const isHigh = score >= 8;
  const isMid = score >= 6;
  const isLow = score >= 4;

  const bgClass = isHigh
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : isMid
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : isLow
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-rose-50 text-rose-700 border-rose-200';

  return (
    <div className={cn('inline-flex items-baseline gap-1 px-2.5 py-1 rounded-md border font-bold text-sm', bgClass)}>
      <span>{score}</span>
      <span className="text-[11px] font-medium opacity-70">/10</span>
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatHistory]);

  const submitAnswerCore = useCallback(
    async (answer: string, isSkip = false) => {
      if (!state.sessionId) return;

      const userMessage: ChatMessage = {
        id: isSkip ? `skip-${Date.now()}` : `user-${Date.now()}`,
        type: 'answer',
        sender: 'candidate',
        content: isSkip ? 'Skipped this question.' : answer,
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

        const errorChatMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          type: 'question',
          sender: 'interviewer',
          content: `Connection Error: ${errorMessage}. Please check your backend connection and retry.`,
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSubmitting) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  if (!state.sessionId) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center px-4">
        <div className="card max-w-md w-full p-8 text-center bg-white border border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">No Active Session</h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            Please upload your resume and select a role to begin your mock interview.
          </p>
          <Link href="/" className="btn btn-primary btn-md">
            Go to Start Practice
          </Link>
        </div>
      </div>
    );
  }

  const currentQDisplay = Math.min(questionNumber, MAX_QUESTIONS);

  return (
    <div className="min-h-screen flex flex-col pt-20 pb-6 bg-slate-50/60">
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 sm:px-6">
        {/* Session Status Bar */}
        <div className="card p-4 mb-4 bg-white border border-slate-200/90 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {state.selectedRole || 'Technical Screen'}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-200">
                    Live Session
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Question {currentQDisplay} of {MAX_QUESTIONS}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <div className="w-32 hidden sm:block">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(((currentQDisplay - (isInterviewComplete ? 0 : 1)) / MAX_QUESTIONS) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{
                      width: isInterviewComplete ? '100%' : `${(currentQDisplay / MAX_QUESTIONS) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {isInterviewComplete ? (
                <Link
                  href={`/interview/report?session=${state.sessionId}`}
                  className="btn btn-primary btn-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>View Report</span>
                </Link>
              ) : (
                <button
                  onClick={handleNewInterview}
                  className="btn btn-secondary btn-sm text-slate-500"
                >
                  Exit Session
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
          {state.chatHistory.length === 0 ? (
            /* First Question */
            <div className="flex justify-start">
              <div className="max-w-[92%] sm:max-w-[85%] rounded-xl rounded-tl-sm card p-4 sm:p-5 border border-slate-200 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    AI
                  </div>
                  <span className="text-xs font-bold text-slate-900">Technical Interviewer</span>
                  <span className="text-[11px] text-slate-400">· Question 1 of {MAX_QUESTIONS}</span>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed font-normal">
                  {state.currentQuestion}
                </p>
              </div>
            </div>
          ) : (
            state.chatHistory.map((message) => {
              if (message.sender === 'candidate') {
                return (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-[90%] sm:max-w-[80%] rounded-xl rounded-tr-sm bg-blue-600 text-white p-4 shadow-sm">
                      <div className="flex items-center justify-between text-blue-100 text-xs mb-1">
                        <span className="font-medium">You</span>
                        <span className="text-[11px] opacity-80">Answer</span>
                      </div>
                      <p className="text-sm text-white/95 leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                );
              }

              if (message.type === 'evaluation') {
                const evalData = message.evaluation;
                return (
                  <div key={message.id} className="w-full">
                    <div className="card p-4 sm:p-5 border border-slate-200 bg-white shadow-sm">
                      {/* Evaluation Header */}
                      <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Answer Evaluation
                          </h4>
                        </div>
                        <ScoreBadge score={evalData?.score || 0} />
                      </div>

                      {/* General Feedback */}
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
                        {evalData?.feedback}
                      </p>

                      {/* Metric Rubric */}
                      {evalData && (
                        <div className="grid grid-cols-3 gap-2.5 mb-4">
                          {[
                            { label: 'Clarity', val: evalData.clarity },
                            { label: 'Depth', val: evalData.depth },
                            { label: 'Relevance', val: evalData.relevance },
                          ].map((metric) => (
                            <div
                              key={metric.label}
                              className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-center"
                            >
                              <span className="text-[11px] text-slate-500 block mb-0.5">
                                {metric.label}
                              </span>
                              <div className="text-xs sm:text-sm font-bold text-slate-900">
                                {metric.val}
                                <span className="text-[10px] text-slate-400 font-normal">/5</span>
                              </div>
                              <div className="mt-1.5 h-1 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 rounded-full"
                                  style={{ width: `${((metric.val || 0) / 5) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Strengths & Weaknesses */}
                      <div className="grid sm:grid-cols-2 gap-3 text-xs">
                        {evalData?.strengths && evalData.strengths.length > 0 && (
                          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-3">
                            <p className="text-emerald-800 font-bold mb-1.5 flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              Key Strengths
                            </p>
                            <ul className="space-y-1 text-slate-600">
                              {evalData.strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {evalData?.weaknesses && evalData.weaknesses.length > 0 && (
                          <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3">
                            <p className="text-amber-800 font-bold mb-1.5 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              Areas to Polish
                            </p>
                            <ul className="space-y-1 text-slate-600">
                              {evalData.weaknesses.map((w, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                  <span>{w}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              if (message.content.startsWith('Connection Error:')) {
                return (
                  <div key={message.id} className="flex justify-start">
                    <div className="max-w-[92%] sm:max-w-[85%] rounded-xl card p-4 border-rose-200 bg-rose-50 text-rose-800 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 mb-1 font-semibold text-rose-900">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        Network Notification
                      </div>
                      <p>{message.content}</p>
                    </div>
                  </div>
                );
              }

              /* Default interviewer question message */
              return (
                <div key={message.id} className="flex justify-start">
                  <div className="max-w-[92%] sm:max-w-[85%] rounded-xl rounded-tl-sm card p-4 sm:p-5 border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        AI
                      </div>
                      <span className="text-xs font-bold text-slate-900">Technical Interviewer</span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed font-normal">
                      {message.content}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Dock / Completion Bar */}
        {!isInterviewComplete ? (
          <div className="space-y-2">
            {failedAnswer && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-800">
                <span>The previous response failed to send.</span>
                <button
                  onClick={handleRetryAnswer}
                  disabled={isSubmitting}
                  className="btn btn-sm bg-amber-600 text-white hover:bg-amber-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            )}

            <div className="card p-3 bg-white border border-slate-200 shadow-sm space-y-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isSubmitting}
                placeholder="Type your response here... (Structure your explanation clearly)"
                className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none resize-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 min-h-[72px]"
                rows={3}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="hidden sm:inline">Press Enter ↵ to send · Shift + Enter for new line</span>
                  <button
                    type="button"
                    onClick={handleSkipQuestion}
                    disabled={isSubmitting}
                    className="text-slate-500 hover:text-slate-700 flex items-center gap-1"
                  >
                    <SkipForward className="w-3.5 h-3.5" /> Skip Question
                  </button>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!input.trim() || isSubmitting}
                    className="btn btn-primary btn-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Response</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-6 bg-white border border-emerald-200 shadow-sm text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Interview Session Completed!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                All 5 questions have been answered and evaluated.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href={`/interview/report?session=${state.sessionId}`}
                className="btn btn-primary btn-md w-full sm:w-auto"
              >
                <span>View Performance Report</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={handleNewInterview}
                className="btn btn-secondary btn-md w-full sm:w-auto"
              >
                Start New Practice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}