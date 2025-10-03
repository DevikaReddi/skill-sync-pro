import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SunIcon, 
  MoonIcon,
  CodeBracketIcon,
  SparklesIcon,
  ChartBarIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { AuthModal } from './AuthModal';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { UserDashboard } from './UserDashboard';
import { useAnalysisStore } from '../store/analysisStore';

export const Header: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useUIStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardView, setDashboardView] = useState<'analyses' | 'settings'>('analyses');
  const { todayAnalysisCount, fetchTodayCount } = useAnalysisStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTodayCount();
    }
  }, [isAuthenticated]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`
        sticky top-0 z-50 transition-all duration-500
        ${scrolled 
          ? 'backdrop-blur-2xl bg-white/70 dark:bg-gray-900/70 shadow-2xl' 
          : 'backdrop-blur-xl bg-white/50 dark:bg-gray-900/50'
        }
        border-b border-white/20 dark:border-gray-800/30
      `}
    >
      {/* Premium Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section with Premium Effects */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            {/* Animated Logo */}
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative group cursor-pointer"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              
              {/* Logo Container */}
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <CodeBracketIcon className="h-6 w-6 text-white" />
                </motion.div>
              </div>

              {/* Floating Particles */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-1 w-1 bg-purple-400 rounded-full"
                  animate={{
                    y: [-10, -30, -10],
                    x: [0, (i - 1) * 10, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                />
              ))}
            </motion.div>

            {/* Brand Name with Gradient */}
            <div>
              <motion.h1 
                className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                style={{ backgroundSize: '200% 200%' }}
              >
                SkillSync Pro
              </motion.h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <SparklesIcon className="h-3 w-3 mr-1 text-purple-500" />
                AI-Powered Analysis Platform
              </p>
            </div>
          </motion.div>
          
          {/* Center Section - Time Display (Premium) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden md:flex items-center space-x-4"
          >
            <div className="px-4 py-1.5 rounded-xl backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/30">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {formatTime(currentTime)}
              </span>
            </div>
            
            {/* Status Badge with Pulse */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center px-3 py-1.5 rounded-xl backdrop-blur-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mr-2"
              />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">
                AI Ready
              </span>
            </motion.div>
          </motion.div>

          {/* Right Section with Premium Controls */}
          <div className="flex items-center space-x-3">

            <motion.button
              whileHover={{ x: 5 }}
              onClick={() => {
                setDashboardView('analyses');
                setShowDashboard(true);
                setShowUserMenu(false);
              }}
              className="flex items-center w-full px-3 py-2 text-sm rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2 text-blue-500" />
              My Analyses
            </motion.button>

            {/* Dark Mode Toggle - Fixed */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleDarkMode}
                  className="relative p-2.5 rounded-xl backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border border-white/20 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300"
                  aria-label="Toggle dark mode"
                >
                  <AnimatePresence mode="wait">
                    {isDarkMode ? (
                      <motion.div
                        key="dark"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <SunIcon className="h-5 w-5 text-yellow-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="light"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <MoonIcon className="h-5 w-5 text-gray-700" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

            {/* User Menu with Glassmorphism */}
            {isAuthenticated ? (
              <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-xl backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/30 hover:bg-white/40 dark:hover:bg-gray-800/40"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <UserCircleIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.username || 'User'}
                  </span>
                  </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden"
                    >
                      <div className="p-2">
                        <motion.button
                          whileHover={{ x: 5 }}
                          onClick={logout}
                          className="flex items-center w-full px-3 py-2 text-sm rounded-lg hover:bg-red-100/50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                          Logout
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    Sign In
                  </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Premium Bottom Gradient Shadow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <UserDashboard 
        isOpen={showDashboard} 
        onClose={() => setShowDashboard(false)}
        initialView={dashboardView}
      />
    </motion.header>
  );
};