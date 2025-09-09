import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface UploadResponse {
  success: boolean;
  filename: string;
  text: string;
  character_count: number;
  content_type?: string;
}

class UploadService {
  private async uploadFile(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post<UploadResponse>(
        `${API_BASE_URL}${endpoint}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress?.(progress);
            }
          },
        }
      );

      if (!response.data.success) {
        throw new Error('Upload failed');
      }

      return response.data;
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 413) {
        throw new Error('File size exceeds the maximum limit');
      } else if (error.response?.status === 415) {
        throw new Error('File type not supported. Please upload PDF or TXT files only');
      } else if (error.response?.status === 422) {
        throw new Error('Could not extract text from the document. Please ensure it\'s a valid resume');
      } else if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to upload file. Please try again');
      }
    }
  }

  async uploadResume(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    // Validate file on client side first
    const validTypes = ['application/pdf', 'text/plain'];
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.txt') && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Please upload a PDF or TXT file');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('Resume file size must be less than 10MB');
    }

    const response = await this.uploadFile(
      '/api/v1/upload/resume',
      file,
      onProgress
    );

    // Validate extracted text
    if (!response.text || response.character_count < 100) {
      throw new Error('The document appears to be empty or too short. Please upload a complete resume');
    }

    // Check if it looks like a resume (basic validation)
    const resumeKeywords = ['experience', 'education', 'skills', 'work', 'summary', 'objective'];
    const textLower = response.text.toLowerCase();
    const hasResumeContent = resumeKeywords.some(keyword => textLower.includes(keyword));

    if (!hasResumeContent) {
      throw new Error('The document doesn\'t appear to be a resume. Please upload a valid resume');
    }

    return response.text;
  }

  async uploadJobDescription(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    // Validate file on client side
    const validTypes = ['application/pdf', 'text/plain'];
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.txt') && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Please upload a PDF or TXT file');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Job description file size must be less than 5MB');
    }

    const response = await this.uploadFile(
      '/api/v1/upload/job-description',
      file,
      onProgress
    );

    // Validate extracted text
    if (!response.text || response.character_count < 50) {
      throw new Error('The document appears to be empty or too short');
    }

    // Basic validation for job description
    const jobKeywords = ['requirements', 'responsibilities', 'qualification', 'experience', 'skills', 'position', 'role'];
    const textLower = response.text.toLowerCase();
    const hasJobContent = jobKeywords.some(keyword => textLower.includes(keyword));

    if (!hasJobContent) {
      throw new Error('The document doesn\'t appear to be a job description');
    }

    return response.text;
  }

  // Helper method to extract key information (for future use)
  extractResumeHighlights(resumeText: string): {
    name?: string;
    email?: string;
    skills?: string[];
    experience?: string;
  } {
    const lines = resumeText.split('\n').filter(line => line.trim());
    
    // Try to extract name (usually first line)
    const name = lines[0]?.trim();

    // Extract email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const emailMatch = resumeText.match(emailRegex);
    const email = emailMatch?.[0];

    // Extract skills section
    const skillsMatch = resumeText.match(/skills?:?\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i);
    const skillsText = skillsMatch?.[1];
    const skills = skillsText
      ?.split(/[,\n•·\|]/)
      .map(s => s.trim())
      .filter(s => s.length > 1 && s.length < 30);

    // Extract years of experience
    const expMatch = resumeText.match(/(\d+)\+?\s*years?\s*(?:of\s+)?experience/i);
    const experience = expMatch?.[0];

    return { name, email, skills, experience };
  }
}

export const uploadService = new UploadService();