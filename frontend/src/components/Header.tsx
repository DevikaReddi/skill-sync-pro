import React from 'react';
import { motion } from 'framer-motion';
import { 
  SunIcon, 
  MoonIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { useUIStore } from '../store/uiStore';

export const Header: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useUIStore();
  
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-lg opacity-50"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <CodeBracketIcon className="h-6 w-6 text-white flex-shrink-0" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SkillSync Pro
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Resume Analyzer</p>
            </div>
          </motion.div>
          
          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden sm:flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2 flex-shrink-0"></div>
              <span className="text-xs font-medium text-green-700 dark:text-green-400">AI Ready</span>
            </motion.div>
            
            {/* Dark Mode Toggle */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={toggleDarkMode}
              className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 group"
              aria-label="Toggle dark mode"
            >
              <div className="relative w-5 h-5">
                <SunIcon className={`absolute inset-0 h-5 w-5 text-yellow-500 transition-all duration-300 ${isDarkMode ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'}`} />
                <MoonIcon className={`absolute inset-0 h-5 w-5 text-blue-500 transition-all duration-300 ${isDarkMode ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'}`} />
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
};
