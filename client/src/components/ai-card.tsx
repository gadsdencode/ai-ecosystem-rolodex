import { AiTool } from '@shared/schema';
import { COLOR_GRADIENTS } from '../types';
import { getCategoryIcon } from '../lib/icons';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Server, Code, ChevronUp, ChevronDown, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { StatusToggle } from './status-toggle';
import { useTheme } from '../contexts/ThemeContext';

interface AiCardProps {
  tool: AiTool;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
  onChangeStatus?: (newStatus: 'production' | 'development') => void;
  showDevelopmentStatus?: boolean;
}

// Card animation variants with brand aesthetic
const cardVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 260,
      damping: 20,
      duration: 0.5
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  }
};

// Category badge color mapping for proper Tailwind class generation
const getCategoryBadgeClasses = (category: string, theme: string) => {
  const categoryMap: Record<string, { light: string; dark: string }> = {
    'text-generation': {
      light: 'bg-primary-100 text-primary-700',
      dark: 'bg-primary-900/40 text-primary-300'
    },
    'image-generation': {
      light: 'bg-secondary-100 text-secondary-700',
      dark: 'bg-secondary-900/40 text-secondary-300'
    },
    'code-assistant': {
      light: 'bg-emerald-100 text-emerald-700',
      dark: 'bg-emerald-900/40 text-emerald-300'
    },
    'productivity': {
      light: 'bg-amber-100 text-amber-700',
      dark: 'bg-amber-900/40 text-amber-300'
    },
    'research': {
      light: 'bg-cyan-100 text-cyan-700',
      dark: 'bg-cyan-900/40 text-cyan-300'
    },
    'professional-development': {
      light: 'bg-primary-100 text-primary-700',
      dark: 'bg-primary-900/40 text-primary-300'
    },
    'personal-development': {
      light: 'bg-secondary-100 text-secondary-700',
      dark: 'bg-secondary-900/40 text-secondary-300'
    },
    'education': {
      light: 'bg-emerald-100 text-emerald-700',
      dark: 'bg-emerald-900/40 text-emerald-300'
    },
    'healthcare': {
      light: 'bg-accent-100 text-accent-700',
      dark: 'bg-accent-900/40 text-accent-300'
    },
    'other': {
      light: 'bg-slate-100 text-slate-700',
      dark: 'bg-slate-800/40 text-slate-300'
    }
  };

  const colors = categoryMap[category] || categoryMap['other'];
  return theme === 'dark' ? colors.dark : colors.light;
};

