import React from 'react';
import { 
  MessageSquare, 
  Image, 
  Code, 
  Briefcase, 
  BookOpen,
  HelpCircle,
  BriefcaseMedical,
  BicepsFlexedIcon,
  GlassesIcon
} from 'lucide-react';

export function getCategoryIcon(category: string): React.ComponentType<any> {
  switch(category) {
    case 'text-generation':
      return MessageSquare;
    case 'image-generation':
      return Image;
    case 'code-assistant':
      return Code;
    case 'productivity':
      return Briefcase;
    case 'research':
      return BookOpen;
    case 'professional-development':
      return GlassesIcon;
    case 'personal-development':
      return BicepsFlexedIcon;
    case 'education':
      return HelpCircle;
    case 'healthcare':
      return BriefcaseMedical;;
    default:
      return HelpCircle;
  }
}
