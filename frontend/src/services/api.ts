import axios, { AxiosError, AxiosInstance } from 'axios';
import { AnalysisRequest, AnalysisResponse } from '../types';
import { authService } from './auth';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: any[] = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log in development
        if (import.meta.env.DEV) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        if (import.meta.env.DEV) {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => this.api(originalRequest));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Try to refresh token or logout
            await authService.logout();
            this.processQueue(null);
            
            // Show login modal
            window.dispatchEvent(new CustomEvent('show-auth-modal'));
            
            return Promise.reject(error);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle specific error codes
        if (error.response) {
          const { status, data } = error.response;
          let message = (data as any)?.detail || 'An error occurred';

          switch (status) {
            case 400:
              message = 'Invalid request. Please check your input.';
              break;
            case 403:
              message = 'Access denied. Please login.';
              break;
            case 404:
              message = 'Resource not found.';
              break;
            case 422:
              message = 'Please ensure both texts are at least 50 characters long.';
              break;
            case 429:
              message = 'Too many requests. Please wait a moment.';
              break;
            case 500:
            case 502:
            case 503:
              message = 'Server error. Please try again later.';
              break;
          }

          // Don't show toast for OPTIONS requests
          if (error.config?.method !== 'options') {
            toast.error(message, {
              id: 'api-error',
              duration: 5000,
            });
          }
        } else if (error.request) {
          // Network error
          toast.error('Network error. Please check your connection.', {
            id: 'network-error',
          });
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(token: string | null) {
    this.failedQueue.forEach((promise) => {
      if (token) {
        promise.resolve();
      } else {
        promise.reject();
      }
    });
    this.failedQueue = [];
  }

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      return response.data.status === 'healthy';
    } catch {
      return false;
    }
  }

  // Analysis endpoints
  async analyzeResume(request: AnalysisRequest): Promise<AnalysisResponse> {
    const response = await this.api.post<AnalysisResponse>(
      '/api/v1/analysis/analyze',
      request
    );
    
    if (!response.data || typeof response.data.success === 'undefined') {
      throw new Error('Invalid response format from server');
    }
    
    return response.data;
  }

  async getAnalysisStatus(): Promise<{ status: string; version: string }> {
    const response = await this.api.get('/api/v1/analysis/status');
    return response.data;
  }

  // History endpoints (for authenticated users)
  async saveAnalysis(analysisData: any): Promise<any> {
    const response = await this.api.post('/api/v1/history/save', analysisData);
    return response.data;
  }

  async getAnalysisHistory(skip = 0, limit = 10): Promise<any[]> {
    const response = await this.api.get('/api/v1/history/list', {
      params: { skip, limit }
    });
    return response.data;
  }

  async deleteAnalysis(id: number): Promise<void> {
    await this.api.delete(`/api/v1/history/${id}`);
  }

  // Analytics endpoints
  async getDashboard(): Promise<any> {
    const response = await this.api.get('/api/v1/analytics/dashboard');
    return response.data;
  }

  async getSkillTrends(days = 30): Promise<any> {
    const response = await this.api.get('/api/v1/analytics/trends', {
      params: { days }
    });
    return response.data;
  }

  // Advanced features
  async getSimilarSkills(skill: string, limit = 5): Promise<any> {
    const response = await this.api.post('/api/v1/recommendations/similar-skills', {
      skill,
      limit
    });
    return response.data;
  }

  async getLearningPath(targetSkill: string, currentSkills: string[]): Promise<any> {
    const response = await this.api.post('/api/v1/recommendations/learning-path', {
      target_skill: targetSkill,
      current_skills: currentSkills
    });
    return response.data;
  }

  // Upload endpoints
  async uploadResume(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post('/api/v1/upload/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data.text;
  }

  async uploadJobDescription(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post('/api/v1/upload/job-description', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data.text;
  }
}

export const apiService = new ApiService();
export default apiService;