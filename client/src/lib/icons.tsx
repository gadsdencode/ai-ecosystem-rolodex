import React from 'react';
import { 
  MessageSquare, 
  Image, 
  Code, 
  Briefcase, 
  BookOpen, 
  Music, 
  Film,
  HelpCircle
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
    case 'audio-generation':
      return Music;
    case 'video-generation':
      return Film;
    default:
      return HelpCircle;
  }
}
