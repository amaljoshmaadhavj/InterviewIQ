/**
 * API Client Service for InterviewIQ Backend
 * Handles all HTTP communication with the FastAPI backend
 */

import axios, { AxiosInstance } from 'axios';
import {
  UploadResponse,
  StartInterviewResponse,
  InterviewChatResponse,
  InterviewReportResponse,
  StartInterviewRequest,
  InterviewChatRequest,
} from '@/utils/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Health check - verify backend is running
   */
  async health(): Promise<{ status: string; service: string; version: string }> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Health check failed');
    }
  }

  /**
   * Upload and analyze resume (Gemini)
   * @param file - PDF file
   * @returns Structured resume data
   */
  async uploadResume(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.client.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Resume upload failed');
    }
  }

  /**
   * Start a new interview session
   * @param request - Role and resume_data
   * @returns Session ID and first question
   */
  async startInterview(request: StartInterviewRequest): Promise<StartInterviewResponse> {
    try {
      const response = await this.client.post('/interview/start', request);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Interview start failed');
    }
  }

  /**
   * Submit answer and get evaluation + next question
   * @param request - Session ID and answer
   * @returns Evaluation and next question
   */
  async submitAnswer(request: InterviewChatRequest): Promise<InterviewChatResponse> {
    try {
      const response = await this.client.post('/interview/chat', request);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Answer submission failed');
    }
  }

  /**
   * Get final interview report
   * @param sessionId - Interview session ID
   * @returns Report with scores and recommendations
   */
  async getReport(sessionId: string): Promise<InterviewReportResponse> {
    try {
      const response = await this.client.get(`/interview/report/${sessionId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Report fetch failed');
    }
  }

  /**
   * Get interview history
   * @returns List of past interviews
   */
  async getInterviewHistory(): Promise<{ interviews: any[] }> {
    try {
      const response = await this.client.get('/interviews');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'History fetch failed');
    }
  }

  /**
   * Error handler with user-friendly messages
   */
  private handleError(error: any, defaultMessage: string): Error {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        // Network error
        throw new Error(
          'Unable to connect to server. Please ensure the backend is running at ' + API_URL
        );
      }

      const status = error.response.status;
      const data = error.response.data as any;

      // Handle specific error responses from backend
      if (data?.detail) {
        throw new Error(data.detail);
      }

      // Handle specific status codes
      switch (status) {
        case 400:
          throw new Error('Invalid request. Please check your input.');
        case 404:
          throw new Error('Resource not found.');
        case 500:
          throw new Error('Server error. Please try again later.');
        default:
          throw new Error(defaultMessage);
      }
    }

    throw new Error(defaultMessage);
  }
}

export const api = new APIClient();
