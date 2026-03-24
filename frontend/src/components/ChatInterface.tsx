/**
 * Interview Chat Interface
 * ChatGPT-like interface for the interview with auto-scrolling and animation
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/services/api';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';
import { formatDate, getScoreColor } from '@/utils/helpers';
import type { ChatMessage } from '@/utils/types';

export function ChatInterface() {
  const { state, addChatMessage, setCurrentQuestion, setLoading, setError } = useApp();
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatHistory]);

  const handleSubmitAnswer = useCallback(async () => {
    if (!input.trim() || !state.sessionId) return;

    const userAnswer = input.trim();
    setInput('');

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'answer',
      sender: 'candidate',
      content: userAnswer,
      timestamp: new Date(),
    };
    addChatMessage(userMessage);

    setIsSubmitting(true);
    setLoading(true);

    try {
      const response = await api.submitAnswer({
        session_id: state.sessionId,
        answer: userAnswer,
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
  }, [input, state.sessionId, addChatMessage, setCurrentQuestion, setLoading, setError]);

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSubmitting) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  if (!state.sessionId) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white mb-6">No active interview session</p>
          <Link href="/" className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">
            Start Interview
          </Link>
        </div>
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
          className="mb-4 pb-4 border-b border-gray-700"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">{state.selectedRole}</h1>
              <p className="text-gray-400 text-sm">
                Question {questionNumber} of 5
              </p>
            </div>
            {isInterviewComplete && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-4 py-2 bg-green-400/10 border border-green-400/30 rounded-lg"
              >
                <p className="text-green-400 font-semibold text-sm">Interview Complete ✓</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6">
          {state.chatHistory.length === 0 ? (
            // First Question
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="max-w-md bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-white text-sm leading-relaxed">{state.currentQuestion}</p>
              </div>
            </motion.div>
          ) : (
            state.chatHistory.map((message, idx) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn('flex', message.sender === 'candidate' ? 'justify-end' : 'justify-start')}
              >
                {message.sender === 'candidate' ? (
                  // User Message
                  <div className="max-w-xl bg-cyan-600/20 border border-cyan-500/30 rounded-lg p-4">
                    <p className="text-white text-sm leading-relaxed">{message.content}</p>
                  </div>
                ) : message.type === 'evaluation' ? (
                  // Evaluation Message (Feedback)
                  <div className="max-w-xl w-full space-y-2">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-gray-400 text-xs font-medium">FEEDBACK</span>
                        <span className={cn('text-lg font-bold', getScoreColor(message.evaluation?.score || 0))}>
                          {message.evaluation?.score}/10
                        </span>
                      </div>
                      <p className="text-white text-sm mb-3">{message.evaluation?.feedback}</p>

                      {message.evaluation && (
                        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                          <div className="bg-white/5 rounded p-2">
                            <p className="text-gray-400">Clarity</p>
                            <p className="text-cyan-400 font-bold">{message.evaluation.clarity}/5</p>
                          </div>
                          <div className="bg-white/5 rounded p-2">
                            <p className="text-gray-400">Depth</p>
                            <p className="text-cyan-400 font-bold">{message.evaluation.depth}/5</p>
                          </div>
                          <div className="bg-white/5 rounded p-2">
                            <p className="text-gray-400">Relevance</p>
                            <p className="text-cyan-400 font-bold">{message.evaluation.relevance}/5</p>
                          </div>
                        </div>
                      )}

                      {message.evaluation?.strengths && (
                        <div className="mb-2">
                          <p className="text-green-400 text-xs font-medium mb-1">✓ Strengths</p>
                          <ul className="text-gray-300 text-xs space-y-1">
                            {message.evaluation.strengths.map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {message.evaluation?.weaknesses && (
                        <div>
                          <p className="text-orange-400 text-xs font-medium mb-1">⚠ Areas to Improve</p>
                          <ul className="text-gray-300 text-xs space-y-1">
                            {message.evaluation.weaknesses.map((w, i) => (
                              <li key={i}>• {w}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Question Message
                  <div className="max-w-xl bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <p className="text-white text-sm leading-relaxed">{message.content}</p>
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
            className="flex gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSubmitting}
              placeholder="Type your response... (Shift+Enter for new line)"
              className={cn(
                'flex-1 p-4 rounded-lg bg-gray-900 border border-gray-700',
                'text-white placeholder-gray-500',
                'focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500',
                'resize-none',
                'disabled:opacity-50'
              )}
              rows={3}
            />
            <button
              onClick={handleSubmitAnswer}
              disabled={!input.trim() || isSubmitting}
              className={cn(
                'p-4 rounded-lg transition-all duration-200',
                'flex items-center justify-center',
                input.trim() && !isSubmitting
                  ? 'bg-cyan-500 text-white hover:bg-cyan-600 cursor-pointer'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Loader className="w-5 h-5" />
                </motion.div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              href={`/interview/report?session=${state.sessionId}`}
              className="px-8 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 font-semibold text-center"
            >
              View Report
            </Link>
            <Link
              href="/"
              className="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-semibold text-center"
            >
              Start New Interview
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
