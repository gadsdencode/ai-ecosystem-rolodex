import { apiRequest } from "./queryClient";
import { categorySchema, type CategoryType } from "@shared/schema";

// No need for API key client side - we use server endpoints
console.log("xAI integration initialized via server endpoints");

// Analyze sentiment of AI tool description - Not using server endpoint for this feature now
export async function analyzeSentiment(text: string): Promise<{
  rating: number,
  confidence: number
}> {
  try {
    // Simple sentiment analysis based on text length and key words as fallback
    // This is a placeholder for server-side analysis
    const positiveWords = ['amazing', 'excellent', 'great', 'good', 'useful', 'helpful', 'innovative'];
    const negativeWords = ['bad', 'poor', 'terrible', 'useless', 'difficult', 'confusing'];
    
    let rating = 3; // Default neutral rating
    let positiveCount = 0;
    let negativeCount = 0;
    
    const lowerText = text.toLowerCase();
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) {
      rating = 4 + (positiveCount > 2 ? 1 : 0);
    } else if (negativeCount > positiveCount) {
      rating = 2 - (negativeCount > 2 ? 1 : 0);
    }
    
    const confidence = 0.5 + (Math.abs(positiveCount - negativeCount) * 0.1);
    
    return {
      rating: Math.max(1, Math.min(5, rating)),
      confidence: Math.max(0, Math.min(1, confidence)),
    };
  } catch (error) {
    console.error("Failed to analyze sentiment:", error);
    return { rating: 3, confidence: 0.5 };
  }
}

// Generate tool usage suggestions
export async function generateToolSuggestions(toolName: string, toolDescription: string): Promise<string> {
  try {
    // Use server endpoint to generate suggestions
    const response = await apiRequest<{ suggestions: string }>('/api/xai/suggestions', {
      method: 'POST',
      body: { toolName, toolDescription }
    });
    
    return response?.suggestions || "Try exploring the different features of this tool to understand its capabilities.";
  } catch (error) {
    console.error("Failed to generate tool suggestions:", error);
    return "Try exploring the different features of this tool to understand its capabilities.";
  }
}

// Auto-categorize AI tool based on description
export async function autoCategorizeAiTool(description: string): Promise<CategoryType> {
  try {
    // Use server endpoint to categorize
    const response = await apiRequest<{ category: CategoryType }>('/api/xai/categorize', {
      method: 'POST',
      body: { description }
    });
    
    return response?.category || "text-generation";
  } catch (error) {
    console.error("Failed to auto-categorize tool:", error);
    return "text-generation";
  }
}

// Generate suggested tags based on tool description
export async function suggestTags(description: string): Promise<string[]> {
  try {
    // Use server endpoint to suggest tags
    const response = await apiRequest<{ tags: string[] }>('/api/xai/tags', {
      method: 'POST',
      body: { description }
    });
    
    return response?.tags || ["AI", "Tool"];
  } catch (error) {
    console.error("Failed to suggest tags:", error);
    return ["AI", "Tool"];
  }
}
