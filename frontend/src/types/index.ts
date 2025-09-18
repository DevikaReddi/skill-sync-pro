// API Types
export interface Skill {
  name: string;
  category?: string;
  relevance_score?: number;
}

export interface SkillAnalysis {
  matching_skills: Skill[];
  skill_gaps: Skill[];
  unique_skills: Skill[];
}

export interface AnalysisRequest {
  resume_text: string;
  job_description: string;
}

export interface AnalysisResponse {
  success: boolean;
  match_percentage: number;
  skill_analysis: SkillAnalysis;
  recommendations: string[];
  analysis_timestamp?: string;
  processing_time_ms?: number;
  experience_level?: {
    resume: string;
    job: string;
  };
  key_insights?: string[];
}

export interface AnalysisHistory {
  id: number;
  title?: string;
  resume_text: string;
  job_description: string;
  match_percentage: number;
  skill_analysis: any;
  recommendations: string[];
  created_at: string;
}

// UI State Types
export interface AnalysisState {
  // Input data
  resumeText: string;
  jobDescription: string;
  
  // Analysis results
  analysisResult: AnalysisResponse | null;
  analysisHistory: AnalysisHistory[];
  todayAnalysisCount: number;
  
  // UI state
  isAnalyzing: boolean;
  error: string | null;
  showAdvanced: boolean;
  
  // Actions
  setResumeText: (text: string) => void;
  setJobDescription: (text: string) => void;
  analyzeResume: () => Promise<void>;
  resetAnalysis: () => void;
  clearError: () => void;
  toggleAdvanced: () => void;
  
  // History actions
  fetchAnalysisHistory: () => Promise<void>;
  fetchTodayCount: () => Promise<void>;
  deleteAnalysis: (id: number) => Promise<void>;
  loadAnalysis: (analysis: AnalysisHistory) => void;
}

export interface UIState {
  isDarkMode: boolean;
  isMobileMenuOpen: boolean;
  activeTab: 'input' | 'results';
  
  toggleDarkMode: () => void;
  toggleMobileMenu: () => void;
  setActiveTab: (tab: 'input' | 'results') => void;
}

export interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (username: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string, fullName?: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}