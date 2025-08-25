import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  LightBulbIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useAnalysisStore } from '../store/analysisStore';
import { useUIStore } from '../store/uiStore';
import { Icon } from './common/Icon';

export const Results: React.FC = () => {
  const { analysisResult, resetAnalysis } = useAnalysisStore();
  const { setActiveTab } = useUIStore();
  
  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-gray-500 dark:text-gray-400 text-sm">No analysis results yet</p>
        <button
          onClick={() => setActiveTab('input')}
          className="mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Go to Input
        </button>
      </div>
    );
  }
  
  const { match_percentage, skill_analysis, recommendations, processing_time_ms } = analysisResult;
  
  const getMatchLevel = (percentage: number) => {
    if (percentage >= 80) return { level: 'Excellent', color: 'green' };
    if (percentage >= 60) return { level: 'Good', color: 'blue' };
    if (percentage >= 40) return { level: 'Fair', color: 'yellow' };
    return { level: 'Low', color: 'red' };
  };
  
  const matchLevel = getMatchLevel(match_percentage);
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab('input')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <Icon icon={ArrowLeftIcon} size="sm" className="mr-1" />
            Back to Input
          </button>
          <button
            onClick={resetAnalysis}
            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
          >
            Clear Results
          </button>
        </div>
        
        {/* Match Score Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 text-center"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Your Match Score
          </h2>
          
          {/* Circular Progress */}
          <div className="relative inline-flex items-center justify-center mb-3">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${match_percentage * 3.01} 301`}
                className={`
                  transition-all duration-1000 ease-out
                  ${matchLevel.color === 'green' ? 'text-green-500' : ''}
                  ${matchLevel.color === 'blue' ? 'text-blue-500' : ''}
                  ${matchLevel.color === 'yellow' ? 'text-yellow-500' : ''}
                  ${matchLevel.color === 'red' ? 'text-red-500' : ''}
                `}
              />
            </svg>
            <div className="absolute">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {match_percentage.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <p className={`text-lg font-semibold
            ${matchLevel.color === 'green' ? 'text-green-600 dark:text-green-400' : ''}
            ${matchLevel.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : ''}
            ${matchLevel.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' : ''}
            ${matchLevel.color === 'red' ? 'text-red-600 dark:text-red-400' : ''}
          `}>
            {matchLevel.level} Match
          </p>
          
          {processing_time_ms && (
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <Icon icon={ClockIcon} size="xs" className="mr-1" />
              Analyzed in {processing_time_ms}ms
            </p>
          )}
        </motion.div>
        
        {/* Skills Analysis Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Matching Skills */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
          >
            <div className="flex items-center mb-3">
              <Icon icon={CheckCircleIcon} size="md" className="text-green-500 mr-1.5" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Matching Skills ({skill_analysis.matching_skills.length})
              </h3>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {skill_analysis.matching_skills.length > 0 ? (
                skill_analysis.matching_skills.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-1.5 bg-green-50 dark:bg-green-900/20 rounded-md"
                  >
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {skill.name}
                    </span>
                    {skill.category && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full">
                        {skill.category}
                      </span>
                    )}
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-xs">No matching skills found</p>
              )}
            </div>
          </motion.div>
          
          {/* Skill Gaps */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
          >
            <div className="flex items-center mb-3">
              <Icon icon={XCircleIcon} size="md" className="text-red-500 mr-1.5" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Skill Gaps ({skill_analysis.skill_gaps.length})
              </h3>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {skill_analysis.skill_gaps.length > 0 ? (
                skill_analysis.skill_gaps.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-1.5 bg-red-50 dark:bg-red-900/20 rounded-md"
                  >
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {skill.name}
                    </span>
                    {skill.category && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-full">
                        {skill.category}
                      </span>
                    )}
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-xs">No skill gaps identified</p>
              )}
            </div>
          </motion.div>
          
          {/* Unique Skills */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
          >
            <div className="flex items-center mb-3">
              <Icon icon={ChartBarIcon} size="md" className="text-blue-500 mr-1.5" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Your Unique Skills ({skill_analysis.unique_skills.length})
              </h3>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {skill_analysis.unique_skills.length > 0 ? (
                skill_analysis.unique_skills.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md"
                  >
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {skill.name}
                    </span>
                    {skill.category && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full">
                        {skill.category}
                      </span>
                    )}
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-xs">No unique skills found</p>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4"
          >
            <div className="flex items-center mb-3">
              <Icon icon={LightBulbIcon} size="md" className="text-purple-500 mr-1.5" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Recommendations
              </h3>
            </div>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <motion.li
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                  className="flex items-start"
                >
                  <span className="inline-block w-4 h-4 mr-1.5 text-purple-600 dark:text-purple-400 text-xs">
                    •
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{rec}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