export function AiCard({ 
  tool, 
  onEdit, 
  onDelete, 
  onClick, 
  onChangeStatus,
  showDevelopmentStatus = false 
}: AiCardProps) {
  const { theme } = useTheme();
  const { from, to } = COLOR_GRADIENTS[tool.iconColor as keyof typeof COLOR_GRADIENTS] || COLOR_GRADIENTS.blue;
  const CategoryIcon = getCategoryIcon(tool.category);
  
  // Format date as "MMM d, yyyy" (e.g., "Apr 12, 2023")
  const formattedDate = format(new Date(tool.dateAdded), 'MMM d, yyyy');
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger card click if not clicking a button or link
    if (!(e.target as HTMLElement).closest('button') && !(e.target as HTMLElement).closest('a')) {
      onClick();
    }
  };

  const categoryBadgeClasses = getCategoryBadgeClasses(tool.category, theme);

  return (
    <motion.div 
      className={`group relative backdrop-blur-lg rounded-xl overflow-hidden cursor-pointer transition-shadow duration-300 ${
        theme === 'dark'
          ? 'bg-slate-900/80 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)]'
          : 'bg-white/80 border border-white/50 shadow-lg hover:shadow-brand-lg'
      }`}
      onClick={handleCardClick}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      layout
    >
      {/* Gradient header with category icon */}
      <div className="relative">
        <div className={`h-44 bg-gradient-to-br ${from} ${to} flex items-center justify-center relative overflow-hidden`}>
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_70%)]" />
          
          <CategoryIcon className="w-20 h-20 text-white drop-shadow-lg relative z-10" />
          
          {/* Glow effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-t from-transparent via-white/20 to-transparent" />
        </div>

        {/* Provider & Status badges - top left */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {tool.provider === 'overture' ? (
            <motion.div 
              className="px-2.5 py-1 bg-gradient-to-r from-primary-500/90 to-secondary-500/90 text-white text-xs font-semibold rounded-full shadow-md backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <span className="font-mono tracking-tight">OVERTURE</span>
            </motion.div>
          ) : (
            <motion.div 
              className={`px-2.5 py-1 text-xs font-medium rounded-full shadow-md backdrop-blur-sm border ${
                theme === 'dark'
                  ? 'bg-slate-800/90 text-slate-300 border-white/10'
                  : 'bg-white/90 text-slate-600 border-white/20'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              Third Party
            </motion.div>
          )}

          {/* Development Status Badge */}
          {showDevelopmentStatus && (
            <motion.div 
              className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-md backdrop-blur-sm flex items-center gap-1 ${
                tool.developmentStatus === 'development' 
                  ? 'bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white' 
                  : 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-white'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              {tool.developmentStatus === 'development' ? (
                <>
                  <Code className="w-3 h-3" />
                  <span className="font-mono">DEV</span>
                </>
              ) : (
                <>
                  <Server className="w-3 h-3" />
                  <span className="font-mono">PROD</span>
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* Action buttons - top right */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Development Status Control */}
          {showDevelopmentStatus && onChangeStatus && (
            <>
              {tool.developmentStatus === 'development' ? (
                <motion.button 
                  className={`p-2 rounded-lg text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-200 backdrop-blur-sm shadow-md ${
                    theme === 'dark' ? 'bg-slate-800/90' : 'bg-white/90'
                  }`}
                  aria-label="Move to Production"
                  onClick={() => onChangeStatus('production')}
                  title="Move to Production"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronUp className="w-4 h-4" />
                </motion.button>
              ) : (
                <motion.button 
                  className={`p-2 rounded-lg text-amber-600 hover:bg-amber-500 hover:text-white transition-all duration-200 backdrop-blur-sm shadow-md ${
                    theme === 'dark' ? 'bg-slate-800/90' : 'bg-white/90'
                  }`}
                  aria-label="Move to Development"
                  onClick={() => onChangeStatus('development')}
                  title="Move to Development"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.button>
              )}
            </>
          )}

          <motion.button 
            className={`p-2 rounded-lg hover:bg-primary-500 hover:text-white transition-all duration-200 backdrop-blur-sm shadow-md ${
              theme === 'dark' 
                ? 'bg-slate-800/90 text-slate-400' 
                : 'bg-white/90 text-slate-500'
            }`}
            aria-label="Edit"
            onClick={onEdit}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Pencil className="w-4 h-4" />
          </motion.button>
          
          <motion.button 
            className={`p-2 rounded-lg hover:bg-accent-500 hover:text-white transition-all duration-200 backdrop-blur-sm shadow-md ${
              theme === 'dark' 
                ? 'bg-slate-800/90 text-slate-400' 
                : 'bg-white/90 text-slate-500'
            }`}
            aria-label="Delete"
            onClick={onDelete}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Card content */}
      <div className="p-5">
        <div className="flex justify-between items-start gap-3 mb-3">
          <h3 className={`text-lg font-semibold leading-tight ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            {tool.name}
          </h3>
          <motion.span 
            className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium ${categoryBadgeClasses}`}
            whileHover={{ scale: 1.05 }}
          >
            {tool.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </motion.span>
        </div>
        
        <p className={`text-sm mb-4 line-clamp-2 ${
          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {tool.description}
        </p>
        
        {/* Tags */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {tool.tags.slice(0, 3).map((tag, index) => (
              <motion.span 
                key={index} 
                className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                  theme === 'dark'
                    ? 'bg-slate-800/50 text-slate-400 border-slate-700/50'
                    : 'bg-slate-100/80 text-slate-600 border-slate-200/50'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                {tag}
              </motion.span>
            ))}
            {tool.tags.length > 3 && (
              <motion.span 
                className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                  theme === 'dark'
                    ? 'bg-slate-800/50 text-slate-400 border-slate-700/50'
                    : 'bg-slate-100/80 text-slate-600 border-slate-200/50'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                +{tool.tags.length - 3}
              </motion.span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`pt-3 border-t flex justify-between items-center ${
          theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200/50'
        }`}>
          <span className={`text-xs font-mono ${
            theme === 'dark' ? 'text-slate-500' : 'text-slate-500'
          }`}>
            {formattedDate}
          </span>
          <motion.a 
            href={tool.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'text-primary-400 hover:text-primary-300'
                : 'text-primary-500 hover:text-primary-600'
            }`}
            onClick={(e) => e.stopPropagation()}
            whileHover={{ scale: 1.05, x: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            Open Tool
            <ExternalLink className="w-3.5 h-3.5" />
          </motion.a>
        </div>
      </div>

      {/* Status Toggle for Admin Users */}
      {showDevelopmentStatus && onChangeStatus && (
        <StatusToggle 
          tool={tool} 
          onStatusChange={async (tool, newStatus) => {
            if (onChangeStatus) {
              onChangeStatus(newStatus);
            }
            return Promise.resolve();
          }} 
        />
      )}

      {/* Subtle gradient border on hover */}
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border ${
        theme === 'dark' ? 'border-primary-500/30' : 'border-primary-500/20'
      }`} />
    </motion.div>
  );
}
