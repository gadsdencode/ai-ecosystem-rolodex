import { useEffect } from 'react';
import { CategoryFilter } from '../types';
import { motion } from 'framer-motion';

interface CategoryFiltersProps {
  categories: CategoryFilter[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export function CategoryFilters({ categories, activeCategory, setActiveCategory }: CategoryFiltersProps) {
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
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="mb-8 overflow-x-auto scrollbar-hide">
      <motion.div 
        className="flex space-x-2 pb-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {categories.map((category) => (
          <motion.button 
            key={category.id}
            className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap ${
              activeCategory === category.id
                ? 'bg-apple-blue text-white shadow-lg' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => handleCategoryFilter(category.id)}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: activeCategory === category.id 
                ? "0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.2)" 
                : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
            }}
            whileTap={{ scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 17
            }}
            // Add a layout animation to smoothly animate position changes
            layout
          >
            {category.label}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
