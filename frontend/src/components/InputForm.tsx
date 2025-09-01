import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DocumentTextIcon,
  BriefcaseIcon,
  SparklesIcon,
  ArrowRightIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { useAnalysisStore } from '../store/analysisStore';
import { useUIStore } from '../store/uiStore';
import toast from 'react-hot-toast';

const sampleData = {
  resume: `John Doe
Senior Full Stack Developer | 8+ Years Experience

TECHNICAL SKILLS:
- Languages: Python, JavaScript, TypeScript, Java, Go
- Frontend: React, Next.js, Vue.js, HTML5, CSS3, Tailwind CSS
- Backend: Node.js, Express, Django, FastAPI, Spring Boot
- Databases: PostgreSQL, MongoDB, Redis, MySQL
- Cloud/DevOps: AWS, Docker, Kubernetes, Jenkins, Terraform, CI/CD

PROFESSIONAL EXPERIENCE:
Senior Full Stack Developer | TechCorp Inc. | 2020-Present
- Led development of microservices architecture serving 1M+ users
- Implemented CI/CD pipelines reducing deployment time by 60%

Full Stack Developer | StartupXYZ | 2018-2020
- Developed React-based SPA with real-time features
- Designed and implemented PostgreSQL database schema

EDUCATION:
Bachelor of Science in Computer Science | State University | 2016`,

  jobDescription: `We are looking for a Senior Full Stack Developer to join our engineering team.

REQUIREMENTS:
- 5+ years of experience in full stack development
- Strong proficiency in Python and JavaScript/TypeScript
- Experience with React, Node.js, and modern web frameworks
- Solid understanding of PostgreSQL, MongoDB, and Redis
- Hands-on experience with AWS services (EC2, S3, RDS, Lambda)
- Experience with Docker, Kubernetes, and microservices architecture
- Knowledge of CI/CD pipelines and DevOps practices`
};

export const InputForm: React.FC = () => {
  const { 
    resumeText, 
    jobDescription, 
    setResumeText, 
    setJobDescription, 
    analyzeResume, 
    isAnalyzing 
  } = useAnalysisStore();
  
  const { setActiveTab } = useUIStore();
  const [activeInput, setActiveInput] = useState<'resume' | 'job' | null>(null);
  
  const handleAnalyze = async () => {
    await analyzeResume();
    if (resumeText && jobDescription) {
      setActiveTab('results');
    }
  };
  
  const loadSampleData = () => {
    setResumeText(sampleData.resume);
    setJobDescription(sampleData.jobDescription);
    toast.success('Sample data loaded!', { icon: '📝' });
  };
  
  const clearAll = () => {
    setResumeText('');
    setJobDescription('');
    toast.success('Fields cleared', { icon: '🗑️' });
  };
  
  const isValid = resumeText.length >= 50 && jobDescription.length >= 50;
  
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Info Bar */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start sm:items-center gap-2">
            <LightBulbIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 sm:mt-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Paste your resume and job description below for AI-powered analysis
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={loadSampleData}
              className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <DocumentDuplicateIcon className="inline h-4 w-4 mr-1" />
              Load Sample
            </button>
            <button
              onClick={clearAll}
              disabled={!resumeText && !jobDescription}
              className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 rounded border border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
            >
              <TrashIcon className="inline h-4 w-4 mr-1" />
              Clear All
            </button>
          </div>
        </div>
      </div>
      
      {/* Input Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Resume Input */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Your Resume</h3>
              </div>
              {resumeText && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(resumeText);
                    toast.success('Copied!');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Copy
                </button>
              )}
            </div>
          </div>
          <div className="p-4">
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume here..."
              className="w-full h-64 p-3 text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              spellCheck={false}
            />
            <div className="mt-2 flex items-center justify-between">
              <span className={`text-xs ${resumeText.length < 50 ? 'text-red-500' : 'text-gray-500'}`}>
                {resumeText.length} characters (min: 50)
              </span>
              {resumeText.length >= 50 && (
                <span className="text-xs text-green-600 dark:text-green-400">✓ Valid</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Job Description Input */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BriefcaseIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Job Description</h3>
              </div>
              {jobDescription && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(jobDescription);
                    toast.success('Copied!');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Copy
                </button>
              )}
            </div>
          </div>
          <div className="p-4">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full h-64 p-3 text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              spellCheck={false}
            />
            <div className="mt-2 flex items-center justify-between">
              <span className={`text-xs ${jobDescription.length < 50 ? 'text-red-500' : 'text-gray-500'}`}>
                {jobDescription.length} characters (min: 50)
              </span>
              {jobDescription.length >= 50 && (
                <span className="text-xs text-green-600 dark:text-green-400">✓ Valid</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Analyze Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleAnalyze}
          disabled={!isValid || isAnalyzing}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${
            isValid && !isAnalyzing 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Analyzing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5" />
              Analyze Match
              <ArrowRightIcon className="h-4 w-4" />
            </span>
          )}
        </button>
      </div>
      
      {/* Tips */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {[
          { emoji: '📝', title: 'Complete Resume', desc: 'Include all skills and experience' },
          { emoji: '🎯', title: 'Full Job Description', desc: 'Paste the complete JD' },
          { emoji: '✨', title: 'AI Analysis', desc: 'Get instant insights' }
        ].map((tip, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-xl mt-0.5">{tip.emoji}</span>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{tip.title}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
