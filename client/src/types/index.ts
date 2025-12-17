import { AiTool, CategoryType, ColorType, ProviderType } from "@shared/schema";

export interface CategoryFilter {
  id: CategoryType | "all" | "overture" | "third-party";
  label: string;
}

export const ALL_CATEGORIES: CategoryFilter[] = [
  { id: "all", label: "All Tools" },
  { id: "productivity", label: "Productivity" },
  { id: "research", label: "Research" },
  { id: "professional-development", label: "Professional Development" },
  { id: "personal-development", label: "Personal Development" },
  { id: "education", label: "Education" },
  { id: "healthcare", label: "Healthcare" },
  { id: "text-generation", label: "Text Generation" },
  { id: "image-generation", label: "Image Generation" },
  { id: "code-assistant", label: "Code Assistant" },
  { id: "overture", label: "Overture AI Tools" },
  { id: "third-party", label: "Third-Party AI Tools" },
  { id: "other", label: "Other" }
];

export interface IconGradient {
  from: string;
  to: string;
  accent?: string; // Optional accent color for category badges
}

// Updated Overture Systems brand color gradients
export const COLOR_GRADIENTS: Record<ColorType, IconGradient> = {
  blue: { 
    from: "from-primary-500", 
    to: "to-primary-700",
    accent: "primary"
  },
  purple: { 
    from: "from-secondary-500", 
    to: "to-secondary-700",
    accent: "secondary"
  },
  green: { 
    from: "from-emerald-500", 
    to: "to-teal-600",
    accent: "emerald"
  },
  orange: { 
    from: "from-amber-500", 
    to: "to-orange-600",
    accent: "amber"
  },
  cyan: { 
    from: "from-cyan-500", 
    to: "to-primary-600",
    accent: "cyan"
  },
  pink: { 
    from: "from-accent-500", 
    to: "to-pink-600",
    accent: "accent"
  },
  gray: { 
    from: "from-slate-500", 
    to: "to-slate-700",
    accent: "slate"
  }
};

// Category badge colors mapped to brand palette
export const CATEGORY_COLORS: Record<CategoryType, string> = {
  "text-generation": "primary",      // Indigo
  "image-generation": "secondary",   // Purple
  "code-assistant": "emerald",       // Green
  "productivity": "amber",           // Orange
  "research": "cyan",                // Cyan
  "professional-development": "primary",
  "personal-development": "secondary",
  "education": "emerald",
  "healthcare": "accent",            // Rose
  "other": "slate"
};
