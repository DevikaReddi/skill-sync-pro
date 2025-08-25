import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AnalysisState } from '../types';
import apiService from '../services/api';

export const useAnalysisStore = create<AnalysisState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        resumeText: '',
        jobDescription: '',
        analysisResult: null,
        isAnalyzing: false,
        error: null,
        
        // Actions
        setResumeText: (text: string) => {
          set({ resumeText: text, error: null });
        },
        
        setJobDescription: (text: string) => {
          set({ jobDescription: text, error: null });
        },
        
        analyzeResume: async () => {
          const { resumeText, jobDescription } = get();
          
          // Validation
          if (!resumeText.trim() || !jobDescription.trim()) {
            set({ error: 'Please provide both resume and job description' });
            return;
          }
          
          if (resumeText.length < 50 || jobDescription.length < 50) {
            set({ error: 'Both texts must be at least 50 characters long' });
            return;
          }
          
          set({ isAnalyzing: true, error: null });
          
          try {
            const result = await apiService.analyzeResume({
              resume_text: resumeText,
              job_description: jobDescription,
            });
            
            set({ 
              analysisResult: result, 
              isAnalyzing: false,
              error: null 
            });
          } catch (error) {
            set({ 
              isAnalyzing: false, 
              error: error instanceof Error ? error.message : 'Analysis failed' 
            });
          }
        },
        
        resetAnalysis: () => {
          set({
            resumeText: '',
            jobDescription: '',
            analysisResult: null,
            error: null,
          });
        },
        
        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'analysis-storage',
        partialize: (state) => ({ 
          resumeText: state.resumeText,
          jobDescription: state.jobDescription 
        }),
      }
    )
  )
);
