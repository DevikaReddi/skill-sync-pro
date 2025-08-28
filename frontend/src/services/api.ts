import axios, { AxiosError } from 'axios';
import { AnalysisRequest, AnalysisResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error: AxiosError) => {
    console.error('Response Error:', error.response?.status, error.message);
    
    // Don't treat OPTIONS as an error
    if (error.config?.method === 'options') {
      return Promise.resolve({ data: {} });
    }
    
    let message = 'An unexpected error occurred';
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = 'Invalid request. Please check your input.';
          break;
        case 422:
          message = 'Please ensure both texts are at least 50 characters long.';
          break;
        case 429:
          message = 'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
          message = 'Server error. Please try again later.';
          break;
        case 503:
          message = 'Service temporarily unavailable. Please try again later.';
          break;
      }
    } else if (error.request) {
      message = 'Cannot connect to server. Please check if the backend is running.';
    }
    
    return Promise.reject(new Error(message));
  }
);

// API methods
export const apiService = {
  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const response = await api.get('/health');
      return response.data.status === 'healthy';
    } catch {
      return false;
    }
  },
  
  // Analyze resume - with better error handling
  async analyzeResume(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const response = await api.post<AnalysisResponse>('/api/v1/analysis/analyze', request);
      
      // Validate response structure
      if (!response.data || typeof response.data.success === 'undefined') {
        throw new Error('Invalid response format from server');
      }
      
      return response.data;
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    }
  },
  
  // Get API status
  async getApiStatus(): Promise<{ status: string; version: string }> {
    const response = await api.get('/api/v1/analysis/status');
    return response.data;
  },
};

export default apiService;
