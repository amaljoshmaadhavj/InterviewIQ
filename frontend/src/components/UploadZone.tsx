/**
 * Upload Zone Component - Drag & Drop Resume Upload
 * Shows progress bar with "Neural Analyzing..." animation while Gemini processes
 */

'use client';

import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';

interface UploadZoneProps {
  onUploadComplete?: () => void;
}

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const router = useRouter();
  const { setResumeData, setLoading, setError } = useApp();

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setUploadError('Please upload a PDF file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        return;
      }

      setUploadError(null);
      setIsUploading(true);
      setLoading(true);
      setUploadProgress(0);

      try {
        // Simulate progress animation
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + Math.random() * 30;
          });
        }, 300);

        // Call backend API
        const response = await api.uploadResume(file);

        clearInterval(progressInterval);
        setUploadProgress(100);

        // Store resume data globally
        setResumeData(response.resume_data);

        // Wait for animation to complete
        setTimeout(() => {
          setLoading(false);
          onUploadComplete?.();
          router.push('/role-selection');
        }, 800);
      } catch (error) {
        setIsUploading(false);
        setUploadProgress(0);
        setLoading(false);

        const errorMessage =
          error instanceof Error ? error.message : 'Failed to upload resume';
        setUploadError(errorMessage);
        setError(errorMessage);
      }
    },
    [setResumeData, setLoading, setError, onUploadComplete, router]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging ? '#0EA5E9' : '#334155',
          backgroundColor: isDragging ? 'rgba(14, 165, 233, 0.05)' : 'rgba(15, 23, 42, 0.4)',
        }}
        className={cn(
          'relative rounded-2xl border-2 border-dashed transition-all cursor-pointer',
          'p-8 md:p-12 text-center',
          'hover:border-cyan-400 hover:bg-cyan-400/5'
        )}
      >
        {!isUploading ? (
          <>
            {/* Upload Icon */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center mb-4"
            >
              <div className="p-4 rounded-full bg-cyan-400/10 border border-cyan-400/30">
                <Upload className="w-8 h-8 text-cyan-400" />
              </div>
            </motion.div>

            {/* Text */}
            <h3 className="text-xl font-semibold text-white mb-2">
              Drop your resume here
            </h3>
            <p className="text-gray-400 mb-4">or click to browse</p>
            <p className="text-sm text-gray-500">Supports PDF files up to 10MB</p>

            {/* Hidden File Input */}
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              disabled={isUploading}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </>
        ) : (
          <div className="space-y-4">
            {/* Loading Animation */}
            <div className="flex justify-center mb-6">
              <div className="relative w-16 h-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-2 rounded-full border-2 border-transparent border-b-blue-400"
                />
              </div>
            </div>

            <p className="text-white font-medium">Neural Analyzing...</p>
            <p className="text-gray-400 text-sm">Processing your resume with AI</p>
          </div>
        )}
      </motion.div>

      {/* Progress Bar */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-2"
        >
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
            />
          </div>
          <p className="text-xs text-gray-400 text-center">{Math.round(uploadProgress)}%</p>
        </motion.div>
      )}

      {/* Error Message */}
      {uploadError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Upload Error</p>
            <p className="text-red-400/80 text-sm">{uploadError}</p>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      {uploadProgress === 100 && !isUploading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-400 font-medium">Resume Analyzed!</p>
            <p className="text-green-400/80 text-sm">Redirecting to role selection...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
