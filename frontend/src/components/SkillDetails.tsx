import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Skill } from '../types';

interface SkillCardProps {
  title: string;
  skills: Skill[];
  icon: React.ComponentType<any>;
  colorScheme: 'green' | 'red' | 'blue';
  showRelevance?: boolean;
}

export const SkillCard: React.FC<SkillCardProps> = ({ 
  title, 
  skills, 
  icon: IconComponent, 
  colorScheme,
  showRelevance = true 
}) => {
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'relevance'>('relevance');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());

  const colors = {
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
      badge: 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200',
      hover: 'hover:bg-green-100 dark:hover:bg-green-900/30'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      badge: 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200',
      hover: 'hover:bg-red-100 dark:hover:bg-red-900/30'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200',
      hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
    }
  };

  const color = colors[colorScheme];

  // Get unique categories
  const categories = ['all', ...new Set(skills.map(s => s.category || 'Other'))];

  // Filter and sort skills
  let displaySkills = [...skills];
  if (filterCategory !== 'all') {
    displaySkills = displaySkills.filter(s => (s.category || 'Other') === filterCategory);
  }

  displaySkills.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'category':
        return (a.category || 'Other').localeCompare(b.category || 'Other');
      case 'relevance':
        return (b.relevance_score || 0) - (a.relevance_score || 0);
      default:
        return 0;
    }
  });

  const toggleSkillExpansion = (skillName: string) => {
    const newExpanded = new Set(expandedSkills);
    if (newExpanded.has(skillName)) {
      newExpanded.delete(skillName);
    } else {
      newExpanded.add(skillName);
    }
    setExpandedSkills(newExpanded);
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-blue-600 dark:text-blue-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden`}
    >
      {/* Header */}
      <div className={`px-6 py-4 ${color.bg} border-b ${color.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <IconComponent className={`w-6 h-6 ${color.icon} mr-2`} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${color.badge}`}>
              {displaySkills.length} skills
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="relevance">Sort by Relevance</option>
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
      </div>

      {/* Skills List */}
      <div className="px-6 py-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {displaySkills.length > 0 ? (
            <div className="space-y-2">
              {displaySkills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className={`p-3 rounded-lg ${color.bg} ${color.hover} cursor-pointer transition-all`}
                  onClick={() => toggleSkillExpansion(skill.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {skill.name}
                      </span>
                      {skill.category && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${color.badge}`}>
                          {skill.category}
                        </span>
                      )}
                    </div>
                    
                    {showRelevance && skill.relevance_score && (
                      <div className="flex items-center space-x-2">
                        <div className={`text-xs font-medium ${getRelevanceColor(skill.relevance_score)}`}>
                          {Math.round(skill.relevance_score * 100)}%
                        </div>
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.relevance_score * 100}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className={`h-full ${
                              skill.relevance_score >= 0.8 ? 'bg-green-500' :
                              skill.relevance_score >= 0.6 ? 'bg-blue-500' :
                              'bg-gray-500'
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {expandedSkills.has(skill.name) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                      >
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          <p>
                            <span className="font-medium">Category:</span> {skill.category || 'Other'}
                          </p>
                          {skill.relevance_score && (
                            <p>
                              <span className="font-medium">Relevance:</span> {' '}
                              {skill.relevance_score >= 0.8 ? 'High Priority' :
                               skill.relevance_score >= 0.6 ? 'Medium Priority' :
                               'Low Priority'}
                            </p>
                          )}
                          <p className="mt-2 text-gray-500 dark:text-gray-500 italic">
                            Click to view learning resources for {skill.name}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No skills found in this category
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

interface InsightsProps {
  recommendations: string[];
  matchPercentage: number;
  skillAnalysis: any;
}

export const InsightsPanel: React.FC<InsightsProps> = ({ 
  recommendations, 
  matchPercentage,
  skillAnalysis 
}) => {
  const [expandedRec, setExpandedRec] = useState<number | null>(null);

  const getInsightIcon = (index: number) => {
    const icons = [SparklesIcon, ArrowUpIcon, InformationCircleIcon, CheckCircleIcon];
    return icons[index % icons.length];
  };

  const getActionableSteps = (recommendation: string): string[] => {
    // Simple logic to generate actionable steps based on recommendation
    if (recommendation.toLowerCase().includes('docker')) {
      return [
        'Start with Docker fundamentals course on Docker Hub',
        'Practice containerizing a simple application',
        'Learn Docker Compose for multi-container apps',
        'Explore Kubernetes basics for orchestration'
      ];
    }
    if (recommendation.toLowerCase().includes('cloud')) {
      return [
        'Create a free tier account on AWS/Azure/GCP',
        'Complete cloud provider\'s fundamental certification',
        'Build and deploy a sample project',
        'Learn Infrastructure as Code with Terraform'
      ];
    }
    if (recommendation.toLowerCase().includes('frontend')) {
      return [
        'Master modern JavaScript (ES6+)',
        'Learn a popular framework (React/Vue/Angular)',
        'Understand state management patterns',
        'Practice responsive design and accessibility'
      ];
    }
    return [
      'Research online resources and tutorials',
      'Join relevant communities and forums',
      'Build practical projects for portfolio',
      'Seek mentorship or peer learning opportunities'
    ];
  };

  const getTimeEstimate = (steps: string[]): string => {
    return `${steps.length * 2}-${steps.length * 3} weeks`;
  };

  return (
    <div className="space-y-6">
      {/* Key Insights Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Key Insights
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {matchPercentage >= 70 ? '🎯' : matchPercentage >= 40 ? '📈' : '🚀'}
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {matchPercentage >= 70 
                ? 'Strong candidate for this role'
                : matchPercentage >= 40
                ? 'Good potential with some gaps'
                : 'Significant upskilling opportunity'}
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {skillAnalysis.skill_gaps.length}
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Skills to develop
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {Math.ceil(skillAnalysis.skill_gaps.length * 2)} weeks
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Estimated learning time
            </p>
          </div>
        </div>
      </motion.div>

      {/* Actionable Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Actionable Recommendations
        </h3>
        
        {recommendations.map((rec, index) => {
          const Icon = getInsightIcon(index);
          const steps = getActionableSteps(rec);
          const isExpanded = expandedRec === index;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setExpandedRec(isExpanded ? null : index)}
              >
                <div className="flex items-start">
                  <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {rec}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Estimated time: {getTimeEstimate(steps)}
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowDownIcon className="w-4 h-4 text-gray-400" />
                  </motion.div>
                </div>
              </div>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                        Action Steps
                      </h4>
                      <ol className="space-y-2">
                        {steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded-full mr-3">
                              {stepIndex + 1}
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {step}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
