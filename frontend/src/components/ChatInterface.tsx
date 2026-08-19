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
        borderColor: score >= 8 ? 'rgba(16,185,129,0.4)' : score >= 6 ? 'rgba(59,130,246,0.4)' : score >= 4 ? 'rgba(245,158,11,0.4)' : 'rgba(244,63,94,0.4)',
        backgroundColor: score >= 8 ? '#ecfdf5' : score >= 6 ? '#eff6ff' : score >= 4 ? '#fffbeb' : '#fff1f2',
      }}
    >
      <span className={cn('text-lg font-extrabold', getScoreColor(score))}>{score}</span>
      <span className="absolute -bottom-4 text-[10px] text-slate-400 font-semibold">/10</span>
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
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 w-fit mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <p className="text-slate-800 font-bold mb-6">No active interview session</p>
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
          className="mb-5 pb-4 border-b border-slate-200"
        >
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shrink-0 shadow-float">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-slate-800 truncate">{state.selectedRole}</h1>
                <p className="text-slate-500 text-sm flex items-center gap-1.5">
                  Question {Math.min(questionNumber, MAX_QUESTIONS)} of {MAX_QUESTIONS}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex w-28 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${(Math.min(questionNumber, MAX_QUESTIONS) / MAX_QUESTIONS) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                />
              </div>
              {isInterviewComplete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-700 text-sm font-semibold">Complete</span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-5 mb-6 pr-1">
          {state.chatHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start gap-3 max-w-[85%]">
                <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 shrink-0 mt-1 shadow-float">
                  <BrainCircuit className="w-4 h-4 text-white" />
                </div>
                <div className="card px-5 py-4 rounded-2xl rounded-tl-sm">
                  <p className="text-sm text-slate-700 leading-relaxed">{state.currentQuestion}</p>
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
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-blue-500 to-cyan-500 px-5 py-3.5 shadow-float">
                    <p className="text-sm text-white leading-relaxed">{message.content}</p>
                  </div>
                ) : message.type === 'evaluation' ? (
                  <div className="max-w-full w-full space-y-2">
                    <div className="card p-5 border-emerald-200">
                      <div className="flex items-start gap-4 mb-4">
                        <ScoreBadge score={message.evaluation?.score || 0} />
                        <div className="flex-1 pt-0.5">
                          <p className="text-xs font-bold tracking-wider text-slate-400 mb-1.5">FEEDBACK</p>
                          <p className="text-sm text-slate-700 leading-relaxed">{message.evaluation?.feedback}</p>
                        </div>
                      </div>

                      {message.evaluation && (
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          {[
                            { label: 'Clarity', value: message.evaluation.clarity, max: 5 },
                            { label: 'Depth', value: message.evaluation.depth, max: 5 },
                            { label: 'Relevance', value: message.evaluation.relevance, max: 5 },
                          ].map((item) => (
                            <div key={item.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                              <p className="text-xs text-slate-500 mb-1.5">{item.label}</p>
                              <p className="text-base font-extrabold text-slate-800">
                                {item.value}
                                <span className="text-xs text-slate-400 font-semibold">/{item.max}</span>
                              </p>
                              <div className="mt-2 h-1 bg-blue-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                                  style={{ width: `${((item.value || 0) / item.max) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-4">
                        {message.evaluation?.strengths && message.evaluation.strengths.length > 0 && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                            <p className="text-emerald-700 text-xs font-bold mb-2 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                            </p>
                            <ul className="text-slate-600 text-xs space-y-1.5">
                              {message.evaluation.strengths.map((s, i) => (
                                <li key={i} className="flex gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {message.evaluation?.weaknesses && message.evaluation.weaknesses.length > 0 && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                            <p className="text-amber-700 text-xs font-bold mb-2 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5" /> Areas to Improve
                            </p>
                            <ul className="text-slate-600 text-xs space-y-1.5">
                              {message.evaluation.weaknesses.map((w, i) => (
                                <li key={i} className="flex gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
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
                  <div className="flex items-start gap-3 max-w-[85%]">
                    <div className="p-2 rounded-full bg-rose-100 border border-rose-200 shrink-0 mt-1">
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="card px-5 py-4 rounded-2xl rounded-tl-sm border-rose-200 bg-rose-50">
                      <p className="text-sm text-rose-700 leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 max-w-[85%]">
                    <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 shrink-0 mt-1 shadow-float">
                      <BrainCircuit className="w-4 h-4 text-white" />
                    </div>
                    <div className="card px-5 py-4 rounded-2xl rounded-tl-sm">
                      <p className="text-sm text-slate-700 leading-relaxed">{message.content}</p>
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
                className="flex items-center justify-between gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl"
              >
                <p className="text-amber-700 text-sm">Your last answer failed to send.</p>
                <button
                  onClick={handleRetryAnswer}
                  disabled={isSubmitting}
                  className="btn btn-md bg-amber-500 text-white hover:bg-amber-600 flex-shrink-0"
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
                className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 disabled:opacity-50"
                rows={3}
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={!input.trim() || isSubmitting}
                aria-label="Send answer"
                className={cn(
                  'btn p-3.5 rounded-xl shrink-0',
                  input.trim() && !isSubmitting
                    ? 'btn-primary'
                    : 'bg-slate-100 text-slate-400'
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between px-1">
              <button
                onClick={handleSkipQuestion}
                disabled={isSubmitting}
                className={cn(
                  'btn btn-sm',
                  isSubmitting ? 'text-slate-300' : 'text-slate-400 hover:text-blue-600'
                )}
              >
                <SkipForward className="w-4 h-4" />
                Skip Question
              </button>
              <p className="text-xs text-slate-400">Skipping scores low for that question</p>
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