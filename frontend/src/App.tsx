import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { Results } from './components/Results';
import { LoadingAnimation } from './components/LoadingAnimation';
import { useUIStore } from './store/uiStore';
import { useAnalysisStore } from './store/analysisStore';
import apiService from './services/api';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { isDarkMode, activeTab } = useUIStore();
  const { analysisResult, isAnalyzing } = useAnalysisStore();
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Check API health
  useEffect(() => {
    const checkAPI = async () => {
      try {
        const isHealthy = await apiService.checkHealth();
        setApiStatus(isHealthy ? 'online' : 'offline');
      } catch {
        setApiStatus('offline');
      }
    };
    
    checkAPI();
    const interval = setInterval(checkAPI, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />
        
        {/* Floating Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='%23000000' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            color: isDarkMode ? '#fff' : '#1f2937',
            fontSize: '14px',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
            padding: '12px 20px',
          },
        }}
      />
      
      {/* Loading Animation */}
      <AnimatePresence>
        {isAnalyzing && <LoadingAnimation message="AI is analyzing your documents..." />}
      </AnimatePresence>
      
      {/* Header */}
      <Header />
      
      {/* API Status Banner */}
      {apiStatus === 'offline' && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 text-center text-sm"
        >
          ⚠️ API is currently offline. Some features may not work.
        </motion.div>
      )}
      
      {/* Main Content */}
      <main className="relative pb-20">
        {/* Smart Tab Navigation - Only show after analysis */}
        <AnimatePresence>
          {analysisResult && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="sticky top-16 z-40 py-4 backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-b border-white/20 dark:border-gray-800/30"
            >
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-center">
                  <div className="inline-flex p-1 rounded-2xl backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-700/30 shadow-xl">
                    {[
                      { id: 'input', label: 'New Analysis', icon: '📝' },
                      { id: 'results', label: 'View Results', icon: '📊' }
                    ].map((tab) => (
                      <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => useUIStore.getState().setActiveTab(tab.id as any)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Page Content */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'input' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'input' ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
          >
            {activeTab === 'input' ? <InputForm /> : <Results />}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Simplified Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-t border-white/20 dark:border-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
          <span>© 2024 SkillSync Pro</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
              API {apiStatus}
            </span>
            <span>v4.1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;