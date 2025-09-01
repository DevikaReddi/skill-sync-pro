import axios from 'axios';
import { authService } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface DashboardData {
  total_analyses: number;
  recent_count: number;
  average_match: number;
  best_match: number;
  improvement: number;
  skill_frequency: Record<string, number>;
  progress_chart: Array<{
    date: string;
    match_percentage: number;
    title: string;
  }>;
  top_matching_skills: Array<{ name: string; count: number }>;
  common_skill_gaps: Array<{ name: string; count: number }>;
  last_analysis_date: string | null;
}

interface SkillTrends {
  trending_up: string[];
  trending_down: string[];
  stable: string[];
}

class AnalyticsService {
  async getDashboard(): Promise<DashboardData | null> {
    if (!authService.isAuthenticated()) return null;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/analytics/dashboard`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      return null;
    }
  }

  async getSkillTrends(days: number = 30): Promise<SkillTrends | null> {
    if (!authService.isAuthenticated()) return null;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/analytics/trends`, {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch trends:', error);
      return null;
    }
  }

  async exportAnalytics(format: 'json' | 'csv' = 'json'): Promise<void> {
    if (!authService.isAuthenticated()) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/analytics/export`, {
        params: { format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      if (format === 'csv') {
        // Download CSV file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'analytics.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // Download JSON file
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', 'analytics.json');
        link.click();
      }
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();
