import OpenAI from "openai";
import { categorySchema, type CategoryType } from "@shared/schema";

// Use import.meta.env for client-side environment variables in Vite
const apiKey = import.meta.env.VITE_XAI_API_KEY || "";

// Create OpenAI client configured for xAI API
const xai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey,
  dangerouslyAllowBrowser: true // Required for browser environment
});

// Helper function to check if API key is available
const hasApiKey = (): boolean => {
  const hasKey = !!apiKey;
  if (!hasKey) {
    console.warn("XAI_API_KEY not provided, some AI features will be limited");
  }
  return hasKey;
};

// Analyze sentiment of AI tool description
export async function analyzeSentiment(text: string): Promise<{
  rating: number,
  confidence: number
}> {
  try {
    if (!hasApiKey()) {
      return { rating: 3, confidence: 0.5 };
    }

    const response = await xai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content:
            "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1. Respond with JSON in this format: { 'rating': number, 'confidence': number }",
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || '{"rating": 3, "confidence": 0.5}';
    const result = JSON.parse(content);

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating))),
      confidence: Math.max(0, Math.min(1, result.confidence)),
    };
  } catch (error) {
    console.error("Failed to analyze sentiment:", error);
    return { rating: 3, confidence: 0.5 };
  }
}

// Generate tool usage suggestions
export async function generateToolSuggestions(toolName: string, toolDescription: string): Promise<string> {
  try {
    if (!hasApiKey()) {
      return "Try exploring the different features of this tool to understand its capabilities.";
    }

    const prompt = `
      Tool Name: ${toolName}
      Description: ${toolDescription}
      
      Provide 3 concise, practical suggestions for how to best use this AI tool effectively.
      Format as a simple comma-separated list.
    `;

    const response = await xai.chat.completions.create({
      model: "grok-2-1212",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });

    return response.choices[0].message.content || "Try exploring the tool's features.";
  } catch (error) {
    console.error("Failed to generate tool suggestions:", error);
    return "Try exploring the different features of this tool to understand its capabilities.";
  }
}

// Auto-categorize AI tool based on description
export async function autoCategorizeAiTool(description: string): Promise<CategoryType> {
  try {
    if (!hasApiKey()) {
      return "text-generation"; // Default category if no API key
    }

    const validCategories = Object.values(categorySchema.enum);
    const categoriesString = validCategories.join(", ");

    const prompt = `
      Description of an AI tool: "${description}"
      
      Based on this description, classify this tool into exactly one of the following categories: ${categoriesString}
      
      Respond with only the category name, nothing else.
    `;

    const response = await xai.chat.completions.create({
      model: "grok-2-1212",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 20,
      temperature: 0.1 // Lower temperature for more deterministic results
    });

    const suggestedCategory = response.choices[0].message.content?.trim();
    
    // Validate the response is a valid category
    if (suggestedCategory && validCategories.includes(suggestedCategory as CategoryType)) {
      return suggestedCategory as CategoryType;
    }
    
    // Fallback to default category if validation fails
    return "text-generation";
  } catch (error) {
    console.error("Failed to auto-categorize tool:", error);
    return "text-generation";
  }
}

// Generate suggested tags based on tool description
export async function suggestTags(description: string): Promise<string[]> {
  try {
    if (!hasApiKey()) {
      return ["AI", "Tool"]; // Default tags if no API key
    }

    const prompt = `
      Description of an AI tool: "${description}"
      
      Based on this description, suggest 3-5 relevant tags for this tool.
      Respond with only a JSON array of strings, nothing else.
      Example response: ["Tag1", "Tag2", "Tag3"]
    `;

    const response = await xai.chat.completions.create({
      model: "grok-2-1212",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 100
    });

    const content = response.choices[0].message.content || '{"tags":["AI","Tool"]}';
    try {
      const result = JSON.parse(content);
      if (Array.isArray(result) || Array.isArray(result.tags)) {
        const tags = Array.isArray(result) ? result : result.tags;
        return tags.filter((tag: unknown): tag is string => typeof tag === 'string').slice(0, 5);
      }
    } catch (e) {
      console.error("Failed to parse tag suggestions:", e);
    }
    
    return ["AI", "Tool"];
  } catch (error) {
    console.error("Failed to suggest tags:", error);
    return ["AI", "Tool"];
  }
}
