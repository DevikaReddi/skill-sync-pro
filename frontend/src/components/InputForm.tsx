import React from 'react';
import { motion } from 'framer-motion';
import { DocumentTextIcon, BriefcaseIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAnalysisStore } from '../store/analysisStore';
import { useUIStore } from '../store/uiStore';
import { Icon } from './common/Icon';
import toast from 'react-hot-toast';

const SAMPLE_RESUME = `John Doe
Senior Software Engineer

SKILLS:
- Programming: Python, JavaScript, TypeScript, Java, Go
- Frontend: React, Vue.js, Next.js, HTML5, CSS3, Tailwind CSS
- Backend: Node.js, Express, Django, FastAPI, GraphQL
- Databases: PostgreSQL, MongoDB, Redis, MySQL
- Cloud & DevOps: AWS, Docker, Kubernetes, Jenkins, GitHub Actions
- Tools: Git, Jira, Confluence, VS Code, Linux

EXPERIENCE:
Senior Software Engineer at Tech Corp (2020-Present)
- Led development of microservices architecture using Node.js and Kubernetes
- Improved application performance by 40% through optimization
- Mentored junior developers and conducted code reviews

Software Engineer at StartupXYZ (2018-2020)
- Built RESTful APIs using Python and FastAPI
- Developed responsive web applications with React
- Implemented CI/CD pipelines using GitHub Actions

EDUCATION:
Bachelor of Science in Computer Science
University of Technology (2014-2018)`;

const SAMPLE_JD = `We are looking for a Full Stack Developer to join our growing team.

REQUIREMENTS:
- 3+ years of experience in full-stack development
- Strong proficiency in React and modern JavaScript/TypeScript
- Experience with Node.js and Express for backend development
- Knowledge of SQL and NoSQL databases (PostgreSQL, MongoDB)
- Experience with Docker and container orchestration (Kubernetes preferred)
- Familiarity with AWS cloud services
- Understanding of CI/CD pipelines and DevOps practices
- Experience with Agile development methodologies

NICE TO HAVE:
- Experience with GraphQL
- Knowledge of Python and machine learning frameworks
- Contribution to open-source projects
- Experience with microservices architecture

RESPONSIBILITIES:
- Design and develop scalable web applications
- Collaborate with cross-functional teams
- Write clean, maintainable code with proper documentation
- Participate in code reviews and technical discussions
- Troubleshoot and debug applications`;

export const InputForm: React.FC = () => {
  const { 
    resumeText, 
    jobDescription, 
    setResumeText, 
    setJobDescription, 
    analyzeResume, 
    isAnalyzing,
    error
  } = useAnalysisStore();
  
  const { setActiveTab } = useUIStore();
  
  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast.error('Please provide both resume and job description');
      return;
    }
    
    if (resumeText.length < 50 || jobDescription.length < 50) {
      toast.error('Both texts must be at least 50 characters long');
      return;
    }
    
    const promise = analyzeResume();
    
    toast.promise(promise, {
      loading: 'Analyzing your resume...',
      success: () => {
        setActiveTab('results');
        return 'Analysis complete!';
      },
      error: (err) => err.message || 'Analysis failed',
    });
  };
  
  const loadSampleData = () => {
    setResumeText(SAMPLE_RESUME);
    setJobDescription(SAMPLE_JD);
    toast.success('Sample data loaded!');
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analyze Your Resume Match
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Paste your resume and job description below to get instant AI-powered insights
          </p>
          <button
            onClick={loadSampleData}
            className="mt-3 inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Icon icon={SparklesIcon} size="xs" className="mr-1.5" />
            Load Sample Data
          </button>
        </div>
        
        {/* Input Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Resume Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-1.5"
          >
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <Icon icon={DocumentTextIcon} size="sm" className="mr-1.5" />
              <span>Your Resume</span>
              <span className="ml-auto text-xs text-gray-500">
                {resumeText.length} / 10000
              </span>
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume here..."
              className="w-full h-56 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none transition-all"
              maxLength={10000}
            />
          </motion.div>
          
          {/* Job Description Input */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-1.5"
          >
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <Icon icon={BriefcaseIcon} size="sm" className="mr-1.5" />
              <span>Job Description</span>
              <span className="ml-auto text-xs text-gray-500">
                {jobDescription.length} / 10000
              </span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full h-56 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none transition-all"
              maxLength={10000}
            />
          </motion.div>
        </div>
        
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}
        
        {/* Analyze Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center"
        >
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !resumeText.trim() || !jobDescription.trim()}
            className={`
              inline-flex items-center px-6 py-2.5 text-sm font-medium rounded-lg
              transition-all duration-200 transform hover:scale-105
              ${isAnalyzing || !resumeText.trim() || !jobDescription.trim()
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md'
              }
            `}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <Icon icon={SparklesIcon} size="sm" className="mr-1.5" />
                Analyze Match
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};
