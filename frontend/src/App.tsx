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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDarkMode ? '#1f2937' : '#fff',
            color: isDarkMode ? '#fff' : '#1f2937',
            fontSize: '14px',
          },
        }}
      />
      
      <Header />
      
      <main className="flex-1 container mx-auto py-4 sm:py-6">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-white dark:bg-gray-800">
            <button
              onClick={() => useUIStore.getState().setActiveTab('input')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'input'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Input
            </button>
            <button
              onClick={() => useUIStore.getState().setActiveTab('results')}
              disabled={!analysisResult}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'results'
                  ? 'bg-blue-600 text-white'
                  : analysisResult
                  ? 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              }`}
            >
              Results
              {analysisResult && (
                <span className="ml-1.5 inline-flex items-center justify-center w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div cla
