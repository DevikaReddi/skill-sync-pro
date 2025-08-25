import React from 'react';
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useUIStore } from '../store/uiStore';
import { Icon } from './common/Icon';
import { motion } from 'framer-motion';

export const Header: React.FC = () => {
  const { isDarkMode, toggleDarkMode, isMobileMenuOpen, toggleMobileMenu } = useUIStore();
  
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm transition-colors duration-300 sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SkillSync Pro
            </span>
            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              BETA
            </span>
          </motion.div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="#features" className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              How it Works
            </a>
            <a href="https://github.com/DevikaReddi/skill-sync-pro" target="_blank" rel="noopener noreferrer" 
               className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              GitHub
            </a>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              <Icon icon={isDarkMode ? SunIcon : MoonIcon} size="sm" />
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              aria-label="Toggle dark mode"
            >
              <Icon icon={isDarkMode ? SunIcon : MoonIcon} size="sm" />
            </button>
            <button
              onClick={toggleMobileMenu}
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              aria-label="Toggle menu"
            >
              <Icon icon={isMobileMenuOpen ? XMarkIcon : Bars3Icon} size="sm" />
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden py-3 space-y-1 border-t border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <a href="#features" className="block py-1.5 text-sm text-gray-700 dark:text-gray-300">Features</a>
            <a href="#how-it-works" className="block py-1.5 text-sm text-gray-700 dark:text-gray-300">How it Works</a>
            <a href="https://github.com/DevikaReddi/skill-sync-pro" className="block py-1.5 text-sm text-gray-700 dark:text-gray-300">GitHub</a>
          </motion.div>
        )}
      </nav>
    </header>
  );
};
