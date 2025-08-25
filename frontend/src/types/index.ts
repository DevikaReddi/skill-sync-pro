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
  analysis_timestamp: string;
  processing_time_ms?: number;
}

// UI State Types
export interface AnalysisState {
  // Input data
  resumeText: string;
  jobDescription: string;
  
  // Analysis results
  analysisResult: AnalysisResponse | null;
  
  // UI state
  isAnalyzing: boolean;
  error: string | null;
  
  // Actions
  setResumeText: (text: string) => void;
  setJobDescription: (text: string) => void;
  analyzeResume: () => Promise<void>;
  resetAnalysis: () => void;
  clearError: () => void;
}

export interface UIState {
  isDarkMode: boolean;
  isMobileMenuOpen: boolean;
  activeTab: 'input' | 'results';
  
  toggleDarkMode: () => void;
  toggleMobileMenu: () => void;
  setActiveTab: (tab: 'input' | 'results') => void;
}
