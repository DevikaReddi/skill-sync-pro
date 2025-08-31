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
- Tools: Git, Jira, Confluence, VS Code, Postman

PROFESSIONAL EXPERIENCE:
Senior Full Stack Developer | TechCorp Inc. | 2020-Present
- Led development of microservices architecture serving 1M+ users
- Implemented CI/CD pipelines reducing deployment time by 60%
- Mentored team of 5 junior developers
- Built scalable REST APIs using Node.js and Python

Full Stack Developer | StartupXYZ | 2018-2020
- Developed React-based SPA with real-time features
- Designed and implemented PostgreSQL database schema
- Integrated third-party APIs and payment gateways
- Improved application performance by 40%

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
- Knowledge of CI/CD pipelines and DevOps practices
- Experience with Agile/Scrum methodologies
- Strong problem-solving and communication skills

NICE TO HAVE:
- Experience with machine learning and data science
- Knowledge of GraphQL and WebSocket
- Contributions to open-source projects
- Experience with serverless architecture
- Cloud certifications (AWS/Azure/GCP)`
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
    toast.success('Sample data loaded! Click "Analyze Match" to see results.', {
      duration: 3000,
      icon: '📝'
    });
  };
  
  const clearAll = () => {
    setResumeText('');
    setJobDescription('');
    toast.success('All fields cleared', { icon: '🗑️' });
  };
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`, { icon: '📋' });
  };
  
  const isValid = resumeText.length >= 50 && jobDescription.length >= 50;
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
          <div className="flex items-center space-x-2">
            <LightBulbIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Paste your resume and job description below for AI-powered analysis
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadSampleData}
              className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700"
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              Load Sample
            </button>
            <button
              onClick={clearAll}
              disabled={!resumeText && !jobDescription}
              className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 rounded-lg hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrashIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              Clear All
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* Input Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Resume Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`relative group ${activeInput === 'resume' ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Your Resume</h3>
                </div>
                {resumeText && (
                  <button
                    onClick={() => copyToClipboard(resumeText, 'Resume')}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>
            <div className="p-5">
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                onFocus={() => setActiveInput('resume')}
                onBlur={() => setActiveInput(null)}
                placeholder="Paste your resume here..."
                className="w-full h-80 p-4 text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 custom-scrollbar"
                spellCheck={false}
              />
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-xs ${resumeText.length < 50 ? 'text-red-500' : 'text-gray-500'}`}>
                  {resumeText.length} characters (min: 50)
                </span>
                {resumeText.length >= 50 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center text-xs text-green-600 dark:text-green-400"
                  >
                    <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Valid
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Job Description Input */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`relative group ${activeInput === 'job' ? 'ring-2 ring-purple-500' : ''}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BriefcaseIcon className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Job Description</h3>
                </div>
                {jobDescription && (
                  <button
                    onClick={() => copyToClipboard(jobDescription, 'Job Description')}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>
            <div className="p-5">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                onFocus={() => setActiveInput('job')}
                onBlur={() => setActiveInput(null)}
                placeholder="Paste the job description here..."
                className="w-full h-80 p-4 text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200 custom-scrollbar"
                spellCheck={false}
              />
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-xs ${jobDescription.length < 50 ? 'text-red-500' : 'text-gray-500'}`}>
                  {jobDescription.length} characters (min: 50)
                </span>
                {jobDescription.length >= 50 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center text-xs text-green-600 dark:text-green-400"
                  >
                    <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Valid
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Analyze Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex justify-center"
      >
        <button
          onClick={handleAnalyze}
          disabled={!isValid || isAnalyzing}
          className={`
            relative group px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300
            ${isValid && !isAnalyzing 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-xl' 
              : 'bg-gray-400 cursor-not-allowed'
            }
          `}
        >
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                <span>Analyzing...</span>
              </motion.div>
            ) : (
              <motion.div
                key="analyze"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-3"
              >
                <SparklesIcon className="h-5 w-5 flex-shrink-0" />
                <span>Analyze Match</span>
                <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {isValid && !isAnalyzing && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          )}
        </button>
      </motion.div>
      
      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 grid md:grid-cols-3 gap-4"
      >
        {[
          { icon: '📝', title: 'Complete Resume', desc: 'Include all skills and experience' },
          { icon: '🎯', title: 'Full Job Description', desc: 'Paste the complete JD for best results' },
          { icon: '✨', title: 'AI Analysis', desc: 'Get instant skill gap insights' }
        ].map((tip, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-2xl flex-shrink-0">{tip.icon}</span>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{tip.title}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">{tip.desc}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
