'use client';

import React, { useCallback, useState } from 'react';
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
      if (file.type !== 'application/pdf') {
        setUploadError('Please upload a PDF file.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB.');
        return;
      }

      setUploadError(null);
      setLocalFileName(file.name);
      setIsUploading(true);
      setLoading(true);
      setUploadProgress(0);

      try {
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + Math.random() * 25;
          });
        }, 250);

        const response = await api.uploadResume(file);

        clearInterval(progressInterval);
        setUploadProgress(100);

        setResumeData(response.resume_data);
        setFileName(response.file_name);
        setSectionsFound(response.sections_found);

        setTimeout(() => {
          setLoading(false);
          onUploadComplete?.();
          router.push('/role-selection');
        }, 600);
      } catch (error) {
        setIsUploading(false);
        setUploadProgress(0);
        setLoading(false);

        const errorMessage =
          error instanceof Error ? error.message : 'Failed to upload resume. Please check your backend connection.';
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

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    <div className="w-full max-w-xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-xl border-2 border-dashed transition-all duration-150 text-center cursor-pointer p-8 sm:p-10',
          isDragging
            ? 'border-blue-500 bg-blue-50/60'
            : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/50 shadow-sm'
        )}
      >
        {!isUploading ? (
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center mx-auto transition-transform hover:scale-105">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div>
              <p className="text-sm sm:text-base font-bold text-slate-800">
                Choose a PDF file or drag & drop it here
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Standard technical or general resume format
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                PDF only
              </span>
              <span className="inline-flex items-center rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200">
                Max 10 MB
              </span>
            </div>

            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileInput}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Upload resume PDF"
            />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">Analyzing your resume...</p>
              <p className="text-xs text-slate-500 mt-1 truncate max-w-xs mx-auto">
                {fileName}
              </p>
            </div>

            <div className="max-w-xs mx-auto space-y-1.5">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Extracting skills & experience</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {uploadError && (
        <div
          role="alert"
          className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="text-rose-800 font-semibold">Upload failed</p>
            <p className="text-rose-700 mt-0.5">{uploadError}</p>
          </div>
        </div>
      )}

      {uploadProgress === 100 && !isUploading && (
        <div
          role="status"
          className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="text-emerald-800 font-semibold">Resume parsed successfully</p>
            <p className="text-emerald-700 mt-0.5">Redirecting to role selection...</p>
          </div>
        </div>
      )}
    </div>
  );
}