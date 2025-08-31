import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { useAnalysisStore } from '../store/analysisStore';
import { useUIStore } from '../store/uiStore';
import { SkillCard, InsightsPanel } from './SkillDetails';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import jsPDF from 'jspdf';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

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
          className="text-center"
        >
          <ChartBarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" style={{ maxWidth: '64px', maxHeight: '64px' }} />
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No analysis results yet</p>
          <button
            onClick={() => setActiveTab('input')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Analysis
          </button>
        </motion.div>
      </div>
    );
  }
  
  const { match_percentage, skill_analysis, recommendations, processing_time_ms } = analysisResult;
  
  const getMatchLevel = (percentage: number) => {
    if (percentage >= 80) return { level: 'Excellent Match', color: 'green', gradient: 'from-green-400 to-green-600' };
    if (percentage >= 60) return { level: 'Good Match', color: 'blue', gradient: 'from-blue-400 to-blue-600' };
    if (percentage >= 40) return { level: 'Fair Match', color: 'yellow', gradient: 'from-yellow-400 to-yellow-600' };
    return { level: 'Low Match', color: 'red', gradient: 'from-red-400 to-red-600' };
  };
  
  const matchLevel = getMatchLevel(match_percentage);
  
  const skillDistributionData = {
    labels: ['Matching Skills', 'Skill Gaps', 'Unique Skills'],
    datasets: [{
      data: [
        skill_analysis.matching_skills.length,
        skill_analysis.skill_gaps.length,
        skill_analysis.unique_skills.length
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(59, 130, 246, 0.8)'
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(59, 130, 246, 1)'
      ],
      borderWidth: 2
    }]
  };
  
  const categoryCount: Record<string, number> = {};
  [...skill_analysis.matching_skills, ...skill_analysis.skill_gaps, ...skill_analysis.unique_skills].forEach(skill => {
    const category = skill.category || 'Other';
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });
  
  const categoryData = {
    labels: Object.keys(categoryCount),
    datasets: [{
      label: 'Skills by Category',
      data: Object.values(categoryCount),
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 1
    }]
  };
  
  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      pdf.setFontSize(24);
      pdf.setTextColor(31, 41, 55);
      pdf.text('SkillSync Pro Analysis Report', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      pdf.text(new Date().toLocaleDateString(), pageWidth / 2, 28, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Overall Match Score', 20, 45);
      pdf.setFontSize(28);
      pdf.setTextColor(
        matchLevel.color === 'green' ? 34 : 
        matchLevel.color === 'blue' ? 59 :
        matchLevel.color === 'yellow' ? 245 : 239,
        matchLevel.color === 'green' ? 197 :
        matchLevel.color === 'blue' ? 130 :
        matchLevel.color === 'yellow' ? 158 : 68,
        matchLevel.color === 'green' ? 94 :
        matchLevel.color === 'blue' ? 246 :
        matchLevel.color === 'yellow' ? 11 : 68
      );
      pdf.text(`${match_percentage.toFixed(1)}%`, 20, 58);
      pdf.setFontSize(12);
      pdf.text(matchLevel.level, 80, 58);
      
      let yPosition = 75;
      pdf.setFontSize(14);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Skills Analysis', 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(11);
      pdf.setTextColor(34, 197, 94);
      pdf.text(`✓ Matching Skills (${skill_analysis.matching_skills.length})`, 25, yPosition);
      
      yPosition += 8;
      pdf.setTextColor(239, 68, 68);
      pdf.text(`✗ Skill Gaps (${skill_analysis.skill_gaps.length})`, 25, yPosition);
      
      yPosition += 8;
      pdf.setTextColor(59, 130, 246);
      pdf.text(`★ Unique Skills (${skill_analysis.unique_skills.length})`, 25, yPosition);
      
      if (recommendations.length > 0) {
        yPosition += 10;
        pdf.setFontSize(12);
        pdf.text('Recommendations:', 20, yPosition);
        yPosition += 8;
        pdf.setFontSize(10);
        recommendations.forEach((rec, index) => {
          const lines = pdf.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 40);
          lines.forEach((line: string) => {
            if (yPosition > 270) {
              pdf.addPage();
              yPosition = 20;
            }
            pdf.text(line, 25, yPosition);
            yPosition += 6;
          });
        });
      }
      
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);
      pdf.text('Generated by SkillSync Pro', pageWidth / 2, 285, { align: 'center' });
      
      pdf.save('skillsync-analysis-report.pdf');
    } catch (error) {
      console.error('PDF export failed:', error);
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button
            onClick={() => setActiveTab('input')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" style={{ maxWidth: '16px', maxHeight: '16px' }} />
            Back to Input
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={exportToPDF}
              disabled={isExporting}
              className="inline-flex items-center px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-1" style={{ maxWidth: '16px', maxHeight: '16px' }} />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
            <button
              onClick={resetAnalysis}
              className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Clear Results
            </button>
          </div>
        </div>
        
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {(['overview', 'details', 'insights'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === view
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          {activeView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className={`bg-gradient-to-br ${matchLevel.gradient} rounded-2xl p-8 text-white shadow-2xl`}>
                <div className="flex flex-col lg:flex-row items-center justify-between">
                  <div className="text-center lg:text-left mb-6 lg:mb-0">
                    <h2 className="text-3xl font-bold mb-2">Your Match Score</h2>
                    <p className="text-lg opacity-90">{matchLevel.level}</p>
                    {processing_time_ms && (
                      <p className="mt-2 text-sm opacity-75 flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" style={{ maxWidth: '16px', maxHeight: '16px' }} />
                        Analyzed in {processing_time_ms}ms
                      </p>
                    )}
                  </div>
                  
                  <div className="relative">
                    <div style={{ width: 150, height: 150 }}>
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
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Skills Distribution
                  </h3>
                  <div className="h-64">
                    <Pie data={skillDistributionData} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        }
                      }
                    }} />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Skills by Category
                  </h3>
                  <div className="h-64">
                    <Bar data={categoryData} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1
                          }
                        }
                      }
                    }} />
                  </div>
                </motion.div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center"
                >
                  <CheckCircleIcon className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" style={{ maxWidth: '32px', maxHeight: '32px' }} />
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {skill_analysis.matching_skills.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Matching</div>
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center"
                >
                  <XCircleIcon className="h-8 w-8 mx-auto mb-2 text-red-600 dark:text-red-400" style={{ maxWidth: '32px', maxHeight: '32px' }} />
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {skill_analysis.skill_gaps.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Gaps</div>
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center"
                >
                  <ChartBarIcon className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" style={{ maxWidth: '32px', maxHeight: '32px' }} />
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {skill_analysis.unique_skills.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Unique</div>
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center"
                >
                  <ArrowTrendingUpIcon className="h-8 w-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" style={{ maxWidth: '32px', maxHeight: '32px' }} />
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {recommendations.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Tips</div>
                </motion.div>
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
