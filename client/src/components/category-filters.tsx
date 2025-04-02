import { useEffect } from 'react';
import { CategoryFilter, ALL_CATEGORIES } from '../types';

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

  return (
    <div className="mb-8 overflow-x-auto scrollbar-hide">
      <div className="flex space-x-2 pb-1">
        {categories.map((category, index) => (
          <button 
            key={category.id}
            className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200 ${
              activeCategory === category.id
                ? 'bg-apple-blue text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => handleCategoryFilter(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}
