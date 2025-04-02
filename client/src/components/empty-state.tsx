import { PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  onAddNew: () => void;
}

export function EmptyState({ onAddNew }: EmptyStateProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const svgVariants = {
    hidden: { opacity: 0, pathLength: 0 },
    visible: {
      opacity: 1,
      pathLength: 1,
      transition: {
        duration: 2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.svg 
        className="w-20 h-20 text-apple-gray mb-4 opacity-50" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        variants={itemVariants}
      >
        <motion.path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="1" 
          d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
          variants={svgVariants}
        />
      </motion.svg>
      
      <motion.h3 
        className="text-xl font-medium text-gray-900 mb-2"
        variants={itemVariants}
      >
        No AI tools found
      </motion.h3>
      
      <motion.p 
        className="text-apple-gray text-center max-w-md mb-6"
        variants={itemVariants}
      >
        Your AI ecosystem is empty. Add your first AI tool to start building your collection.
      </motion.p>
      
      <motion.button 
        className="px-5 py-2.5 bg-apple-blue text-white rounded-lg flex items-center hover:bg-blue-600 transition-colors duration-200"
        onClick={onAddNew}
        variants={itemVariants}
        whileHover={{ 
          scale: 1.05,
          boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.4), 0 4px 6px -2px rgba(59, 130, 246, 0.2)"
        }}
        whileTap={{ scale: 0.95 }}
      >
        <PlusCircle className="w-5 h-5 mr-2" />
        Add your first AI tool
      </motion.button>
    </motion.div>
  );
}
