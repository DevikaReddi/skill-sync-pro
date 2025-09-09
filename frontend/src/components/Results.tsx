import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  LightBulbIcon,
  AcademicCapIcon,
  FireIcon,
  TrophyIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import { useAnalysisStore } from '../store/analysisStore';
import { useUIStore } from '../store/uiStore';
import { SkillCard, InsightsPanel } from './SkillDetails';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Pie, Bar, Radar } from 'react-chartjs-2';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, RadialLinearScale, PointElement, LineElement, Filler);

const gridOverlayStyle = {
  backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"%3E%3Cpath d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23grid)"/%3E%3C/svg%3E')`,
};

export const Results: React.FC = () => {
  const { analysisResult, resetAnalysis } = useAnalysisStore();
  const { setActiveTab } = useUIStore();
  const [activeView, setActiveView] = useState<'overview' | 'details' | 'insights'>('overview');
  const [isExporting, setIsExporting] = useState(false);
  
  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-8 rounded-3xl backdrop-blur-xl bg-white/30 dark:bg-gray-900/30 border border-white/20 dark:border-gray-700/30"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <ChartBarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          </motion.div>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No analysis results yet</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('input')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-xl hover:shadow-2xl transition-all"
          >
            Start Analysis
          </motion.button>
        </motion.div>
      </div>
    );
  }
  
  const { match_percentage, skill_analysis, recommendations, processing_time_ms } = analysisResult;
  
  const getMatchLevel = (percentage: number) => {
    if (percentage >= 80) return { 
      level: 'Excellent Match', 
      color: 'green', 
      gradient: 'from-green-400 to-emerald-600',
      icon: TrophyIcon,
      message: 'Outstanding! You\'re a top candidate'
    };
    if (percentage >= 60) return { 
      level: 'Good Match', 
      color: 'blue', 
      gradient: 'from-blue-400 to-indigo-600',
      icon: CheckCircleIcon,
      message: 'Great fit! Few improvements needed'
    };
    if (percentage >= 40) return { 
      level: 'Fair Match', 
      color: 'yellow', 
      gradient: 'from-yellow-400 to-orange-600',
      icon: LightBulbIcon,
      message: 'Good potential with some gaps'
    };
    return { 
      level: 'Low Match', 
      color: 'red', 
      gradient: 'from-red-400 to-pink-600',
      icon: AcademicCapIcon,
      message: 'Significant upskilling opportunity'
    };
  };
  
  const matchLevel = getMatchLevel(match_percentage);
  const MatchIcon = matchLevel.icon;
  
  // Enhanced chart data with glassmorphism colors
  const skillDistributionData = {
    labels: ['Matching Skills', 'Skill Gaps', 'Unique Skills'],
    datasets: [{
      data: [
        skill_analysis.matching_skills.length,
        skill_analysis.skill_gaps.length,
        skill_analysis.unique_skills.length
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.6)',
        'rgba(239, 68, 68, 0.6)',
        'rgba(59, 130, 246, 0.6)'
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(59, 130, 246, 1)'
      ],
      borderWidth: 2,
      hoverBackgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(59, 130, 246, 0.8)'
      ]
    }]
  };

  // Radar chart for skill categories
  const skillCategories = {
    'Programming': 0,
    'Frontend': 0,
    'Backend': 0,
    'Database': 0,
    'DevOps': 0,
    'Soft Skills': 0
  };

  [...skill_analysis.matching_skills, ...skill_analysis.unique_skills].forEach(skill => {
    const category = skill.category || 'Other';
    if (category in skillCategories) {
      skillCategories[category as keyof typeof skillCategories]++;
    }
  });

  const radarData = {
    labels: Object.keys(skillCategories),
    datasets: [{
      label: 'Your Skills',
      data: Object.values(skillCategories),
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(139, 92, 246, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(139, 92, 246, 1)'
    }]
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Premium PDF header
      pdf.setFillColor(99, 102, 241);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text('SkillSync Pro Analysis Report', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text(new Date().toLocaleDateString(), pageWidth / 2, 30, { align: 'center' });
      
      // Content
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(18);
      pdf.text('Match Score', 20, 55);
      
      pdf.setFontSize(32);
      pdf.setTextColor(99, 102, 241);
      pdf.text(`${match_percentage.toFixed(1)}%`, 20, 70);
      
      // Add more content...
      pdf.save('skillsync-analysis-report.pdf');
      toast.success('Report exported successfully!');
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Premium Header Section */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-gray-900/30 border border-white/20 dark:border-gray-700/30"
        >
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => setActiveTab('input')}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Input
          </motion.button>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToPDF}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
            >
              <DocumentArrowDownIcon className="inline h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetAnalysis}
              className="px-4 py-2 rounded-xl backdrop-blur-xl bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-500/30 transition-all"
            >
              Clear Results
            </motion.button>
          </div>
        </motion.div>
        
        {/* Premium View Switcher */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center"
        >
          <div className="inline-flex p-1 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-gray-900/30 border border-white/20 dark:border-gray-700/30 shadow-xl">
            {(['overview', 'details', 'insights'] as const).map((view) => (
              <motion.button
                key={view}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView(view)}
                className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
                  activeView === view
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50'
                }`}
              >
                {view === 'overview' && <ChartPieIcon className="inline h-4 w-4 mr-2" />}
                {view === 'details' && <ChartBarIcon className="inline h-4 w-4 mr-2" />}
                {view === 'insights' && <SparklesIcon className="inline h-4 w-4 mr-2" />}
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </motion.button>
            ))}
          </div>
        </motion.div>
        
        <AnimatePresence mode="wait">
          {activeView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Premium Match Score Card */}
              <motion.div 
                className={`relative overflow-hidden rounded-3xl p-8 backdrop-blur-xl bg-gradient-to-br ${matchLevel.gradient} shadow-2xl`}
                whileHover={{ scale: 1.01 }}
              >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                         <div
  className="absolute inset-0 opacity-50"
  style={gridOverlayStyle}
/>
                </div>

                <div className="relative flex flex-col lg:flex-row items-center justify-between text-white">
                  <div className="text-center lg:text-left mb-6 lg:mb-0">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="inline-block mb-4"
                    >
                      <MatchIcon className="h-12 w-12" />
                    </motion.div>
                    <h2 className="text-3xl font-bold mb-2">{matchLevel.level}</h2>
                    <p className="text-lg opacity-90 mb-2">{matchLevel.message}</p>
                    {processing_time_ms && (
                      <p className="text-sm opacity-75 flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Analyzed in {processing_time_ms}ms
                      </p>
                    )}
                  </div>
                  
                  {/* Premium Circular Progress */}
                  <motion.div 
                    initial={{ rotate: -90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", duration: 1 }}
                    className="relative"
                    style={{ width: 180, height: 180 }}
                  >
                    <CircularProgressbar
                      value={match_percentage}
                      text={`${match_percentage.toFixed(1)}%`}
                      styles={buildStyles({
                        textSize: '24px',
                        pathColor: 'rgba(255, 255, 255, 0.9)',
                        textColor: '#fff',
                        trailColor: 'rgba(255, 255, 255, 0.2)',
                        pathTransitionDuration: 1.5,
                      })}
                    />
                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-full bg-white/20 blur-xl animate-pulse" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Charts Grid with Glassmorphism */}
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/30"
                >
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                    <ChartPieIcon className="h-5 w-5 mr-2 text-purple-500" />
                    Skills Distribution
                  </h3>
                  <div className="h-64">
                    <Pie data={skillDistributionData} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 15,
                            font: {
                              size: 12
                            }
                          }
                        }
                      }
                    }} />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/30"
                >
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                    <FireIcon className="h-5 w-5 mr-2 text-orange-500" />
                    Skill Categories Radar
                  </h3>
                  <div className="h-64">
                    <Radar data={radarData} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        r: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                          }
                        }
                      }
                    }} />
                  </div>
                </motion.div>
              </div>

              {/* Premium Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { 
                    icon: CheckCircleIcon, 
                    value: skill_analysis.matching_skills.length, 
                    label: 'Matching',
                    color: 'from-green-500 to-emerald-500'
                  },
                  { 
                    icon: XCircleIcon, 
                    value: skill_analysis.skill_gaps.length, 
                    label: 'Gaps',
                    color: 'from-red-500 to-pink-500'
                  },
                  { 
                    icon: ChartBarIcon, 
                    value: skill_analysis.unique_skills.length, 
                    label: 'Unique',
                    color: 'from-blue-500 to-indigo-500'
                  },
                  { 
                    icon: ArrowTrendingUpIcon, 
                    value: recommendations.length, 
                    label: 'Tips',
                    color: 'from-purple-500 to-pink-500'
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="relative backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden group"
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                    
                    <div className="relative text-center">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className={`inline-block p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-3`}
                      >
                        <stat.icon className="h-6 w-6 text-white" />
                      </motion.div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          
          {activeView === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-3 gap-6"
            >
              <SkillCard
                title="Matching Skills"
                skills={skill_analysis.matching_skills}
                icon={CheckCircleIcon}
                colorScheme="green"
              />
              <SkillCard
                title="Skill Gaps"
                skills={skill_analysis.skill_gaps}
                icon={XCircleIcon}
                colorScheme="red"
              />
              <SkillCard
                title="Unique Skills"
                skills={skill_analysis.unique_skills}
                icon={ChartBarIcon}
                colorScheme="blue"
              />
            </motion.div>
          )}
          
          {activeView === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <InsightsPanel
                recommendations={recommendations}
                matchPercentage={match_percentage}
                skillAnalysis={skill_analysis}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};