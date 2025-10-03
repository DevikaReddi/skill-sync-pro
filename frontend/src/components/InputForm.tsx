import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DocumentTextIcon,
  BriefcaseIcon,
  SparklesIcon,
  ArrowRightIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  CloudArrowUpIcon,
  PencilSquareIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import { useAnalysisStore } from '../store/analysisStore';
import { useUIStore } from '../store/uiStore';
import { FileUpload } from './FileUpload';
import { uploadService } from '../services/uploadService';
import toast from 'react-hot-toast';

// Individual input modes for each field
type InputMode = 'upload' | 'manual';

interface InputModes {
  resume: InputMode;
  job: InputMode;
}

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
  const [inputModes, setInputModes] = useState<InputModes>({
    resume: 'upload',
    job: 'upload'
  });
  const [isUploading, setIsUploading] = useState({ resume: false, job: false });
  
  const toggleResumeMode = () => {
    setInputModes(prev => ({
      ...prev,
      resume: prev.resume === 'upload' ? 'manual' : 'upload'
    }));
  };
  
  const toggleJobMode = () => {
    setInputModes(prev => ({
      ...prev,
      job: prev.job === 'upload' ? 'manual' : 'upload'
    }));
  };
  
  const handleResumeUpload = async (file: File) => {
    setIsUploading(prev => ({ ...prev, resume: true }));
    try {
      const extractedText = await uploadService.uploadResume(file);
      setResumeText(extractedText);
      toast.success('Resume uploaded successfully!', {
        icon: '📄',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        }
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload resume');
      throw error;
    } finally {
      setIsUploading(prev => ({ ...prev, resume: false }));
    }
  };

  const handleJobUpload = async (file: File) => {
    setIsUploading(prev => ({ ...prev, job: true }));
    try {
      const extractedText = await uploadService.uploadJobDescription(file);
      setJobDescription(extractedText);
      toast.success('Job description uploaded successfully!', {
        icon: '💼',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        }
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload job description');
      throw error;
    } finally {
      setIsUploading(prev => ({ ...prev, job: false }));
    }
  };
  
  const handleAnalyze = async () => {
    await analyzeResume();
    if (resumeText && jobDescription) {
      setActiveTab('results');
    }
  };
  
  
  const clearAll = () => {
    setResumeText('');
    setJobDescription('');
    toast.success('All fields cleared', { 
      icon: '🧹',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      }
    });
  };
  
  const isValid = resumeText.length >= 50 && jobDescription.length >= 50;
  
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Premium Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center relative"
      >
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl animate-gradient" />
        </div>
        
        <motion.h1 
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3"
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        >
          AI-Powered Resume Analysis
        </motion.h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Upload or paste your documents for instant AI insights
        </p>
      </motion.div>

       {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex justify-center gap-3"
      >
        {/* Only keep the Clear All button */}
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearAll}
          disabled={!resumeText && !jobDescription}
          className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border border-white/20 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <TrashIcon className="inline h-4 w-4 mr-2 text-red-500" />
          <span className="text-sm font-medium">Clear All</span>
        </motion.button>
      </motion.div>

      {/* Main Input Grid with Mixed Mode Support */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Resume Input */}
        <div className="space-y-3">
          {/* Mode Toggle for Resume */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
              Your Resume
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleResumeMode}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-sm font-medium"
            >
              <ArrowsRightLeftIcon  className="h-4 w-4" />
              {inputModes.resume === 'upload' ? 'Switch to Text' : 'Switch to Upload'}
            </motion.button>
          </div>

          {/* Conditional Input */}
          <AnimatePresence mode="wait">
            {inputModes.resume === 'upload' ? (
              <motion.div
                key="resume-upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <FileUpload
                  label=""
                  type="resume"
                  onFileSelect={handleResumeUpload}
                  onTextExtracted={setResumeText}
                  maxSize={10}
                />
              </motion.div>
            ) : (
              <motion.div
                key="resume-text"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                <div className="relative p-6">
                  {/* Resume textarea - Fixed dark mode text color */}
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume here..."
                    className="w-full h-[450px] p-4 rounded-xl backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border border-white/20 dark:border-gray-700/30 shadow-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />

                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-xs ${resumeText.length < 50 ? 'text-red-500' : 'text-gray-500'}`}>
                      {resumeText.length} characters (min: 50)
                    </span>
                    {resumeText.length >= 50 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-xs text-green-600 dark:text-green-400 font-medium"
                      >
                        ✓ Valid
                      </motion.span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Job Description Input */}
        <div className="space-y-3">
          {/* Mode Toggle for Job Description */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <BriefcaseIcon className="h-5 w-5 mr-2 text-green-500" />
              Job Description
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleJobMode}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20 text-sm font-medium"
            >
              <ArrowsRightLeftIcon  className="h-4 w-4" />
              {inputModes.job === 'upload' ? 'Switch to Text' : 'Switch to Upload'}
            </motion.button>
          </div>

          {/* Conditional Input */}
          <AnimatePresence mode="wait">
            {inputModes.job === 'upload' ? (
              <motion.div
                key="job-upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <FileUpload
                  label=""
                  type="job"
                  onFileSelect={handleJobUpload}
                  onTextExtracted={setJobDescription}
                  maxSize={5}
                />
              </motion.div>
            ) : (
              <motion.div
                key="job-text"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10" />
                <div className="relative p-6">
                {/* Job Description textarea - Fixed dark mode text color */}
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    className="w-full h-[450px] p-4 rounded-xl backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border border-white/20 dark:border-gray-700/30 shadow-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-xs ${jobDescription.length < 50 ? 'text-red-500' : 'text-gray-500'}`}>
                      {jobDescription.length} characters (min: 50)
                    </span>
                    {jobDescription.length >= 50 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-xs text-green-600 dark:text-green-400 font-medium"
                      >
                        ✓ Valid
                      </motion.span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Status Indicators */}
      {(resumeText || jobDescription) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex justify-center gap-4"
        >
          <div className={`px-4 py-2 rounded-xl backdrop-blur-xl ${
            resumeText ? 'bg-green-500/20 border border-green-500/30' : 'bg-gray-500/20 border border-gray-500/30'
          }`}>
            <span className="text-sm font-medium">
              {resumeText ? '✓ Resume Ready' : '○ Resume Required'}
            </span>
          </div>
          <div className={`px-4 py-2 rounded-xl backdrop-blur-xl ${
            jobDescription ? 'bg-green-500/20 border border-green-500/30' : 'bg-gray-500/20 border border-gray-500/30'
          }`}>
            <span className="text-sm font-medium">
              {jobDescription ? '✓ Job Description Ready' : '○ Job Description Required'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Analyze Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 flex justify-center"
      >
        {/* Analyze Button - Fixed */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAnalyze}
          disabled={!isValid || isAnalyzing}
          className={`
            w-full py-4 rounded-xl font-semibold text-white shadow-xl 
            hover:shadow-2xl transition-all duration-300
            ${isValid && !isAnalyzing
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
              : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50'
            }
          `}
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
              Analyzing...
            </span>
          ) : (
            <>
              <SparklesIcon className="inline h-5 w-5 mr-2" />
              Analyze Match
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};