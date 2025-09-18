import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DocumentTextIcon,
  ClockIcon,
  TrashIcon,
  EyeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  XMarkIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  BellIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';
import { useAnalysisStore } from '../store/analysisStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import { createPortal } from 'react-dom';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'analyses' | 'settings';
}

export const UserDashboard: React.FC<DashboardModalProps> = ({ 
  isOpen, 
  onClose, 
  initialView = 'analyses' 
}) => {
  const [activeTab, setActiveTab] = useState(initialView);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const { analysisHistory, fetchAnalysisHistory, deleteAnalysis, loadAnalysis } = useAnalysisStore();
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode, setActiveTab: setMainTab } = useUIStore();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    weeklyReports: false,
    autoSave: true
  });

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialView);
      if (initialView === 'analyses') {
        loadDashboardData();
      }
    }
  }, [isOpen, initialView]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await fetchAnalysisHistory();
      const dashboard = await apiService.getDashboard();
      setDashboardData(dashboard);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      // Use mock data if API fails
      setDashboardData({
        total_analyses: analysisHistory.length || 0,
        average_match: 65,
        recent_count: analysisHistory.filter(a => {
          const date = new Date(a.created_at);
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return date > monthAgo;
        }).length || 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadAnalysis = (analysis: any) => {
    loadAnalysis(analysis);
    setMainTab('results');
    onClose();
    toast.success('Analysis loaded successfully');
  };

  const handleDeleteAnalysis = async (id: number) => {
    if (confirm('Are you sure you want to delete this analysis?')) {
      await deleteAnalysis(id);
      await loadDashboardData();
    }
  };

  const handleSettingChange = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('Settings updated');
  };

  if (!isOpen) return null;

  const modalContent = (
    <>
      {/* Backdrop with higher z-index */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        style={{ zIndex: 9998 }}
      />

      {/* Dashboard Modal with slide animation */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-screen w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl"
        style={{ zIndex: 9999 }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {activeTab === 'analyses' ? 'My Analyses' : 'Settings'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Welcome back, {user?.username || 'User'}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('analyses')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  activeTab === 'analyses'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                }`}
              >
                <DocumentTextIcon className="h-4 w-4" />
                Analysis History
              </motion.button>
            </div>
          </div>

          {/* Content Area with Scroll */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
            {activeTab === 'analyses' ? (
              <div className="space-y-6">
                {/* Stats Cards */}
                {dashboardData && (
                  <div className="grid grid-cols-3 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur border border-blue-500/20"
                    >
                      <ChartBarIcon className="h-8 w-8 text-blue-500 mb-2" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.total_analyses || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Analyses</div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur border border-green-500/20"
                    >
                      <ArrowTrendingUpIcon className="h-8 w-8 text-green-500 mb-2" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.average_match || 0}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg Match</div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur border border-purple-500/20"
                    >
                      <CalendarIcon className="h-8 w-8 text-purple-500 mb-2" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.recent_count || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
                    </motion.div>
                  </div>
                )}

                {/* Analysis History */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Analyses</h3>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
                      />
                    </div>
                  ) : analysisHistory && analysisHistory.length > 0 ? (
                    <div className="space-y-3">
                      {analysisHistory.map((analysis) => (
                        <motion.div
                          key={analysis.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ scale: 1.02 }}
                          className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {analysis.title || 'Untitled Analysis'}
                              </h4>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <ClockIcon className="h-4 w-4" />
                                  {new Date(analysis.created_at).toLocaleDateString()}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  analysis.match_percentage >= 70 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : analysis.match_percentage >= 40
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                  {analysis.match_percentage.toFixed(1)}% Match
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleLoadAnalysis(analysis)}
                                className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteAnalysis(analysis.id)}
                                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No analyses found. Start analyzing to see your history here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Settings Content */}
                <div className="p-6 rounded-xl bg-white dark:bg-gray-800">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <UserCircleIcon className="h-5 w-5 text-purple-500" />
                    Profile Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Username</label>
                      <p className="font-medium text-gray-900 dark:text-white">{user?.username || 'User'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                      <p className="font-medium text-gray-900 dark:text-white">{user?.email || 'user@example.com'}</p>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="p-6 rounded-xl bg-white dark:bg-gray-800">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BellIcon className="h-5 w-5 text-purple-500" />
                    Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Toggle dark/light theme</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleDarkMode}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                      >
                        {isDarkMode ? (
                          <MoonIcon className="h-5 w-5 text-blue-500" />
                        ) : (
                          <SunIcon className="h-5 w-5 text-yellow-500" />
                        )}
                      </motion.button>
                    </div>
                    
                    {Object.entries({
                      emailNotifications: { 
                        title: 'Email Notifications', 
                        desc: 'Receive analysis updates' 
                      },
                      autoSave: { 
                        title: 'Auto-Save Analyses', 
                        desc: 'Automatically save to history' 
                      }
                    }).map(([key, { title, desc }]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSettingChange(key)}
                          className={`w-12 h-6 rounded-full p-1 transition-colors ${
                            settings[key as keyof typeof settings]
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                              : 'bg-gray-300 dark:bg-gray-700'
                          }`}
                        >
                          <motion.div
                            className="w-4 h-4 bg-white rounded-full"
                            animate={{ x: settings[key as keyof typeof settings] ? 20 : 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logout Button */}
                <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Logout
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );

  // Use React Portal to render modal at root level
  return createPortal(
    <AnimatePresence>{isOpen && modalContent}</AnimatePresence>,
    document.body
  );
};