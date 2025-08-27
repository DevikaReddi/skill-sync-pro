import { motion } from 'framer-motion';
import { 
  TrophyIcon,
  AcademicCapIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Icon } from './common/Icon';

interface SkillWithScore {
  name: string;
  category?: string;
  relevance_score?: number;
}

interface EnhancedResultsProps {
  skills: SkillWithScore[];
  title: string;
  icon: React.ComponentType<any>;
  colorScheme: 'green' | 'red' | 'blue';
}

export const SkillCard: React.FC<EnhancedResultsProps> = ({ 
  skills, 
  title, 
  icon, 
  colorScheme 
}) => {
  const colors = {
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: 'text-green-500',
      badge: 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200',
      relevance: 'text-green-600 dark:text-green-400'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-500',
      badge: 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200',
      relevance: 'text-red-600 dark:text-red-400'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-500',
      badge: 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200',
      relevance: 'text-blue-600 dark:text-blue-400'
    }
  };

  const color = colors[colorScheme];

  // Sort skills by relevance score
  const sortedSkills = [...skills].sort((a, b) => 
    (b.relevance_score || 0) - (a.relevance_score || 0)
  );

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${color.border} p-4`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Icon icon={icon} size="md" className={color.icon + ' mr-2'} />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {skills.length} skills
        </span>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {sortedSkills.length > 0 ? (
          sortedSkills.map((skill, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
              className={`p-2 ${color.bg} rounded-md`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {skill.name}
                </span>
                <div className="flex items-center space-x-2">
                  {skill.relevance_score && (
                    <span className={`text-[10px] ${color.relevance}`}>
                      {Math.round(skill.relevance_score * 100)}%
                    </span>
                  )}
                  {skill.category && (
                    <span className={`text-[10px] px-1.5 py-0.5 ${color.badge} rounded-full`}>
                      {skill.category}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-xs text-center py-4">
            No skills found in this category
          </p>
        )}
      </div>
    </motion.div>
  );
};

export const InsightCard: React.FC<{ title: string; value: string; icon: React.ComponentType<any> }> = ({ 
  title, 
  value, 
  icon 
}) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg"
    >
      <div className="flex items-center mb-2">
        <Icon icon={icon} size="sm" className="text-purple-500 mr-2" />
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          {title}
        </h4>
      </div>
      <p className="text-sm font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </motion.div>
  );
};
