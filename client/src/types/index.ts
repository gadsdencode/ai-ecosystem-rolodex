import { AiTool, CategoryType, ColorType } from "@shared/schema";

export interface CategoryFilter {
  id: CategoryType | "all";
  label: string;
}

export const ALL_CATEGORIES: CategoryFilter[] = [
  { id: "all", label: "All Tools" },
  { id: "text-generation", label: "Text Generation" },
  { id: "image-generation", label: "Image Generation" },
  { id: "code-assistant", label: "Code Assistant" },
  { id: "productivity", label: "Productivity" },
  { id: "research", label: "Research" },
  { id: "professional-development", label: "Professional Development" },
  { id: "personal-development", label: "Personal Development" },
  { id: "education", label: "Education" },
  { id: "healthcare", label: "Healthcare" },
  { id: "other", label: "Other" }
];

export interface IconGradient {
  from: string;
  to: string;
}

export const COLOR_GRADIENTS: Record<ColorType, IconGradient> = {
  blue: { from: "from-blue-500", to: "to-indigo-600" },
  purple: { from: "from-purple-500", to: "to-pink-600" },
  green: { from: "from-green-500", to: "to-teal-600" },
  orange: { from: "from-orange-500", to: "to-red-600" },
  cyan: { from: "from-cyan-500", to: "to-blue-600" },
  pink: { from: "from-pink-500", to: "to-red-600" },
  gray: { from: "from-gray-500", to: "to-gray-600" }
};

export const CATEGORY_COLORS: Record<CategoryType, string> = {
  "text-generation": "blue",
  "image-generation": "purple",
  "code-assistant": "green",
  "productivity": "orange",
  "research": "cyan",
  "professional-development": "blue",
  "personal-development": "purple",
  "education": "green",
  "healthcare": "pink",
  "other": "gray"
};
