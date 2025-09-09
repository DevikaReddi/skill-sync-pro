import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { Results } from './components/Results';
import { useUIStore } from './store/uiStore';
import { useAnalysisStore } from './store/analysisStore';
import apiService from './services/api';
import { motion } from 'framer-motion';

const gridOverlayStyle = {
  backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"%3E%3Cpath d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23grid)"/%3E%3C/svg%3E')`,
};


function App() {
  const { isDarkMode, activeTab } = useUIStore();
  const { analysisResult } = useAnalysisStore();
  
  // Apply dark mode class to HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Check API health on mount
  useEffect(() => {
    apiService.checkHealth().then((isHealthy) => {
      if (!isHealthy) {
        console.warn('API is not responding');
      }
    });
  }, []);
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Premium Background */}
      <div className="fixed inset-0 -z-10">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />
        
        {/* Animated Orbs */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Mesh Gradient Overlay */}
       <div
  className="absolute inset-0 opacity-50"
  style={gridOverlayStyle}
/>

      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            color: isDarkMode ? '#fff' : '#1f2937',
            fontSize: '14px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Header />
      
      <main className="flex-1 pb-12">
        {/* Premium Tab Navigation */}
        {analysisResult && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-4 py-6"
          >
            <div className="flex justify-center">
              <div className="inline-flex p-1 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-gray-900/30 border border-white/20 dark:border-gray-700/30 shadow-xl">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => useUIStore.getState().setActiveTab('input')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'input'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  Input
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => useUIStore.getState().setActiveTab('results')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'results'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  Results
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Content with Animation */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'input' ? <InputForm /> : <Results />}
        </motion.div>
      </main>
      
      {/* Premium Footer */}
      <footer className="mt-auto py-6 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30 border-t border-white/20 dark:border-gray-800/30">
        <div className="text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            © 2024 SkillSync Pro • Built with React, FastAPI & AI
          </p>
          <motion.div 
            className="mt-2 flex justify-center items-center gap-1"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-xs text-gray-500">Made with</span>
            <span className="text-red-500">❤️</span>
            <span className="text-xs text-gray-500">and AI</span>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}

export default App;