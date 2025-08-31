import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { Results } from './components/Results';
import { useUIStore } from './store/uiStore';
import { useAnalysisStore } from './store/analysisStore';
import apiService from './services/api';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-300">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDarkMode ? '#1f2937' : '#fff',
            color: isDarkMode ? '#fff' : '#1f2937',
            fontSize: '14px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
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
        {/* Tab Navigation - Only show when there are results */}
        {analysisResult && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-center">
              <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
                <button
                  onClick={() => useUIStore.getState().setActiveTab('input')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'input'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Input
                </button>
                <button
                  onClick={() => useUIStore.getState().setActiveTab('results')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'results'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Results
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="transition-all duration-300">
          {activeTab === 'input' ? <InputForm /> : <Results />}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
        <p>© 2024 SkillSync Pro • Built with React, FastAPI & AI • Made with ❤️</p>
      </footer>
    </div>
  );
}

export default App;
