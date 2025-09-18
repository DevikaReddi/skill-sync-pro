import { create } from 'zustand';
import { AnalysisState } from '../types';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import { authService } from '../services/auth';

export const useAnalysisStore = create<AnalysisState>(
  (set, get) => ({
    // Initial state
    resumeText: '',
    jobDescription: '',
    analysisResult: null,
    isAnalyzing: false,
    error: null,
    showAdvanced: false,
    analysisHistory: [],
    todayAnalysisCount: 0,
    
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
        const toastId = toast.loading('AI is analyzing your documents...', { 
          id: 'analysis',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          }
        });
        
        // Call actual backend API
        const result = await apiService.analyzeResume({
          resume_text: resumeText,
          job_description: jobDescription,
        });
        
        if (result.success) {
          set({ analysisResult: result, isAnalyzing: false });
          
          // Save to history if user is authenticated
          if (authService.isAuthenticated()) {
            try {
              await apiService.saveAnalysis({
                title: `Analysis - ${new Date().toLocaleDateString()}`,
                resume_text: resumeText,
                job_description: jobDescription,
                match_percentage: result.match_percentage,
                skill_analysis: result.skill_analysis,
                recommendations: result.recommendations
              });
              
              // Update today's count
              get().fetchTodayCount();
            } catch (error) {
              console.error('Failed to save to history:', error);
            }
          }
          
          toast.success('Analysis complete!', { 
            id: toastId,
            icon: '🎉',
            duration: 5000 
          });
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
    
    toggleAdvanced: () => {
      set((state) => ({ showAdvanced: !state.showAdvanced }));
    },
    
    // Fetch analysis history
    fetchAnalysisHistory: async () => {
      if (!authService.isAuthenticated()) return;
      
      try {
        const history = await apiService.getAnalysisHistory();
        set({ analysisHistory: history });
      } catch (error) {
        console.error('Failed to fetch history:', error);
      }
    },
    
    // Fetch today's analysis count
    fetchTodayCount: async () => {
      if (!authService.isAuthenticated()) {
        set({ todayAnalysisCount: 0 });
        return;
      }
      
      try {
        const history = await apiService.getAnalysisHistory(0, 100);
        const today = new Date().toDateString();
        const todayAnalyses = history.filter(h => 
          new Date(h.created_at).toDateString() === today
        );
        set({ todayAnalysisCount: todayAnalyses.length });
      } catch (error) {
        console.error('Failed to fetch today count:', error);
        set({ todayAnalysisCount: 0 });
      }
    },
    
    // Delete analysis from history
    deleteAnalysis: async (id: number) => {
      try {
        await apiService.deleteAnalysis(id);
        await get().fetchAnalysisHistory();
        toast.success('Analysis deleted');
      } catch (error) {
        toast.error('Failed to delete analysis');
      }
    },
    
    // Load analysis from history
    loadAnalysis: (analysis: any) => {
      set({
        resumeText: analysis.resume_text,
        jobDescription: analysis.job_description,
        analysisResult: {
          success: true,
          match_percentage: analysis.match_percentage,
          skill_analysis: analysis.skill_analysis,
          recommendations: analysis.recommendations,
          analysis_timestamp: analysis.created_at
        }
      });
      toast.success('Analysis loaded from history');
    }
  })
);