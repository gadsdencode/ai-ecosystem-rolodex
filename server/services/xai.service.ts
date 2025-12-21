import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { log } from "../lib/logger";

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Valid categories for AI tools
const VALID_CATEGORIES = [
  "text-generation",
  "image-generation", 
  "audio-generation",
  "video-generation",
  "data-analysis",
  "chatbot",
  "search-engine",
  "coding-assistant",
  "other"
] as const;

export type ToolCategory = typeof VALID_CATEGORIES[number];

export interface SuggestionsResult {
  success: boolean;
  suggestions?: string;
  error?: string;
}

export interface CategorizeResult {
  success: boolean;
  category?: ToolCategory;
  error?: string;
}

export interface TagsResult {
  success: boolean;
  tags?: string[];
  error?: string;
}

/**
 * Generate usage suggestions for a tool based on its name and description
 */
export async function generateSuggestions(
  toolName: string,
  toolDescription: string
): Promise<SuggestionsResult> {
  try {
    const prompt = `
      Tool Name: ${toolName}
      Description: ${toolDescription}
      
      Provide 3 concise, practical suggestions for how to best use this AI tool effectively.
      Format as a simple comma-separated list.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;

    return {
      success: true,
      suggestions: response.text() || "Try exploring the tool's features."
    };
  } catch (error) {
    log.error("Error generating suggestions", error as Error);
    return {
      success: false,
      error: "Failed to generate suggestions"
    };
  }
}

/**
 * Categorize a tool based on its description
 */
export async function categorizeTool(
  description: string
): Promise<CategorizeResult> {
  try {
    const prompt = `
      Description of an AI tool: "${description}"
      
      Based on this description, classify this tool into exactly one of the following categories: ${VALID_CATEGORIES.join(", ")}
      
      Respond with only the category name, nothing else.
    `;

    const result = await model.generateContent(prompt);
    const suggestedCategory = result.response.text().trim() as ToolCategory;

    // Validate the suggested category
    if (VALID_CATEGORIES.includes(suggestedCategory)) {
      return { success: true, category: suggestedCategory };
    }

    // Default fallback
    return { success: true, category: "text-generation" };
  } catch (error) {
    log.error("Error categorizing tool", error as Error);
    return {
      success: false,
      error: "Failed to categorize tool"
    };
  }
}

/**
 * Generate relevant tags for a tool using Gemini's JSON mode
 */
export async function generateTags(description: string): Promise<TagsResult> {
  try {
    const prompt = `
      Description of an AI tool: "${description}"
      
      Based on this description, suggest 3-5 relevant tags for this tool.
      Use specific, single-word or two-word tags.
    `;

    // Use Gemini's native JSON mode for reliability
    const jsonModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            tags: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING }
            }
          }
        }
      }
    });

    const result = await jsonModel.generateContent(prompt);
    const content = JSON.parse(result.response.text());

    return {
      success: true,
      tags: content.tags.slice(0, 5)
    };
  } catch (error) {
    log.error("Error generating tags", error as Error);
    // Return fallback tags
    return {
      success: true,
      tags: ["AI", "Tool"]
    };
  }
}

/**
 * Get valid categories list (for validation purposes)
 */
export function getValidCategories(): readonly string[] {
  return VALID_CATEGORIES;
}

