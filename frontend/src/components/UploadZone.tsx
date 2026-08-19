'use client';

import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, AlertCircle, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';

interface UploadZoneProps {
  onUploadComplete?: () => void;
}

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const router = useRouter();
  const { setResumeData, setFileName, setSectionsFound, setLoading, setError } = useApp();

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setLocalFileName] = useState<string | null>(null);

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
      setLocalFileName(file.name);
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
        setFileName(response.file_name);
        setSectionsFound(response.sections_found);

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
    [setResumeData, setFileName, setSectionsFound, setLoading, setError, onUploadComplete, router]
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
          borderColor: isDragging ? 'rgba(167,139,250,0.7)' : 'rgba(148,163,184,0.16)',
          backgroundColor: isDragging ? 'rgba(139,92,246,0.06)' : 'rgba(16,24,40,0.5)',
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          'relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer',
          'p-10 md:p-14 text-center overflow-hidden',
          'hover:border-violet-400/40 hover:bg-slate-900/60'
        )}
      >
        {/* Ambient glow */}
        <div
          className={cn(
            'absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-40 rounded-full blur-3xl transition-opacity duration-500 pointer-events-none',
            isDragging ? 'opacity-40 bg-violet-500/40' : 'opacity-10 bg-violet-500'
          )}
        />

        {!isUploading ? (
          <>
            <div className="relative">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="flex justify-center mb-5"
              >
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-400/30">
                  <UploadCloud className="w-8 h-8 text-violet-300" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                </div>
              </motion.div>

              <h3 className="text-xl font-semibold text-white mb-2">Drop your resume here</h3>
              <p className="text-slate-400 mb-1">or click to browse</p>
              <p className="text-sm text-slate-500 flex items-center justify-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                PDF only · up to 10MB
              </p>

              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                disabled={isUploading}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="Upload resume PDF"
              />
            </div>
          </>
        ) : (
          <div className="relative space-y-5">
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-400 border-r-indigo-400"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-2.5 rounded-full border-2 border-transparent border-b-cyan-400 border-l-transparent"
                />
              </div>
            </div>

            <div>
              <p className="text-white font-medium">Analyzing your resume…</p>
              <p className="text-slate-400 text-sm mt-1">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> {fileName}
                </span>
              </p>
            </div>
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
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.4 }}
              className="h-full bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 rounded-full"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
              Processing with AI
            </span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {uploadError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="mt-4 p-4 bg-red-500/10 border border-red-400/30 rounded-xl flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-medium">Upload Error</p>
            <p className="text-red-300/80 text-sm">{uploadError}</p>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      {uploadProgress === 100 && !isUploading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          className="mt-4 p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-xl flex items-start gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-emerald-300 font-medium">Resume Analyzed!</p>
            <p className="text-emerald-300/80 text-sm">Redirecting to role selection…</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}