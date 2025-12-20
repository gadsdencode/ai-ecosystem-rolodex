import { Request, Response } from "express";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { log } from "../lib/logger";

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * POST /api/xai/suggestions - Generate usage suggestions for a tool
 */
export async function generateSuggestions(req: Request, res: Response) {
  try {
    const { toolName, toolDescription } = req.body;
    
    if (!toolName || !toolDescription) {
      return res.status(400).json({ error: 'Tool name and description are required' });
    }
    
    const prompt = `
      Tool Name: ${toolName}
      Description: ${toolDescription}
      
      Provide 3 concise, practical suggestions for how to best use this AI tool effectively.
      Format as a simple comma-separated list.
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    
    res.json({ suggestions: response.text() || "Try exploring the tool's features." });
  } catch (error) {
    log.error('Error generating suggestions', error as Error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
}

/**
 * POST /api/xai/categorize - Categorize a tool based on description
 */
export async function categorizeTool(req: Request, res: Response) {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    const validCategories = [
      "text-generation", "image-generation", "audio-generation", "video-generation",
      "data-analysis", "chatbot", "search-engine", "coding-assistant", "other"
    ];
    
    const prompt = `
      Description of an AI tool: "${description}"
      
      Based on this description, classify this tool into exactly one of the following categories: ${validCategories.join(", ")}
      
      Respond with only the category name, nothing else.
    `;
    
    const result = await model.generateContent(prompt);
    const suggestedCategory = result.response.text().trim();
    
    // Simple validation to ensure it picked a valid category
    if (validCategories.includes(suggestedCategory)) {
      res.json({ category: suggestedCategory });
    } else {
      res.json({ category: "text-generation" });
    }
  } catch (error) {
    log.error('Error categorizing tool', error as Error);
    res.status(500).json({ error: 'Failed to categorize tool' });
  }
}

/**
 * POST /api/xai/tags - Generate tags for a tool (Using JSON Mode)
 */
export async function generateTags(req: Request, res: Response) {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    const prompt = `
      Description of an AI tool: "${description}"
      
      Based on this description, suggest 3-5 relevant tags for this tool.
      Use specific, single-word or two-word tags.
    `;
    
    // Use Gemini's native JSON mode for reliability
    const jsonModel = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
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
    
    res.json({ tags: content.tags.slice(0, 5) });
  } catch (error) {
    log.error('Error generating tags', error as Error);
    // Fallback
    res.json({ tags: ["AI", "Tool"] });
  }
}
