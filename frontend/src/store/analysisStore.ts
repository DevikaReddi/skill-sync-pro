import { create } from 'zustand';
import { AnalysisState } from '../types';
import toast from 'react-hot-toast';
import apiService from '../services/api';

export const useAnalysisStore = create<AnalysisState>(
  (set, get) => ({
    // Initial state
    resumeText: '',
    jobDescription: '',
    analysisResult: null,
    isAnalyzing: false,
    error: null,
    showAdvanced: false,  // Added missing property
    
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
        toast.error('Please provide both resume and job description');
        return;
      }
      
      if (resumeText.length < 50 || jobDescription.length < 50) {
        toast.error('Texts must be at least 50 characters long');
        return;
      }
      
      set({ isAnalyzing: true, error: null });
      
      try {
        toast.loading('Analyzing your resume...', { id: 'analysis' });
        
        const result = await apiService.analyzeResume({
          resume_text: resumeText,
          job_description: jobDescription,
        });
        
        if (result.success) {
          set({ analysisResult: result, isAnalyzing: false });
          toast.success('Analysis complete!', { id: 'analysis' });
        } else {
          throw new Error('Analysis failed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
        set({ 
          error: errorMessage, 
          isAnalyzing: false,
          analysisResult: null 
        });
        toast.error(errorMessage, { id: 'analysis' });
      }
    },
    
    resetAnalysis: () => {
      set({
        analysisResult: null,
        error: null,
        showAdvanced: false
      });
    },
    
    clearError: () => {
      set({ error: null });
    },
    
    toggleAdvanced: () => {  // Added missing method
      set((state) => ({ showAdvanced: !state.showAdvanced }));
    },
  })
);
