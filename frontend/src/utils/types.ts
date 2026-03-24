/**
 * TypeScript Types for InterviewIQ Frontend
 */

export interface ResumeData {
  skills: string[];
  experience_level: 'junior' | 'mid' | 'senior';
  domains: string[];
  projects: string[];
  summary: string;
  raw_response?: string;
}

export interface UploadResponse {
  status: 'success' | 'error';
  resume_data: ResumeData;
  file_name: string;
  sections_found: string[];
}

export interface StartInterviewRequest {
  role: string;
  resume_data: ResumeData;
}

export interface StartInterviewResponse {
  session_id: string;
  role: string;
  first_question: string;
  experience_level: string;
}

export interface EvaluationData {
  score: number;
  clarity?: number;
  depth?: number;
  relevance?: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
}

export interface InterviewChatRequest {
  session_id: string;
  answer: string;
}

export interface InterviewChatResponse {
  evaluation: EvaluationData;
  question_number: number;
  is_complete: boolean;
  next_question?: string;
}

export interface InterviewReportResponse {
  session_id: string;
  role: string;
  average_score: number;
  recommendation: string;
  strengths: string[];
  weaknesses: string[];
  api_calls_used: number;
}

export interface InterviewHistoryItem {
  session_id: string;
  role: string;
  created_at?: string;
  score?: number;
  experience_level?: string;
}

export interface InterviewState {
  sessionId: string | null;
  resumeData: ResumeData | null;
  selectedRole: string | null;
  currentQuestion: string | null;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export interface ChatMessage {
  id: string;
  type: 'question' | 'answer' | 'evaluation';
  sender: 'interviewer' | 'candidate';
  content: string;
  evaluation?: EvaluationData;
  timestamp: Date;
}

export interface AppContextType {
  state: InterviewState;
  setSessionId: (id: string) => void;
  setResumeData: (data: ResumeData) => void;
  setSelectedRole: (role: string) => void;
  setCurrentQuestion: (question: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetInterview: () => void;
}
