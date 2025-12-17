import { PlusCircle, Sparkles, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddNew: () => void;
}

export function EmptyState({ onAddNew }: EmptyStateProps) {
  const { theme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.15
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

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-20 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Icon */}
      <motion.div
        className="relative mb-6"
        variants={itemVariants}
      >
        <div className="relative">
          <motion.div 
            className="p-6 rounded-3xl bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-accent-500/10 border border-primary-500/20"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(99, 102, 241, 0.1)",
                "0 0 40px rgba(168, 85, 247, 0.15)",
                "0 0 20px rgba(99, 102, 241, 0.1)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Layers className="w-16 h-16 text-primary-500/50" />
          </motion.div>
          
          {/* Floating sparkles */}
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ y: [-2, 2, -2], rotate: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-6 h-6 text-secondary-500" />
          </motion.div>
          
          <motion.div
            className="absolute -bottom-1 -left-1"
            animate={{ y: [2, -2, 2], rotate: [0, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <Sparkles className="w-4 h-4 text-accent-500" />
          </motion.div>
        </div>
        
        {/* Background glow */}
        <div className="absolute inset-0 blur-3xl opacity-30">
          <div className="w-full h-full bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-full" />
        </div>
      </motion.div>
      
      {/* Title */}
      <motion.h3 
        className="text-2xl font-semibold text-foreground mb-3"
        variants={itemVariants}
      >
        No AI tools found
      </motion.h3>
      
      {/* Description */}
      <motion.p 
        className="text-muted-foreground text-center max-w-md mb-8"
        variants={itemVariants}
      >
        Your AI ecosystem is empty. Add your first AI tool to start building your curated collection of powerful AI applications.
      </motion.p>
      
      {/* CTA Button */}
      <motion.div variants={itemVariants}>
        <Button 
          variant="brand"
          size="lg"
          onClick={onAddNew}
          className="shadow-brand-lg"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add your first AI tool
        </Button>
      </motion.div>
      
      {/* Helper text */}
      <motion.p 
        className="mt-6 text-sm text-muted-foreground"
        variants={itemVariants}
      >
        Press <kbd className={`px-2 py-0.5 rounded font-mono text-xs ${
          theme === 'light'
            ? 'bg-muted border border-border/50'
            : 'bg-slate-800 border border-white/10'
        }`}>⌘ N</kbd> to quickly add a new tool
      </motion.p>
    </motion.div>
  );
}
