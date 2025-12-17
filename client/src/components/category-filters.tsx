import { useEffect } from 'react';
import { CategoryFilter } from '../types';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface CategoryFiltersProps {
  categories: CategoryFilter[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export function CategoryFilters({ categories, activeCategory, setActiveCategory }: CategoryFiltersProps) {
  const { theme } = useTheme();
  
  const handleCategoryFilter = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  // Register keyboard shortcuts for categories (⌘+1 through ⌘+9)
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (index < categories.length) {
          setActiveCategory(categories[index].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [categories, setActiveCategory]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20
      }
    }
  };

  return (
    <div className="mb-8 overflow-x-auto">

      <motion.div 
        className="flex gap-2 pb-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          
          return (
            <motion.button 
              key={category.id}
              className={`
                px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-brand' 
                  : theme === 'light'
                    ? 'bg-white/80 border border-border/50 text-foreground hover:border-primary-500/30 hover:bg-white'
                    : 'bg-slate-800/80 border border-white/10 text-white hover:border-primary-500/30 hover:bg-slate-800'
                }
                backdrop-blur-sm
              `}
              onClick={() => handleCategoryFilter(category.id)}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.03, 
                boxShadow: isActive 
                  ? "0 10px 25px -5px rgba(99, 102, 241, 0.4), 0 8px 10px -6px rgba(168, 85, 247, 0.3)" 
                  : "0 4px 12px -2px rgba(0, 0, 0, 0.1)"
              }}
              whileTap={{ scale: 0.97 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 17
              }}
              layout
            >
              {category.label}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
